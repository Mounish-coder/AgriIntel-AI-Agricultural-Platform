"""
Evaluation metrics for time-series forecasting.
All functions work on numpy arrays or lists of actual/predicted values.
"""
import numpy as np


def mae(actual: np.ndarray, predicted: np.ndarray) -> float:
    actual, predicted = np.asarray(actual, dtype=float), np.asarray(predicted, dtype=float)
    return float(np.mean(np.abs(actual - predicted)))


def rmse(actual: np.ndarray, predicted: np.ndarray) -> float:
    actual, predicted = np.asarray(actual, dtype=float), np.asarray(predicted, dtype=float)
    return float(np.sqrt(np.mean((actual - predicted) ** 2)))


def mape(actual: np.ndarray, predicted: np.ndarray, eps: float = 1e-8) -> float:
    """Mean Absolute Percentage Error. Guarded against zero/near-zero actuals."""
    actual, predicted = np.asarray(actual, dtype=float), np.asarray(predicted, dtype=float)
    mask = np.abs(actual) > eps
    if mask.sum() == 0:
        return float("nan")
    return float(np.mean(np.abs((actual[mask] - predicted[mask]) / actual[mask])) * 100)


def smape(actual: np.ndarray, predicted: np.ndarray, eps: float = 1e-8) -> float:
    """Symmetric MAPE — bounded between 0 and 200."""
    actual, predicted = np.asarray(actual, dtype=float), np.asarray(predicted, dtype=float)
    denom = (np.abs(actual) + np.abs(predicted)) / 2.0
    mask = denom > eps
    if mask.sum() == 0:
        return float("nan")
    return float(np.mean(np.abs(actual[mask] - predicted[mask]) / denom[mask]) * 100)


def wape(actual: np.ndarray, predicted: np.ndarray, eps: float = 1e-8) -> float:
    """Weighted Absolute Percentage Error."""
    actual, predicted = np.asarray(actual, dtype=float), np.asarray(predicted, dtype=float)
    total = np.sum(np.abs(actual))
    if total < eps:
        return float("nan")
    return float(np.sum(np.abs(actual - predicted)) / total * 100)


def r2_score(actual: np.ndarray, predicted: np.ndarray) -> float:
    actual, predicted = np.asarray(actual, dtype=float), np.asarray(predicted, dtype=float)
    ss_res = np.sum((actual - predicted) ** 2)
    ss_tot = np.sum((actual - np.mean(actual)) ** 2)
    if ss_tot == 0:
        return float("nan")
    return float(1 - ss_res / ss_tot)


def compute_all_metrics(actual: np.ndarray, predicted: np.ndarray) -> dict:
    return {
        "mae": mae(actual, predicted),
        "rmse": rmse(actual, predicted),
        "mape": mape(actual, predicted),
        "smape": smape(actual, predicted),
        "wape": wape(actual, predicted),
        "r2": r2_score(actual, predicted),
    }


def chronological_split(
    df,
    target_col: str,
    train_ratio: float = 0.7,
    val_ratio: float = 0.15,
) -> tuple:
    """
    Splits a time-indexed DataFrame chronologically into train / validation / test sets.
    NEVER shuffles. Test set is never touched during model selection.
    """
    n = len(df)
    train_end = int(n * train_ratio)
    val_end = int(n * (train_ratio + val_ratio))

    train = df.iloc[:train_end]
    val = df.iloc[train_end:val_end]
    test = df.iloc[val_end:]

    return train, val, test
