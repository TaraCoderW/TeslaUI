import sys
import os

sys.path.append(os.getcwd())
from src.preprocessing.data_pipeline import HeartDataPipeline, StrokeDataPipeline, DiabetesDataPipeline, LungCancerDataPipeline

def test_heart():
    print("Testing Heart Pipeline...")
    pipe = HeartDataPipeline()
    X, y = pipe.prepare_training_data()
    print("Heart Pipeline Success! Shape:", X.shape)

def test_stroke():
    print("Testing Stroke Pipeline...")
    pipe = StrokeDataPipeline()
    X, y = pipe.prepare_training_data()
    print("Stroke Pipeline Success! Shape:", X.shape)

def test_diabetes():
    print("Testing Diabetes Pipeline...")
    pipe = DiabetesDataPipeline()
    X, y = pipe.prepare_training_data()
    print("Diabetes Pipeline Success! Shape:", X.shape)

def test_lung():
    print("Testing Lung Cancer Pipeline...")
    pipe = LungCancerDataPipeline()
    X, y = pipe.prepare_training_data()
    print("Lung Cancer Pipeline Success! Shape:", X.shape)

if __name__ == "__main__":
    test_heart()
    test_stroke()
    test_diabetes()
    test_lung()
