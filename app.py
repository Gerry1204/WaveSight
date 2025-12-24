
from flask import Flask, render_template, request
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

# 新增按鈕1事件路由
@app.route('/button1', methods=['POST'])
def button1():
    print(1)
    return '', 204



# 匯入 CSV 路由（多軸支援）
import csv
from flask import jsonify

# FFT 相關
import numpy as np

@app.route('/upload_csv', methods=['POST'])
def upload_csv():
    file = request.files.get('file')
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
                x.append(row[0])
                for i in range(1, len(header)):
                    try:
                        y_list[i-1].append(float(row[i]))
                    except:
                        y_list[i-1].append(row[i])
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
    if y_list is None or axis is None:
        return jsonify({'error': 'Missing y_list or axis'}), 400
    try:
        y = y_list[axis][start:end]
        y = np.array(y, dtype=float)
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

if __name__ == '__main__':
    app.run()
