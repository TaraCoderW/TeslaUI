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
        self.training_columns = None  # Save column order after OneHotEncoding
        
    def save_artifacts(self, prefix):
        os.makedirs(self.model_dir, exist_ok=True)
        joblib.dump(self.scaler, os.path.join(self.model_dir, f'{prefix}_scaler.pkl'))
        joblib.dump(self.label_encoders, os.path.join(self.model_dir, f'{prefix}_encoders.pkl'))
        joblib.dump(self.training_columns, os.path.join(self.model_dir, f'{prefix}_columns.pkl'))

    def load_artifacts(self, prefix):
        self.scaler = joblib.load(os.path.join(self.model_dir, f'{prefix}_scaler.pkl'))
        self.label_encoders = joblib.load(os.path.join(self.model_dir, f'{prefix}_encoders.pkl'))
        cols_path = os.path.join(self.model_dir, f'{prefix}_columns.pkl')
        if os.path.exists(cols_path):
            self.training_columns = joblib.load(cols_path)

    def _align_columns(self, df):
        """Align OneHotEncoded columns with training columns."""
        if self.training_columns is not None:
            # Add missing columns as 0
            for col in self.training_columns:
                if col not in df.columns:
                    df[col] = 0
            # Keep only training columns in correct order
            df = df[self.training_columns]
        return df


class HeartDataPipeline(BasePipeline):
    def __init__(self, dataset_path='datasets/heart.csv', model_dir='models/heart/'):
        super().__init__(dataset_path, model_dir)
        self.num_cols = ['Age', 'RestingBP', 'Cholesterol', 'MaxHR', 'Oldpeak',
                         'BP_HR_Ratio', 'Cholesterol_Age', 'Exercise_Risk']
        self.cat_cols = ['Sex', 'ChestPainType', 'FastingBS', 'RestingECG', 'ExerciseAngina', 'ST_Slope']

    def engineer_features(self, df):
        # Fix Cholesterol=0 (known data quality issue — replace with median)
        if 'Cholesterol' in df.columns:
            median_chol = df.loc[df['Cholesterol'] > 0, 'Cholesterol'].median()
            if pd.isna(median_chol):
                median_chol = 200  # clinical default
            df['Cholesterol'] = df['Cholesterol'].replace(0, median_chol)
        
        # Hemodynamic stress indicator
        if 'RestingBP' in df.columns and 'MaxHR' in df.columns:
            df['BP_HR_Ratio'] = df['RestingBP'] / df['MaxHR'].replace(0, 1)
        else:
            df['BP_HR_Ratio'] = 0
            
        # Age-adjusted cholesterol risk
        if 'Cholesterol' in df.columns and 'Age' in df.columns:
            df['Cholesterol_Age'] = df['Cholesterol'] * df['Age'] / 100.0
        else:
            df['Cholesterol_Age'] = 0
            
        # Exercise-induced ischemia score
        if 'Oldpeak' in df.columns and 'ExerciseAngina' in df.columns:
            df['Exercise_Risk'] = df['Oldpeak'] * (df['ExerciseAngina'].apply(
                lambda x: 1.0 if str(x).upper() in ['Y', 'YES', '1'] else 0.0
            ))
        else:
            df['Exercise_Risk'] = 0
            
        return df

    def process_data(self, df, training=True):
        df = df.copy()
        
        # Drop ID and dataset columns if present
        for col in ['id', 'dataset']:
            if col in df.columns:
                df = df.drop(col, axis=1)
                
        df = self.engineer_features(df)
        
        # Handle missing values
        df.fillna(df.median(numeric_only=True), inplace=True)
        df.fillna(df.mode().iloc[0], inplace=True)
        
        # OneHotEncode categorical variables
        df = pd.get_dummies(df, columns=self.cat_cols, drop_first=False, dtype=int)
        
        # Ensure num_cols exist
        available_num = [c for c in self.num_cols if c in df.columns]
        
        # Scaling numerical features
        if training:
            df[available_num] = self.scaler.fit_transform(df[available_num])
            self.training_columns = df.columns.tolist()
            self.save_artifacts('heart')
        else:
            df = self._align_columns(df)
            available_num = [c for c in self.num_cols if c in df.columns]
            df[available_num] = self.scaler.transform(df[available_num])
            
        return df

    def prepare_training_data(self):
        df = pd.read_csv(self.dataset_path)
        y = df['HeartDisease']
        X = df.drop('HeartDisease', axis=1)
        X = self.process_data(X, training=True)
        return X, y


