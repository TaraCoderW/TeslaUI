import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
import os

class BasePipeline:
    def __init__(self, dataset_path, model_dir):
        self.dataset_path = dataset_path
        self.model_dir = model_dir
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.training_columns = None
        
    def save_artifacts(self, prefix):
        os.makedirs(self.model_dir, exist_ok=True)
        joblib.dump(self.scaler, os.path.join(self.model_dir, f'{prefix}_scaler.pkl'))
        joblib.dump(self.label_encoders, os.path.join(self.model_dir, f'{prefix}_encoders.pkl'))
        joblib.dump(self.training_columns, os.path.join(self.model_dir, f'{prefix}_columns.pkl'))

    def load_artifacts(self, prefix):
        scaler_path = os.path.join(self.model_dir, f'{prefix}_scaler.pkl')
        if os.path.exists(scaler_path):
            self.scaler = joblib.load(scaler_path)
        encoders_path = os.path.join(self.model_dir, f'{prefix}_encoders.pkl')
        if os.path.exists(encoders_path):
            self.label_encoders = joblib.load(encoders_path)
        cols_path = os.path.join(self.model_dir, f'{prefix}_columns.pkl')
        if os.path.exists(cols_path):
            self.training_columns = joblib.load(cols_path)

    def _align_columns(self, df):
        if self.training_columns is not None:
            for col in self.training_columns:
                if col not in df.columns:
                    df[col] = 0
            df = df[self.training_columns]
        return df


class HeartDataPipeline(BasePipeline):
    def __init__(self, dataset_path='datasets/heart_new.csv', model_dir='models/heart/'):
        super().__init__(dataset_path, model_dir)
        self.features = ['Age', 'Heart Rate', 'Diabetes', 'Family History', 'Smoking', 'Alcohol Consumption', 'Exercise Hours Per Week', 'Diet']
        
    def process_data(self, df, training=True):
        df = df.copy()
        
        if "Diet" in df.columns:
            mapping_diet = {"Unhealthy": -1, "Average": 0, "Healthy": 1}
            df["Diet"] = df["Diet"].map(mapping_diet).fillna(0).astype(int)
            
        available_features = [c for c in self.features if c in df.columns]
        df = df[available_features]
        
        df.fillna(df.median(numeric_only=True), inplace=True)
        if len(df.columns) > 0:
            df.fillna(df.mode().iloc[0], inplace=True)
        
        if training:
            if len(available_features) > 0:
                df[available_features] = self.scaler.fit_transform(df[available_features])
            self.training_columns = df.columns.tolist()
            self.save_artifacts('heart')
        else:
            if self.training_columns is None and os.path.exists(self.dataset_path):
                self.prepare_training_data()
            df = self._align_columns(df)
            available_features = [c for c in self.features if c in df.columns]
            if len(available_features) > 0:
                df[available_features] = self.scaler.transform(df[available_features])
            
        return df

    def prepare_training_data(self):
        df = pd.read_csv(self.dataset_path)
        if 'Heart Attack Risk' in df.columns:
            y = df['Heart Attack Risk']
            X = df.drop('Heart Attack Risk', axis=1)
        else:
            y = pd.Series([0]*len(df))
            X = df
        X = self.process_data(X, training=True)
        return X, y


class StrokeDataPipeline(BasePipeline):
    def __init__(self, dataset_path='datasets/stroke_new.csv', model_dir='models/stroke/'):
        super().__init__(dataset_path, model_dir)
        self.num_cols = ['age', 'avg_glucose_level', 'bmi']
        self.cat_cols = ['gender', 'hypertension', 'heart_disease', 'ever_married', 'work_type', 'Residence_type', 'smoking_status']

    def process_data(self, df, training=True):
        df = df.copy()
        if 'id' in df.columns:
            df = df.drop('id', axis=1)
            
        df.fillna(df.median(numeric_only=True), inplace=True)
        if len(df.columns) > 0:
            df.fillna(df.mode().iloc[0], inplace=True)
        
        cat_cols_present = [c for c in self.cat_cols if c in df.columns]
        if len(cat_cols_present) > 0:
            df = pd.get_dummies(df, columns=cat_cols_present, drop_first=False, dtype=int)
        
        available_num = [c for c in self.num_cols if c in df.columns]
                    
        if training:
            if len(available_num) > 0:
                df[available_num] = self.scaler.fit_transform(df[available_num])
            self.training_columns = df.columns.tolist()
            self.save_artifacts('stroke')
        else:
            if self.training_columns is None and os.path.exists(self.dataset_path):
                self.prepare_training_data()
            df = self._align_columns(df)
            available_num = [c for c in self.num_cols if c in df.columns]
            if len(available_num) > 0:
                df[available_num] = self.scaler.transform(df[available_num])
            
        return df

    def prepare_training_data(self):
        df = pd.read_csv(self.dataset_path)
        y = df['stroke'] if 'stroke' in df.columns else pd.Series([0]*len(df))
        X = df.drop('stroke', axis=1) if 'stroke' in df.columns else df
        X = self.process_data(X, training=True)
        return X, y


