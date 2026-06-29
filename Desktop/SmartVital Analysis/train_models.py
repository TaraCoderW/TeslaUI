import sys
import os

sys.path.append(os.getcwd())
import joblib
from sklearn.ensemble import RandomForestClassifier
from src.preprocessing.data_pipeline import HeartDataPipeline, StrokeDataPipeline, DiabetesDataPipeline, LungCancerDataPipeline

for PipeCls, name, model_path in [
    (HeartDataPipeline, 'heart', 'models/heart/heart_new_model.pkl'),
    (StrokeDataPipeline, 'stroke', 'models/stroke/stroke_new_model.pkl'),
    (DiabetesDataPipeline, 'diabetes', 'models/diabetes/diabetes_new_model.pkl'),
    (LungCancerDataPipeline, 'lung', 'models/lung/lung_cancer_new_model.pkl')
]:
    pipe = PipeCls()
    X, y = pipe.prepare_training_data()
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    joblib.dump(model, model_path)
    print(f'Trained {name}')