class StrokeDataPipeline(BasePipeline):
    def __init__(self, dataset_path='datasets/stroke.csv', model_dir='models/stroke/'):
        super().__init__(dataset_path, model_dir)
        self.num_cols = ['age', 'avg_glucose_level', 'bmi', 'CV_Risk_Index', 'Glucose_Risk_Flag', 'Age_Risk_Flag']
        self.cat_cols = ['gender', 'hypertension', 'heart_disease', 'ever_married', 'work_type', 'residence_type', 'smoking_status']

    def engineer_features(self, df):
        # Standardize Residence_type to residence_type
        if 'Residence_type' in df.columns:
            df.rename(columns={'Residence_type': 'residence_type'}, inplace=True)
            
        # BMI cleanup
        if 'bmi' in df.columns:
            df['bmi'] = pd.to_numeric(df['bmi'], errors='coerce')
            df['bmi'] = df['bmi'].fillna(df['bmi'].median())
            
        # Cardiovascular Risk Index
        if 'bmi' in df.columns and 'age' in df.columns:
            df['CV_Risk_Index'] = (df['age'] * df['bmi']) / 100.0
        else:
            df['CV_Risk_Index'] = 0
        
        # Hyperglycemia flag
        if 'avg_glucose_level' in df.columns:
            df['Glucose_Risk_Flag'] = (df['avg_glucose_level'] > 200).astype(int)
        else:
            df['Glucose_Risk_Flag'] = 0
            
        # Age risk flag
        if 'age' in df.columns:
            df['Age_Risk_Flag'] = (df['age'] > 60).astype(int)
        else:
            df['Age_Risk_Flag'] = 0
            
        return df

    def process_data(self, df, training=True):
        df = df.copy()
        if 'id' in df.columns:
            df = df.drop('id', axis=1)
            
        df = self.engineer_features(df)
        
        df.fillna(df.median(numeric_only=True), inplace=True)
        df.fillna(df.mode().iloc[0], inplace=True)
        
        # OneHotEncode categorical variables
        df = pd.get_dummies(df, columns=self.cat_cols, drop_first=False, dtype=int)
        
        available_num = [c for c in self.num_cols if c in df.columns]
                    
        if training:
            df[available_num] = self.scaler.fit_transform(df[available_num])
            self.training_columns = df.columns.tolist()
            self.save_artifacts('stroke')
        else:
            df = self._align_columns(df)
            available_num = [c for c in self.num_cols if c in df.columns]
            df[available_num] = self.scaler.transform(df[available_num])
            
        return df

    def prepare_training_data(self):
        df = pd.read_csv(self.dataset_path)
        # Clean up: remove rare 'Other' gender
        df = df[df['gender'] != 'Other']
        y = df['stroke']
        X = df.drop('stroke', axis=1)
        X = self.process_data(X, training=True)
        return X, y


