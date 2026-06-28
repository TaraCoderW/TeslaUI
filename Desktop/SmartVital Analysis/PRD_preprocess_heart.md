# PRD: Heart Disease Preprocessing Pipeline
## SmartVital Project — `preprocess_heart.py`

---

## 1. PURPOSE

Produce a single importable Python module `preprocess_heart.py` that:
- Ingests the raw `heart.csv` file
- Cleans, encodes, scales, and splits the data
- Returns four NumPy arrays ready for ML/DL model training
- Is reusable via a single function call from any model script

---

## 2. INPUT FILE

| Property | Detail |
|----------|--------|
| Filename | `heart.csv` |
| Rows | 918 |
| Columns | 12 |
| Target column | `HeartDisease` (0 = No Disease, 1 = Has Disease) |
| Missing values | 0 (none — confirmed via `isnull().sum()`) |
| Class balance | 508 positive (55.3%) / 410 negative (44.7%) → balanced, no SMOTE needed |

### 2.1 Column Reference

| Column | Type | Values | Role |
|--------|------|--------|------|
| `Age` | int | 28–77 | Numeric feature |
| `Sex` | str | M, F | Binary categorical → encode |
| `ChestPainType` | str | ATA, NAP, ASY, TA | Multi-category → one-hot |
| `RestingBP` | int | 0–200 | Numeric feature — **has impossible zeros** |
| `Cholesterol` | int | 0–603 | Numeric feature — **172 zeros = missing data** |
| `FastingBS` | int | 0, 1 | Already binary numeric — keep as-is |
| `RestingECG` | str | Normal, ST, LVH | Multi-category → one-hot |
| `MaxHR` | int | 60–202 | Numeric feature |
| `ExerciseAngina` | str | Y, N | Binary categorical → encode |
| `Oldpeak` | float | -2.6–6.2 | Numeric feature — 368 zeros are **valid** (no ST depression) |
| `ST_Slope` | str | Up, Flat, Down | Multi-category → one-hot |
| `HeartDisease` | int | 0, 1 | **TARGET — do not include in X** |

---

## 3. DATA QUALITY ISSUES TO FIX

### Issue 1 — RestingBP = 0 (1 row)
- **Row index:** 449
- **Problem:** Blood pressure of 0 is biologically impossible in a living patient
- **Fix:** Replace with median of all valid (non-zero) RestingBP values
- **Median value:** 130.0
```python
median_bp = df[df['RestingBP'] > 0]['RestingBP'].median()
df['RestingBP'] = df['RestingBP'].replace(0, median_bp)
```

### Issue 2 — Cholesterol = 0 (172 rows = 18.7% of dataset)
- **Problem:** Cholesterol of 0 is biologically impossible — these are missing values recorded as 0
- **Fix:** Replace all zeros with the median of valid (non-zero) Cholesterol values
- **Do NOT use mean** — median is robust to outliers (max Cholesterol = 603)
```python
median_chol = df[df['Cholesterol'] > 0]['Cholesterol'].median()
df['Cholesterol'] = df['Cholesterol'].replace(0, median_chol)
```

### Issue 3 — Oldpeak zeros (368 rows) — DO NOT FIX
- **These are valid.** Oldpeak = 0 means no ST depression was observed.
- Do not impute or replace these.

---

## 4. ENCODING REQUIREMENTS

### 4.1 Label Encoding (binary text columns)
Use `.map()` to replace string values with 0/1 integers.

| Column | Mapping |
|--------|---------|
| `Sex` | M → 1, F → 0 |
| `ExerciseAngina` | Y → 1, N → 0 |

```python
df['Sex'] = df['Sex'].map({'M': 1, 'F': 0})
df['ExerciseAngina'] = df['ExerciseAngina'].map({'Y': 1, 'N': 0})
```

### 4.2 One-Hot Encoding (multi-category columns)
Use `pd.get_dummies()`. Set `drop_first=False` to retain all categories for model interpretability.

| Column | Categories | New Columns Created |
|--------|-----------|---------------------|
| `ChestPainType` | ASY, ATA, NAP, TA | 4 columns |
| `RestingECG` | LVH, Normal, ST | 3 columns |
| `ST_Slope` | Down, Flat, Up | 3 columns |

```python
df = pd.get_dummies(
    df,
    columns=['ChestPainType', 'RestingECG', 'ST_Slope'],
    drop_first=False
)
```

**Expected shape after encoding:** (918, 20)
- Started with 12 columns
- Removed 3 original text columns
- Added 10 new one-hot columns
- Net result: 12 - 3 + 10 = 19 columns total (18 features + 1 target)

