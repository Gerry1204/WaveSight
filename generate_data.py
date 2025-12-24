import csv
import numpy as np

# 設定參數
num_points = 1000  # 資料點數
sample_rate = 100.0  # 取樣頻率 (Hz)
t = np.linspace(0, num_points / sample_rate, num_points, endpoint=False)

# 產生訊號
# 訊號 1: 低頻訊號 (2 Hz) + 些微雜訊
freq1 = 2
y1 = 10 * np.sin(2 * np.pi * freq1 * t) + np.random.normal(0, 0.5, num_points)

# 訊號 2: 高頻訊號 (20 Hz)
freq2 = 20
y2 = 5 * np.sin(2 * np.pi * freq2 * t)

# 訊號 3: 混合訊號 (2 Hz + 20 Hz + 直流偏置)
y3 = y1 + y2 + 50

# 寫入 CSV
filename = 'sample_data.csv'
header = ['Time', 'Low_Freq_2Hz', 'High_Freq_20Hz', 'Mixed_Signal']

with open(filename, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(header)
    for i in range(num_points):
        # Format numbers to 3 decimal places for cleaner CSV
        row = [
            f"{t[i]:.3f}",
            f"{y1[i]:.3f}",
            f"{y2[i]:.3f}",
            f"{y3[i]:.3f}"
        ]
        writer.writerow(row)

print(f"已產生範例檔案: {filename}")
print(f"資料點數: {num_points}, 取樣頻率: {sample_rate} Hz")
