
from flask import Flask, render_template, request
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')





# 匯入 CSV 路由（多軸支援）
import csv
from flask import jsonify

# FFT 相關
import numpy as np

@app.route('/upload_csv', methods=['POST'])
def upload_csv():
    file = request.files.get('file')
    print("Received upload_csv request")
    if not file:
        return jsonify({'error': 'No file'}), 400
    x = []
    y_list = []
    header = []
    try:
        stream = file.stream.read().decode('utf-8').splitlines()
        reader = csv.reader(stream)
        header = next(reader, None)
        if not header or len(header) < 2:
            return jsonify({'error': 'CSV 欄位不足'}), 400
        for _ in range(len(header)-1):
            y_list.append([])
        for row in reader:
            if len(row) >= 2:
                try:
                    x.append(float(row[0]))
                except ValueError:
                    x.append(row[0])
                for i in range(1, len(header)):
                    try:
                        y_list[i-1].append(float(row[i]))
                    except:
                        y_list[i-1].append(row[i])
        print(f"CSV Parsed: {len(x)} rows, {len(header)-1} cols")
        return jsonify({'x': x, 'y_list': y_list, 'header': header})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# FFT 路由
@app.route('/fft', methods=['POST'])
def fft():
    data = request.json
    y_list = data.get('y_list')  # 多軸資料，list of list
    axis = data.get('axis')      # 指定軸 index
    start = data.get('start', 0)
    end = data.get('end', None)
    sample_rate = data.get('sample_rate', 1.0)  # 可選，預設 1.0
    print(f"FFT Request: axis={axis}, start={start}, end={end}")
    if y_list is None or axis is None:
        return jsonify({'error': 'Missing y_list or axis'}), 400
    try:
        y = y_list[axis][start:end]
        try:
            y = np.array(y, dtype=float)
        except ValueError:
            return jsonify({'error': 'Selected data contains non-numeric values'}), 400
        N = len(y)
        if N == 0:
            return jsonify({'error': 'No data for FFT'}), 400
        yf = np.fft.fft(y)
        xf = np.fft.fftfreq(N, d=1.0/sample_rate)
        # 只取正頻率部分
        idx = np.arange(N//2)
        freq = xf[idx].tolist()
        amp = (2.0/N * np.abs(yf[idx])).tolist()
        return jsonify({'freq': freq, 'amp': amp})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 濾波器路由
import scipy.signal as signal

@app.route('/apply_filter', methods=['POST'])
def apply_filter():
    data = request.json
    y = data.get('y') # 單一軸數據
    filter_type = data.get('type') # 'low', 'high', 'band'
    cutoff = data.get('cutoff') # list [low, high] or float
    fs = data.get('fs', 1.0) # 取樣頻率
    order = data.get('order', 4)

    print(f"Filter Request: type={filter_type}, cutoff={cutoff}, order={order}")

    if not y or not filter_type or not cutoff:
        return jsonify({'error': 'Missing parameters'}), 400

    try:
        try:
            y = np.array(y, dtype=float)
        except ValueError:
            return jsonify({'error': 'Selected data contains non-numeric values'}), 400
        nyq = 0.5 * fs
        
        # 正規化截止頻率
        if isinstance(cutoff, list):
            normal_cutoff = [c / nyq for c in cutoff]
        else:
            normal_cutoff = cutoff / nyq

        # 設計濾波器
        if filter_type == 'band':
            b, a = signal.butter(order, normal_cutoff, btype='band')
        elif filter_type == 'low':
            b, a = signal.butter(order, normal_cutoff, btype='low')
        elif filter_type == 'high':
            b, a = signal.butter(order, normal_cutoff, btype='high')
        else:
            return jsonify({'error': 'Unknown filter type'}), 400

        # 應用濾波器 (使用 filtfilt 避免相位延遲)
        y_filtered = signal.filtfilt(b, a, y)
        
        return jsonify({'y_filtered': y_filtered.tolist()})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
