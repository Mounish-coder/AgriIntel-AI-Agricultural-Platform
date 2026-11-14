"""LSTM and GRU deep learning forecasters using PyTorch."""
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from sklearn.preprocessing import MinMaxScaler
from typing import Optional
from app.forecasting.base import BaseForecaster


class _RNNNet(nn.Module):
    def __init__(self, input_size: int, hidden_size: int, num_layers: int, cell_type: str = "lstm"):
        super().__init__()
        RNN = nn.LSTM if cell_type == "lstm" else nn.GRU
        self.rnn = RNN(input_size, hidden_size, num_layers, batch_first=True, dropout=0.2 if num_layers > 1 else 0)
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        out, _ = self.rnn(x)
        return self.fc(out[:, -1, :])


class _DeepForecasterBase(BaseForecaster):
    _cell_type = "lstm"

    def _check_availability(self):
        try:
            import torch  # noqa: F401
        except ImportError:
            raise ImportError("PyTorch is required. Install with: pip install torch")

    def fit(self, train: pd.Series, val=None, exog_train=None, exog_val=None):
        seq_len = self.config.get("seq_len", 30)
        hidden = self.config.get("hidden_size", 64)
        layers = self.config.get("num_layers", 2)
        epochs = self.config.get("epochs", 50)
        batch_size = self.config.get("batch_size", 32)
        lr = self.config.get("learning_rate", 1e-3)
        patience = self.config.get("patience", 10)

        # Scale on TRAINING data only
        self._scaler = MinMaxScaler()
        values = train.values.reshape(-1, 1)
        scaled = self._scaler.fit_transform(values).flatten()

        # Build sequences
        def make_sequences(arr, sl):
            X, y = [], []
            for i in range(len(arr) - sl):
                X.append(arr[i:i + sl])
                y.append(arr[i + sl])
            return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)

        X_train, y_train = make_sequences(scaled, seq_len)

        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._device = device
        self._seq_len = seq_len

        X_t = torch.tensor(X_train).unsqueeze(-1).to(device)
        y_t = torch.tensor(y_train).unsqueeze(-1).to(device)
        dataset = TensorDataset(X_t, y_t)
        loader = DataLoader(dataset, batch_size=batch_size, shuffle=False)

        self._net = _RNNNet(1, hidden, layers, self._cell_type).to(device)
        optim = torch.optim.Adam(self._net.parameters(), lr=lr)
        criterion = nn.MSELoss()

        best_loss = float("inf")
        no_improve = 0
        best_state = None

        for epoch in range(epochs):
            self._net.train()
            epoch_loss = 0.0
            for xb, yb in loader:
                optim.zero_grad()
                out = self._net(xb)
                loss = criterion(out, yb)
                loss.backward()
                nn.utils.clip_grad_norm_(self._net.parameters(), 1.0)
                optim.step()
                epoch_loss += loss.item()

            if epoch_loss < best_loss:
                best_loss = epoch_loss
                best_state = {k: v.clone() for k, v in self._net.state_dict().items()}
                no_improve = 0
            else:
                no_improve += 1
                if no_improve >= patience:
                    break

        if best_state:
            self._net.load_state_dict(best_state)
        self._last_seq = scaled[-seq_len:]

    def predict(self, steps: int, exog_future=None) -> np.ndarray:
        self._net.eval()
        history = list(self._last_seq)
        predictions = []
        with torch.no_grad():
            for _ in range(steps):
                x = torch.tensor(
                    np.array(history[-self._seq_len:], dtype=np.float32)
                ).unsqueeze(0).unsqueeze(-1).to(self._device)
                pred = self._net(x).item()
                predictions.append(pred)
                history.append(pred)
        # Inverse transform
        preds_arr = np.array(predictions, dtype=np.float32).reshape(-1, 1)
        return self._scaler.inverse_transform(preds_arr).flatten()


class LSTMForecaster(_DeepForecasterBase):
    name = "lstm"
    _cell_type = "lstm"


class GRUForecaster(_DeepForecasterBase):
    name = "gru"
    _cell_type = "gru"