---

## 5. FEATURE / TARGET SEPARATION

```python
X = df.drop('HeartDisease', axis=1)   # shape: (918, 18)
y = df['HeartDisease']                 # shape: (918,)
```

**Features list after encoding (18 total):**
`Age, Sex, RestingBP, Cholesterol, FastingBS, MaxHR, ExerciseAngina, Oldpeak,
ChestPainType_ASY, ChestPainType_ATA, ChestPainType_NAP, ChestPainType_TA,
RestingECG_LVH, RestingECG_Normal, RestingECG_ST,
ST_Slope_Down, ST_Slope_Flat, ST_Slope_Up`

---

## 6. TRAIN / TEST SPLIT

| Parameter | Value | Reason |
|-----------|-------|--------|
| `test_size` | 0.2 | 80/20 split — industry standard |
| `random_state` | 42 | Reproducibility — same split every run |
| `stratify` | y | Preserves 55/45 class ratio in both sets |

```python
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)
```

**Expected sizes:**
- `X_train`: (734, 18) — model trains on these
- `X_test`: (184, 18) — model never sees these until evaluation

---

## 7. FEATURE SCALING

Use `StandardScaler` (zero mean, unit variance). Apply in this exact order:

```python
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)   # fit + transform on train
X_test_scaled  = scaler.transform(X_test)         # transform only on test
```

**Critical rule:** Never call `fit_transform` on test data. The scaler must learn parameters only from training data. Fitting on test data causes data leakage.

---

## 8. FUNCTION SIGNATURE

Wrap the entire pipeline in one function for clean imports:

```python
def preprocess_heart(filepath: str) -> tuple:
    """
    Args:
        filepath (str): Path to heart.csv

    Returns:
        X_train_scaled (np.ndarray): shape (734, 18)
        X_test_scaled  (np.ndarray): shape (184, 18)
        y_train        (pd.Series):  shape (734,)
        y_test         (pd.Series):  shape (184,)
        scaler         (StandardScaler): fitted scaler for inverse_transform later
        feature_names  (list): list of 18 feature column names (for SHAP later)
    """
```

**Usage from model scripts:**
```python
from preprocess_heart import preprocess_heart

X_train, X_test, y_train, y_test, scaler, feature_names = preprocess_heart('heart.csv')
# Ready. Pass directly to any sklearn model or Keras model.
```

---

## 9. COMPLETE PROCESSING ORDER

Execute steps in this exact sequence — order matters:

```
1. Load CSV with pd.read_csv()
2. Fix RestingBP = 0  → replace with median(RestingBP > 0)
3. Fix Cholesterol = 0 → replace with median(Cholesterol > 0)
4. Label encode: Sex, ExerciseAngina
5. One-hot encode: ChestPainType, RestingECG, ST_Slope
6. Separate X and y
7. Train/test split (80/20, stratified, random_state=42)
8. StandardScaler: fit_transform on X_train, transform on X_test
9. Return: X_train_scaled, X_test_scaled, y_train, y_test, scaler, feature_names
```

---

## 10. IMPORTS REQUIRED

```python
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
```

No additional libraries needed. All are available in standard scikit-learn + pandas.

---

## 11. VALIDATION CHECKS

After running, the function must print/assert these values to confirm correctness:

| Check | Expected Value |
|-------|---------------|
| `X_train_scaled.shape` | (734, 18) |
| `X_test_scaled.shape` | (184, 18) |
| `y_train.shape` | (734,) |
| `y_test.shape` | (184,) |
| `len(feature_names)` | 18 |
| `X_train_scaled.mean()` | ~0.0 (post-scaling) |
| `X_train_scaled.std()` | ~1.0 (post-scaling) |
| `(df['RestingBP'] == 0).sum()` | 0 (after fix) |
| `(df['Cholesterol'] == 0).sum()` | 0 (after fix) |
| No NaN values in X_train or X_test | True |

---

## 12. OUTPUT CONTRACT

This function's outputs feed directly into:
- `ml_heart.py` — Logistic Regression, Random Forest, XGBoost, SVM
- `dl_heart.py` — Custom ANN (TensorFlow/Keras)
- `explain_heart.py` — SHAP/LIME explainability (needs `feature_names`)

The `scaler` object must be returned so it can be reused during inference (when IoT sensor data comes in live, it must be scaled with the same parameters).

---

## 13. FILE TO PRODUCE

**Filename:** `preprocess_heart.py`
**Location:** Root of project folder
**No CLI arguments needed** — filepath is passed as a function argument
**`if __name__ == "__main__"` block** — include for standalone testing with a hardcoded path
