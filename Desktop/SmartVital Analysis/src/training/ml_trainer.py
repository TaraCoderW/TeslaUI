import os
import joblib
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, VotingClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
from sklearn.model_selection import RandomizedSearchCV, StratifiedKFold
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, roc_curve, auc
from scipy.stats import randint, uniform

try:
    from xgboost import XGBClassifier
except ImportError:
    XGBClassifier = None

class MLTrainer:
    def __init__(self, model_dir):
        self.model_dir = model_dir

    def _get_models_and_params(self, n_samples, n_positive):
        """Build model dict with hyperparameter grids tailored to dataset size."""
        # Calculate scale_pos_weight for XGBoost (ratio of negative to positive)
        n_negative = n_samples - n_positive
        scale_pos = max(n_negative / max(n_positive, 1), 1.0)
        
        models_params = {
            'Logistic Regression': {
                'model': LogisticRegression(max_iter=2000, class_weight='balanced', random_state=42),
                'params': {
                    'C': uniform(0.01, 100),
                    'penalty': ['l1', 'l2'],
                    'solver': ['saga'],
                }
            },
            'Random Forest': {
                'model': RandomForestClassifier(class_weight='balanced', random_state=42),
                'params': {
                    'n_estimators': randint(200, 1000),
                    'max_depth': randint(8, 50),
                    'min_samples_split': randint(2, 20),
                    'min_samples_leaf': randint(1, 10),
                    'max_features': ['sqrt', 'log2', None],
                }
            },
            'Gradient Boosting': {
                'model': GradientBoostingClassifier(random_state=42),
                'params': {
                    'n_estimators': randint(200, 800),
                    'max_depth': randint(3, 12),
                    'learning_rate': uniform(0.01, 0.29),
                    'subsample': uniform(0.6, 0.4),
                    'min_samples_split': randint(2, 20),
                    'min_samples_leaf': randint(1, 10),
                }
            },
            'SVM': {
                'model': SVC(probability=True, class_weight='balanced', random_state=42),
                'params': {
                    'C': uniform(0.1, 100),
                    'gamma': ['scale', 'auto'],
                    'kernel': ['rbf', 'poly'],
                }
            },
            'KNN': {
                'model': KNeighborsClassifier(),
                'params': {
                    'n_neighbors': randint(3, 25),
                    'weights': ['uniform', 'distance'],
                    'metric': ['euclidean', 'manhattan', 'minkowski'],
                    'p': [1, 2, 3],
                }
            },
        }
        
        if XGBClassifier is not None:
            models_params['XGBoost'] = {
                'model': XGBClassifier(
                    use_label_encoder=False, 
                    eval_metric='logloss',
                    scale_pos_weight=scale_pos,
                    random_state=42,
                    tree_method='hist',
                ),
                'params': {
                    'n_estimators': randint(200, 1000),
                    'max_depth': randint(3, 12),
                    'learning_rate': uniform(0.01, 0.29),
                    'subsample': uniform(0.6, 0.4),
                    'colsample_bytree': uniform(0.5, 0.5),
                    'reg_alpha': uniform(0, 10),
                    'reg_lambda': uniform(0, 10),
                    'min_child_weight': randint(1, 10),
                    'gamma': uniform(0, 5),
                }
            }
        
        return models_params
            
    def train_and_evaluate(self, X_train, X_test, y_train, y_test, prefix):
        n_samples = len(y_train)
        n_positive = int(y_train.sum())
        n_negative = n_samples - n_positive
        
        print(f"\n{'='*60}")
        print(f"  Training {prefix.upper()} — {n_samples} samples (Pos: {n_positive}, Neg: {n_negative})")
        print(f"{'='*60}")
        
        models_params = self._get_models_and_params(n_samples, n_positive)
        
        best_f1 = 0
        best_model_name = ""
        best_model = None
        results = {}
        all_tuned_models = {}
        
        os.makedirs(self.model_dir, exist_ok=True)
        
        # Cross-validation strategy
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        
        # Determine n_iter based on dataset size (smaller datasets get more iterations)
        n_iter = 80 if n_samples < 2000 else 50
        
        for name, config in models_params.items():
            print(f"\n  >> Tuning {name}...")
            model = config['model']
            params = config['params']
            
            try:
                search = RandomizedSearchCV(
                    model, 
                    params, 
                    n_iter=n_iter,
                    cv=cv,
                    scoring='f1_weighted',
                    random_state=42,
                    n_jobs=-1,
                    verbose=0,
                    error_score='raise'
                )
                search.fit(X_train, y_train)
                
                tuned_model = search.best_estimator_
                all_tuned_models[name] = tuned_model
                y_pred = tuned_model.predict(X_test)
                
                acc = accuracy_score(y_test, y_pred)
                prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
                rec = recall_score(y_test, y_pred, average='weighted', zero_division=0)
                f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
                
                results[name] = {'Accuracy': acc, 'Precision': prec, 'Recall': rec, 'F1': f1}
                print(f"     {name}: Acc={acc:.4f}  F1={f1:.4f}  (CV best: {search.best_score_:.4f})")
                print(f"     Best params: {search.best_params_}")
                
                if f1 > best_f1:
                    best_f1 = f1
                    best_model_name = name
                    best_model = tuned_model
                    
            except Exception as e:
                print(f"     {name} failed: {e}")
                continue
        
        # --- Build Voting Ensemble from top 3 models ---
        if len(all_tuned_models) >= 3:
            print(f"\n  >> Building Voting Ensemble from top 3 models...")
            sorted_models = sorted(results.items(), key=lambda x: x[1]['F1'], reverse=True)
            top3_names = [m[0] for m in sorted_models[:3]]
            
            estimators = []
            for name in top3_names:
                estimators.append((name.replace(' ', '_'), all_tuned_models[name]))
            
            try:
                ensemble = VotingClassifier(estimators=estimators, voting='soft', n_jobs=-1)
                ensemble.fit(X_train, y_train)
                y_pred_ens = ensemble.predict(X_test)
                
                acc_e = accuracy_score(y_test, y_pred_ens)
                prec_e = precision_score(y_test, y_pred_ens, average='weighted', zero_division=0)
                rec_e = recall_score(y_test, y_pred_ens, average='weighted', zero_division=0)
                f1_e = f1_score(y_test, y_pred_ens, average='weighted', zero_division=0)
                
                results['Voting Ensemble'] = {'Accuracy': acc_e, 'Precision': prec_e, 'Recall': rec_e, 'F1': f1_e}
                print(f"     Voting Ensemble ({', '.join(top3_names)}): Acc={acc_e:.4f}  F1={f1_e:.4f}")
                
                if f1_e > best_f1:
                    best_f1 = f1_e
                    best_model_name = 'Voting Ensemble'
                    best_model = ensemble
            except Exception as e:
                print(f"     Ensemble failed: {e}")

        print(f"\n  [BEST] model for {prefix}: {best_model_name} with F1: {best_f1:.4f}")
        joblib.dump(best_model, os.path.join(self.model_dir, f'{prefix}_best_ml_model.pkl'))
        
        # Generate Confusion Matrix for best model
        y_pred = best_model.predict(X_test)
        cm = confusion_matrix(y_test, y_pred)
        plt.figure(figsize=(6,5))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
        plt.title(f'Confusion Matrix - {best_model_name}')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.savefig(os.path.join(self.model_dir, f'{prefix}_cm.png'))
        plt.close()
        
        # Save metrics report
        report_df = pd.DataFrame(results).T
        report_df.to_csv(os.path.join(self.model_dir, f'{prefix}_metrics.csv'))
        
        return best_model_name, results