class DiabetesDataPipeline(BasePipeline):
    def __init__(self, dataset_path='datasets/diabetes_new.csv', model_dir='models/diabetes/'):
        super().__init__(dataset_path, model_dir)
        self.num_cols = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age']
        self.cat_cols = []

    def process_data(self, df, training=True):
        df = df.copy()
        df.fillna(df.median(numeric_only=True), inplace=True)
        if len(df.columns) > 0:
            df.fillna(df.mode().iloc[0], inplace=True)
        
        available_num = [c for c in self.num_cols if c in df.columns]
        
        if training:
            if len(available_num) > 0:
                df[available_num] = self.scaler.fit_transform(df[available_num])
            self.training_columns = df.columns.tolist()
            self.save_artifacts('diabetes')
        else:
            if self.training_columns is None and os.path.exists(self.dataset_path):
                self.prepare_training_data()
            df = self._align_columns(df)
            available_num = [c for c in self.num_cols if c in df.columns]
            if len(available_num) > 0:
                df[available_num] = self.scaler.transform(df[available_num])
            
        return df

    def prepare_training_data(self):
        df = pd.read_csv(self.dataset_path)
        y = df['Outcome'] if 'Outcome' in df.columns else pd.Series([0]*len(df))
        X = df.drop('Outcome', axis=1) if 'Outcome' in df.columns else df
        X = self.process_data(X, training=True)
        return X, y


class LungCancerDataPipeline(BasePipeline):
    def __init__(self, dataset_path='datasets/lung_cancer_new.csv', model_dir='models/lung/'):
        super().__init__(dataset_path, model_dir)
        self.num_cols = ['AGE']
        self.cat_cols = ['GENDER', 'SMOKING', 'YELLOW_FINGERS', 'ANXIETY', 'PEER_PRESSURE', 
                         'CHRONIC DISEASE', 'FATIGUE', 'ALLERGY', 'WHEEZING', 'ALCOHOL CONSUMING', 
                         'COUGHING', 'SHORTNESS OF BREATH', 'SWALLOWING DIFFICULTY', 'CHEST PAIN']

    def process_data(self, df, training=True):
        df = df.copy()
        
        # Fix column names formatting (remove trailing spaces)
        df.columns = [c.strip() for c in df.columns]
        self.cat_cols = [c.strip() for c in self.cat_cols]
        
        cat_cols_present = [c for c in self.cat_cols if c in df.columns]
        if len(cat_cols_present) > 0:
            df = pd.get_dummies(df, columns=cat_cols_present, drop_first=False, dtype=int)
        
        available_num = [c for c in self.num_cols if c in df.columns]
        if training:
            if len(available_num) > 0:
                df[available_num] = self.scaler.fit_transform(df[available_num])
            self.training_columns = df.columns.tolist()
            self.save_artifacts('lung')
        else:
            if self.training_columns is None and os.path.exists(self.dataset_path):
                self.prepare_training_data()
            df = self._align_columns(df)
            available_num = [c for c in self.num_cols if c in df.columns]
            if len(available_num) > 0:
                df[available_num] = self.scaler.transform(df[available_num])
            
        return df

    def prepare_training_data(self):
        df = pd.read_csv(self.dataset_path)
        df.columns = [c.strip() for c in df.columns]
        y = df['LUNG_CANCER'].apply(lambda x: 1 if str(x).upper() == 'YES' else 0) if 'LUNG_CANCER' in df.columns else pd.Series([0]*len(df))
        X = df.drop('LUNG_CANCER', axis=1) if 'LUNG_CANCER' in df.columns else df
        X = self.process_data(X, training=True)
        return X, y
