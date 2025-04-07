import os
import pandas as pd

# カルマンフィルタのクラス定義
class KalmanFilter:
    def __init__(self, process_variance=0.01, measurement_variance=0.1):
        self.process_variance = process_variance  # プロセスノイズの分散
        self.measurement_variance = measurement_variance  # 測定ノイズの分散
        self.estimated_value = 0.0  # 推定値
        self.estimate_uncertainty = 1.0  # 推定の不確かさ

    def update(self, measurement):
        # カルマンゲインの計算
        kalman_gain = self.estimate_uncertainty / (self.estimate_uncertainty + self.measurement_variance)
        
        # 推定値の更新
        self.estimated_value = self.estimated_value + kalman_gain * (measurement - self.estimated_value)
        
        # 不確かさの更新
        self.estimate_uncertainty = (1 - kalman_gain) * self.estimate_uncertainty + self.process_variance

        return self.estimated_value

# CSVファイルを読み込み、カルマンフィルタを適用する関数
def apply_kalman_filter(input_csv, output_csv):
    # CSVファイルを読み込む
    df = pd.read_csv(input_csv)

    # カルマンフィルタのインスタンス作成
    kf_x = KalmanFilter()
    kf_y = KalmanFilter()
    kf_z = KalmanFilter()

    # 各軸に対してカルマンフィルタを適用
    df["X_filtered"] = df["X (m/s^2)"].apply(kf_x.update)
    df["Y_filtered"] = df["Y (m/s^2)"].apply(kf_y.update)
    df["Z_filtered"] = df["Z (m/s^2)"].apply(kf_z.update)

    # フィルタ適用後のデータを新しいCSVファイルに保存
    df.to_csv(output_csv, index=False)
    print(f"Filtered data saved to {output_csv}")

# 実行例
input_file = "./animation/data/Accelerometer_8.csv"  # 入力CSVファイル
output_file = "./animation/data/Filterd_Accelerometer_8.csv"  # 出力CSVファイル
apply_kalman_filter(input_file, output_file)