class DiabetesDataPipeline(BasePipeline):
    def __init__(self, dataset_path='datasets/diabetes_prediction_dataset.csv', model_dir='models/diabetes/'):
        super().__init__(dataset_path, model_dir)
        self.num_cols = ['age', 'bmi', 'HbA1c_level', 'blood_glucose_level',
                         'BMI_Glucose_Interaction', 'Age_BMI_Risk', 'HbA1c_Risk_Flag']
        self.cat_cols = ['gender', 'hypertension', 'heart_disease', 'smoking_history']

    def engineer_features(self, df):
        # BMI-Glucose interaction
        if 'bmi' in df.columns and 'blood_glucose_level' in df.columns:
            df['BMI_Glucose_Interaction'] = df['bmi'] * df['blood_glucose_level'] / 100.0
        else:
            df['BMI_Glucose_Interaction'] = 0
            
        # Clinical diabetes threshold
        if 'HbA1c_level' in df.columns:
            df['HbA1c_Risk_Flag'] = (df['HbA1c_level'] >= 6.5).astype(int)
        else:
            df['HbA1c_Risk_Flag'] = 0
            
        # Age-BMI risk
        if 'age' in df.columns and 'bmi' in df.columns:
            df['Age_BMI_Risk'] = df['age'] * df['bmi'] / 100.0
        else:
            df['Age_BMI_Risk'] = 0
            
        return df

    def process_data(self, df, training=True):
        df = df.copy()
        
        df.fillna(df.median(numeric_only=True), inplace=True)
        df.fillna(df.mode().iloc[0], inplace=True)
        
        df = self.engineer_features(df)
        
        # OneHotEncode categorical variables
        df = pd.get_dummies(df, columns=self.cat_cols, drop_first=False, dtype=int)
        
        available_num = [c for c in self.num_cols if c in df.columns]
        
        if training:
            df[available_num] = self.scaler.fit_transform(df[available_num])
            self.training_columns = df.columns.tolist()
            self.save_artifacts('diabetes')
        else:
            df = self._align_columns(df)
            available_num = [c for c in self.num_cols if c in df.columns]
            df[available_num] = self.scaler.transform(df[available_num])
            
        return df

    def prepare_training_data(self):
        df = pd.read_csv(self.dataset_path)
        y = df['diabetes']
        X = df.drop('diabetes', axis=1)
        X = self.process_data(X, training=True)
        return X, y


class LungCancerDataPipeline(BasePipeline):
    def __init__(self, dataset_path='datasets/survey lung cancer.csv', model_dir='models/lung/'):
        super().__init__(dataset_path, model_dir)
        self.num_cols = ['AGE', 'Smoking_Severity', 'Env_Exposure_Score']
        self.cat_cols = ['GENDER', 'SMOKING', 'YELLOW_FINGERS', 'ANXIETY', 'PEER_PRESSURE', 
                         'CHRONIC DISEASE', 'FATIGUE', 'ALLERGY', 'WHEEZING', 'ALCOHOL CONSUMING', 
                         'COUGHING', 'SHORTNESS OF BREATH', 'SWALLOWING DIFFICULTY', 'CHEST PAIN']

    def engineer_features(self, df):
        # Map features to 0 and 1 instead of 1 and 2
        for col in df.columns:
            if col not in ['GENDER', 'AGE', 'LUNG_CANCER'] and col in df.columns:
                df[col] = df[col].apply(lambda x: 1 if str(x) == '2' else 0)
                
        # 1. Smoking Severity (combining smoking, yellow fingers)
        if 'SMOKING' in df.columns and 'YELLOW_FINGERS' in df.columns:
            df['Smoking_Severity'] = df['SMOKING'] + df['YELLOW_FINGERS']
            
        # 2. Environmental Exposure / General Symptoms Score
        symptom_cols = ['COUGHING', 'SHORTNESS OF BREATH', 'CHEST PAIN', 'WHEEZING']
        available_symptoms = [c for c in symptom_cols if c in df.columns]
        df['Env_Exposure_Score'] = df[available_symptoms].sum(axis=1) if available_symptoms else 0
        return df

    def process_data(self, df, training=True):
        df = df.copy()
        
        # Fix column names formatting
        df.columns = [c.strip() for c in df.columns]
        self.cat_cols = [c.strip() for c in self.cat_cols]
        
        df = self.engineer_features(df)
        
        # OneHotEncode categorical variables
        cat_cols_present = [c for c in self.cat_cols if c in df.columns]
        df = pd.get_dummies(df, columns=cat_cols_present, drop_first=False, dtype=int)
        
        # Ensure num_cols exist
        available_num = [c for c in self.num_cols if c in df.columns]
        if training:
            df[available_num] = self.scaler.fit_transform(df[available_num])
            self.training_columns = df.columns.tolist()
            self.save_artifacts('lung')
        else:
            df = self._align_columns(df)
            available_num = [c for c in self.num_cols if c in df.columns]
            df[available_num] = self.scaler.transform(df[available_num])
            
        return df

    def prepare_training_data(self):
        df = pd.read_csv(self.dataset_path)
        df.columns = [c.strip() for c in df.columns]
        y = df['LUNG_CANCER'].apply(lambda x: 1 if x == 'YES' else 0)
        X = df.drop('LUNG_CANCER', axis=1)
        X = self.process_data(X, training=True)
        return X, y
