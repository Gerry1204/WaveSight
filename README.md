# WaveSight

WaveSight 是一個基於 Flask 的 Web 應用程式，專門設計用於上傳、視覺化及分析 CSV 數據。它特別支援多軸數據的讀取以及快速傅立葉變換 (FFT) 分析。

## 功能特點

- **CSV 檔案上傳**：支援上傳包含多個數據列的 CSV 檔案。程式會自動將第一欄視為 X 軸，後續欄位視為不同的 Y 軸數據系列。
- **FFT 分析**：針對選定的數據軸及範圍執行 FFT 分析，並回傳頻率 (Frequency) 與振幅 (Amplitude) 數據。
- **互動式介面**：提供 Web 介面，支援深色模式 (Dark Mode) 與響應式設計。

## 設計與使用者體驗 (Design & UX)

- **自動載入範例 (Auto-load Demo)**：
  - 啟動時自動載入混和訊號 (Mixed Signal, 2Hz+20Hz+Noise) 供立即測試。
  - 可透過「選擇範例」下拉選單切換 **低頻 (2Hz)**、**高頻 (20Hz)** 或 **混和訊號**。
- **動態介面 (Dynamic UI)**：
  - **智慧標籤**：下拉選單標籤會根據目前狀態顯示「選擇範例」或「選擇軸」。
  - **防呆機制**：疊圖比較與第二軸選擇功能預設為停用，直到匯入第二個 CSV 檔案後才會啟用。
  - **深色模式**：點擊導覽列的太陽/月亮圖示可切換介面主題。

## 安裝與執行

### 先決條件

請確保您的系統已安裝 Python 3.x。

### 安裝依賴套件

本專案需要 Flask 和 NumPy。你可以使用 pip 安裝：
(注意：目前的 requirements.txt 可能未包含 numpy，請手動安裝或參考以下指令)

```bash
pip install flask numpy
```

### 啟動應用程式

使用以下指令啟動 Flask 伺服器：

```bash
python app.py
```

啟動後，請在瀏覽器中開啟 `http://127.0.0.1:5000/`。

## API 說明

### 1. 上傳 CSV (`/upload_csv`)

- **Method**: `POST`
- **參數**: `file` (CSV 檔案)
- **回應**: JSON 格式，包含 `x` (X 軸數據), `y_list` (多軸 Y 數據), `header` (欄位名稱)。

### 2. 執行 FFT (`/fft`)

- **Method**: `POST`
- **Body (JSON)**:
  - `y_list`: 多軸數據列表 (List of List)
  - `axis`: 要分析的軸索引 (Index)
  - `start`:起始索引 (預設 0)
  - `end`: 結束索引 (可選)
  - `sample_rate`: 取樣率 (預設 1.0)
- **回應**: JSON 格式，包含 `freq` (頻率) 和 `amp` (振幅)。

## 專案結構

- `app.py`: 主應用程式邏輯與路由。
- `templates/index.html`: 前端介面。
- `static/`: 靜態資源目錄。
- `requirements.txt`: 依賴套件列表。

## 預留功能 (Planned/Reserved Features)

以下介面元素目前僅為預覽，功能尚未實作：

1. **使用者系統**：登入、登出、個人檔案 (Profile)、儀表板 (Dashboard)。
2. **通知系統**：鈴鐺圖示通知功能。
3. **設定**：齒輪圖示全域設定功能。
