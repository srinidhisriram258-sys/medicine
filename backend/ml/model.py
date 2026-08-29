import torch
import torch.nn as nn
import torch.nn.functional as F

class AdherenceRiskNet(nn.Module):
    """
    PyTorch Neural Network for Adherence Risk Prediction.
    Architecture:
      Input (16) -> Linear(64) -> ReLU -> Dropout(0.2) -> Linear(32) -> ReLU -> Linear(3)
    Classes:
      0 = LOW ADHERENCE RISK
      1 = MEDIUM ADHERENCE RISK
      2 = HIGH ADHERENCE RISK
    """
    def __init__(self, input_dim: int = 16, num_classes: int = 3, dropout_rate: float = 0.2):
        super(AdherenceRiskNet, self).__init__()
        self.fc1 = nn.Linear(input_dim, 64)
        self.relu1 = nn.ReLU()
        self.dropout = nn.Dropout(dropout_rate)
        self.fc2 = nn.Linear(64, 32)
        self.relu2 = nn.ReLU()
        self.fc3 = nn.Linear(32, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.fc1(x)
        x = self.relu1(x)
        x = self.dropout(x)
        x = self.fc2(x)
        x = self.relu2(x)
        x = self.fc3(x)
        return x

    def predict_proba(self, x: torch.Tensor) -> torch.Tensor:
        """
        Returns class probabilities via Softmax.
        """
        self.eval()
        with torch.no_grad():
            logits = self.forward(x)
            probabilities = F.softmax(logits, dim=1)
        return probabilities
