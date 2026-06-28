import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

import numpy as np
from src.preprocessing.data_pipeline import HeartDataPipeline, StrokeDataPipeline, DiabetesDataPipeline, LungCancerDataPipeline
from src.training.ml_trainer import MLTrainer
from src.training.dl_trainer import DLTrainer
from sklearn.model_selection import train_test_split

try:
    from imblearn.over_sampling import SMOTE
    HAS_SMOTE = True
except ImportError:
    HAS_SMOTE = False
    print("WARNING: imblearn not installed. SMOTE will be skipped. Install with: pip install imbalanced-learn")

def train_disease_model(pipeline, ml_trainer, dl_trainer, prefix, use_smote=False):
    print(f"\n{'='*60}")
    print(f"  PREPARING DATA FOR {prefix.upper()}")
    print(f"{'='*60}")
    try:
        X, y = pipeline.prepare_training_data()
        
        # Stratified split to preserve class ratios
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print(f"  Dataset size: {len(X)} samples")
        print(f"  Train: {len(X_train)} | Test: {len(X_test)}")
        print(f"  Class distribution (train): {dict(zip(*np.unique(y_train, return_counts=True)))}")
        
        # Apply SMOTE for imbalanced datasets
        if use_smote and HAS_SMOTE:
            class_counts = dict(zip(*np.unique(y_train, return_counts=True)))
            minority = min(class_counts.values())
            majority = max(class_counts.values())
            imbalance_ratio = majority / max(minority, 1)
            
            if imbalance_ratio > 3:
                print(f"  [WARNING] Imbalance ratio: {imbalance_ratio:.1f}x - Applying SMOTE...")
                sm = SMOTE(random_state=42, k_neighbors=min(5, minority - 1) if minority > 1 else 1)
                X_train, y_train = sm.fit_resample(X_train, y_train)
                print(f"  After SMOTE: {len(X_train)} samples")
                print(f"  Class distribution (after SMOTE): {dict(zip(*np.unique(y_train, return_counts=True)))}")
            else:
                print(f"  Class balance OK (ratio: {imbalance_ratio:.1f}x) — Skipping SMOTE")
        
        # Train ML models with hyperparameter tuning
        best_ml, metrics = ml_trainer.train_and_evaluate(X_train, X_test, y_train, y_test, prefix)
        
        # Train DL (optional, for comparison)
        try:
            dl_trainer.train_and_evaluate(X_train, X_test, y_train, y_test, prefix)
        except Exception as e:
            print(f"  DL training skipped for {prefix}: {e}")
        
        print(f"\n  [DONE] Finished {prefix}.\n")
    except Exception as e:
        print(f"  [ERROR] Failed to train {prefix}: {e}")
        import traceback
        traceback.print_exc()

def main():
    # Heart Disease
    heart_pipe = HeartDataPipeline()
    ml_trainer_heart = MLTrainer('models/heart')
    dl_trainer_heart = DLTrainer('models/heart')
    train_disease_model(heart_pipe, ml_trainer_heart, dl_trainer_heart, 'heart', use_smote=True)
    
    # Stroke (heavily imbalanced — ~5% positive)
    stroke_pipe = StrokeDataPipeline()
    ml_trainer_stroke = MLTrainer('models/stroke')
    dl_trainer_stroke = DLTrainer('models/stroke')
    train_disease_model(stroke_pipe, ml_trainer_stroke, dl_trainer_stroke, 'stroke', use_smote=True)
    
    # Diabetes
    diabetes_pipe = DiabetesDataPipeline()
    ml_trainer_diabetes = MLTrainer('models/diabetes')
    dl_trainer_diabetes = DLTrainer('models/diabetes')
    train_disease_model(diabetes_pipe, ml_trainer_diabetes, dl_trainer_diabetes, 'diabetes', use_smote=True)
    
    # Lung Cancer (small dataset — SMOTE helps)
    lung_pipe = LungCancerDataPipeline()
    ml_trainer_lung = MLTrainer('models/lung')
    dl_trainer_lung = DLTrainer('models/lung', is_multiclass=True)
    train_disease_model(lung_pipe, ml_trainer_lung, dl_trainer_lung, 'lung', use_smote=True)

if __name__ == '__main__':
    main()
