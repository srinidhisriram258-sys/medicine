import os
import json
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from sklearn.model_selection import train_test_split
import numpy as np

from ml.dataset import generate_synthetic_adherence_data, AdherenceDataset, FEATURE_NAMES
from ml.model import AdherenceRiskNet
from ml.preprocessing import train_and_save_scaler
from ml.metrics import compute_model_metrics

def main():
    print("=" * 60)
    print("MEDIADHERE AI - PYTORCH MODEL TRAINING PIPELINE")
    print("=" * 60)

    # 1. Load synthetic structured training data
    print("[1/7] Generating synthetic adherence dataset...")
    df = generate_synthetic_adherence_data(num_samples=1800, random_seed=42)
    print(f"      Total records generated: {len(df)}")
    print(f"      Class distribution: {df['risk_class'].value_counts().to_dict()}")

    # 2. Validate dataset
    print("[2/7] Validating dataset integrity...")
    assert not df.isnull().values.any(), "Dataset contains missing values!"
    assert set(FEATURE_NAMES).issubset(df.columns), "Dataset missing required feature columns!"
    print("      Dataset validation passed successfully.")

    X = df[FEATURE_NAMES].values
    y = df['risk_class'].values

    # 3. Train/Validation Split
    print("[3/7] Splitting train / validation sets (80/20)...")
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # 4. Preprocess numerical features
    print("[4/7] Preprocessing numerical features with StandardScaler...")
    models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))
    os.makedirs(models_dir, exist_ok=True)
    scaler_path = os.path.join(models_dir, "scaler.pkl")

    scaler = train_and_save_scaler(X_train, save_path=scaler_path)
    X_train_scaled = scaler.transform(X_train)
    X_val_scaled = scaler.transform(X_val)

    # PyTorch DataLoaders
    train_dataset = AdherenceDataset(X_train_scaled, y_train)
    val_dataset = AdherenceDataset(X_val_scaled, y_val)

    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=64, shuffle=False)

    # 5. Train PyTorch Model
    print("[5/7] Initializing PyTorch AdherenceRiskNet model...")
    model = AdherenceRiskNet(input_dim=len(FEATURE_NAMES), num_classes=3, dropout_rate=0.2)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.003, weight_decay=1e-4)

    epochs = 45
    print(f"      Training on CPU for {epochs} epochs...")
    model.train()
    for epoch in range(1, epochs + 1):
        total_loss = 0.0
        for batch_X, batch_y in train_loader:
            optimizer.zero_grad()
            outputs = model(batch_X)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item() * len(batch_y)
        
        if epoch % 15 == 0 or epoch == epochs:
            avg_loss = total_loss / len(train_dataset)
            print(f"      Epoch {epoch}/{epochs} - Train Loss: {avg_loss:.4f}")

    # 6. Calculate validation metrics
    print("[6/7] Evaluating model performance on validation set...")
    model.eval()
    val_preds = []
    val_targets = []
    with torch.no_grad():
        for batch_X, batch_y in val_loader:
            logits = model(batch_X)
            preds = torch.argmax(logits, dim=1)
            val_preds.extend(preds.cpu().numpy())
            val_targets.extend(batch_y.cpu().numpy())

    val_preds = np.array(val_preds)
    val_targets = np.array(val_targets)

    metrics = compute_model_metrics(val_targets, val_preds)
    print(f"      Validation Accuracy : {metrics['accuracy'] * 100:.2f}%")
    print(f"      Validation F1 Score : {metrics['f1_score']:.4f}")
    print(f"      Confusion Matrix   : {metrics['confusion_matrix']}")

    # 7. Save Checkpoint & Metrics
    print("[7/7] Saving trained checkpoint and metrics report...")
    checkpoint_path = os.path.join(models_dir, "adherence_risk_model.pth")
    metrics_path = os.path.join(models_dir, "metrics.json")

    torch.save(model.state_dict(), checkpoint_path)
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"[OK] Model checkpoint saved to: {checkpoint_path}")
    print(f"[OK] Preprocessor saved to    : {scaler_path}")
    print(f"[OK] Metrics saved to         : {metrics_path}")
    print("=" * 60)
    print("TRAINING COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    main()
