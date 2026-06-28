import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import Dense, BatchNormalization, ReLU, Dropout
    from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("TensorFlow is not installed. DL System will run in mock mode or skip.")

class DLTrainer:
    def __init__(self, model_dir, is_multiclass=False):
        self.model_dir = model_dir
        self.is_multiclass = is_multiclass
        os.makedirs(self.model_dir, exist_ok=True)
        
    def build_model(self, input_dim):
        if not TF_AVAILABLE:
            return None
            
        model = Sequential()
        
        # Input -> Dense(256) -> BatchNorm -> ReLU -> Dropout
        model.add(Dense(256, input_dim=input_dim))
        model.add(BatchNormalization())
        model.add(ReLU())
        model.add(Dropout(0.3))
        
        # Dense(128) -> BatchNorm -> ReLU -> Dropout
        model.add(Dense(128))
        model.add(BatchNormalization())
        model.add(ReLU())
        model.add(Dropout(0.3))
        
        # Dense(64) -> ReLU
        model.add(Dense(64))
        model.add(ReLU())
        
        # Output
        if self.is_multiclass:
            model.add(Dense(2, activation='softmax')) # Example for lung cancer
        else:
            model.add(Dense(1, activation='sigmoid'))
            
        return model

    def train_and_evaluate(self, X_train, X_test, y_train, y_test, prefix):
        if not TF_AVAILABLE:
            print(f"Skipping DL Training for {prefix} (TensorFlow missing).")
            return
            
        model = self.build_model(X_train.shape[1])
        
        if self.is_multiclass:
            loss = 'sparse_categorical_crossentropy'
            model.compile(optimizer='adam', loss=loss, metrics=['accuracy'])
        else:
            loss = 'binary_crossentropy'
            model.compile(optimizer='adam', loss=loss, metrics=['accuracy'])
            
        # Callbacks
        early_stopping = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)
        checkpoint_path = os.path.join(self.model_dir, f'{prefix}_dl_model.h5')
        checkpoint = ModelCheckpoint(checkpoint_path, monitor='val_loss', save_best_only=True)
        
        print(f"Training DL Model for {prefix}...")
        history = model.fit(
            X_train, y_train,
            validation_data=(X_test, y_test),
            epochs=50,
            batch_size=32,
            callbacks=[early_stopping, checkpoint],
            verbose=0
        )
        
        # Evaluate
        loss, acc = model.evaluate(X_test, y_test, verbose=0)
        print(f"DL Model for {prefix} - Test Accuracy: {acc:.4f}")
        
        # Plot training curves
        plt.figure(figsize=(10, 4))
        plt.subplot(1, 2, 1)
        plt.plot(history.history['accuracy'], label='Train Acc')
        plt.plot(history.history['val_accuracy'], label='Val Acc')
        plt.title('Accuracy')
        plt.legend()
        
        plt.subplot(1, 2, 2)
        plt.plot(history.history['loss'], label='Train Loss')
        plt.plot(history.history['val_loss'], label='Val Loss')
        plt.title('Loss')
        plt.legend()
        
        plt.savefig(os.path.join(self.model_dir, f'{prefix}_dl_curves.png'))
        plt.close()
        
        # Also save model in Keras format explicitly
        model.save(os.path.join(self.model_dir, f'{prefix}_dl_model.keras'))
