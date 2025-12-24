// 疊圖比較分頁顯示時自動調整圖表大小
document.addEventListener("DOMContentLoaded", function () {
  var compareTab = document.getElementById("compare-tab");
  if (compareTab) {
    compareTab.addEventListener("shown.bs.tab", function () {
      var compareDiv = document.getElementById("comparePlot");
      if (
        compareDiv &&
        compareDiv.parentElement &&
        compareDiv.data &&
        compareDiv.data.length > 0
      ) {
        let width = compareDiv.parentElement.offsetWidth;
        let height = compareDiv.parentElement.offsetHeight;
        Plotly.relayout("comparePlot", { width: width, height: height });
        console.log("Compare plot resized to:", width, height);
      }
    });
  }
  window.addEventListener("resize", function () {
    var compareDiv = document.getElementById("comparePlot");
    if (
      compareDiv &&
      compareDiv.parentElement &&
      compareDiv.data &&
      compareDiv.data.length > 0
    ) {
      let width = compareDiv.parentElement.offsetWidth;
      let height = compareDiv.parentElement.offsetHeight;
      Plotly.relayout("comparePlot", { width: width, height: height });
    }
  });
});
// 第二組資料全域變數
let globalTableHeader2 = null;
let globalTableX2 = null;
let globalTableYList2 = null;

// 匯入第二組檔案
document.addEventListener("DOMContentLoaded", function () {
  var btnImport2 = document.getElementById("import-csv2-btn");
  if (btnImport2) {
    btnImport2.addEventListener("click", function () {
      var input = document.createElement("input");
      input.type = "file";
      input.accept = ".csv";
      input.style.display = "none";
      document.body.appendChild(input);
      input.click();
      input.addEventListener("change", function () {
        var file = input.files[0];
        // ...原本的檔案上傳與解析流程...
        if (file) {
          var formData = new FormData();
          formData.append("file", file);
          fetch("/upload_csv", {
            method: "POST",
            body: formData,
          })
            .then((res) => res.json())
            .then((json) => {
              if (json.x && json.y_list && json.header) {
                globalTableHeader2 = json.header;
                globalTableX2 = json.x;
                globalTableYList2 = json.y_list;
                console.log(
                  "CSV2 Uploaded. Header:",
                  json.header,
                  "Rows:",
                  json.x.length
                );
                console.log("匯入檔案2 詳細資料 (json):", json);
                console.log(
                  "CSV2 Uploaded. Header:",
                  json.header,
                  "Rows:",
                  json.x.length
                );
                // 動態填入軸2選單
                const axis2Select = document.getElementById("axis2-select");
                if (axis2Select && globalTableHeader2) {
                  axis2Select.innerHTML = "";
                  for (let i = 1; i < globalTableHeader2.length; i++) {
                    const opt = document.createElement("option");
                    opt.value = i - 1;
                    opt.textContent = globalTableHeader2[i];
                    axis2Select.appendChild(opt);
                  }
                }

                // Enable controls dependent on CSV2
                const axis2 = document.getElementById("axis2-select");
                if (axis2) axis2.disabled = false;
                const compareBtn = document.getElementById("compare-btn");
                if (compareBtn) compareBtn.disabled = false;
              }
            });
        }
        document.body.removeChild(input);
      });
    });
  }
});
// FFT 分頁顯示時自動調整圖表大小
document.addEventListener("DOMContentLoaded", function () {
  var fftTab = document.getElementById("fft-tab");
  if (fftTab) {
    fftTab.addEventListener("shown.bs.tab", function () {
      let fftDiv = document.getElementById("fftPlot");
      if (
        fftDiv &&
        fftDiv.parentElement &&
        fftDiv.data &&
        fftDiv.data.length > 0
      ) {
        let width = fftDiv.parentElement.offsetWidth;
        let height = fftDiv.parentElement.offsetHeight;
        Plotly.relayout("fftPlot", { width: width, height: height });
      }
    });
  }
  // 視窗縮放時也自動調整
  window.addEventListener("resize", function () {
    let fftDiv = document.getElementById("fftPlot");
    if (
      fftDiv &&
      fftDiv.parentElement &&
      fftDiv.data &&
      fftDiv.data.length > 0
    ) {
      let width = fftDiv.parentElement.offsetWidth;
      let height = fftDiv.parentElement.offsetHeight;
      Plotly.relayout("fftPlot", { width: width, height: height });
    }
  });
});
// 全域變數保存多軸資料
let globalTableHeader = null;
let globalTableX = null;
let globalTableYList = null;

// 按鈕5點擊事件：下載圖表資料為 CSV
document.addEventListener("DOMContentLoaded", function () {
  var saveBtn = document.getElementById("save-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      console.log("save-btn clicked");
      const target = document.getElementById("save-target").value;
      const type = document.getElementById("save-type").value;
      console.log("準備儲存 - 目標:", target, "類型:", type);
      try {
        // 儲存圖表/表格/FFT/疊圖
        if (target === "chart_original") {
          // 儲存原始資料 (CSV from global data)
          if (type === "csv") {
            if (!globalTableX || !globalTableYList) {
              console.warn("Save Error: No data to save.");
              alert("沒有可儲存的資料");
              return;
            }
            let csvHeader = "x";
            for (let i = 0; i < globalTableYList.length; i++) {
              csvHeader += ",y" + (i + 1);
            }
            csvHeader += "\n";
            let csvRows = [];
            for (let row = 0; row < globalTableX.length; row++) {
              let line = [globalTableX[row]];
              for (let col = 0; col < globalTableYList.length; col++) {
                line.push(globalTableYList[col][row]);
              }
              csvRows.push(line.join(","));
            }
            let csv = csvHeader + csvRows.join("\n");
            var blob = new Blob([csv], { type: "text/csv" });
            if (window.showSaveFilePicker) {
              (async () => {
                const handle = await window.showSaveFilePicker({
                  suggestedName: "original_chart.csv",
                  types: [
                    {
                      description: "CSV 檔案",
                      accept: { "text/csv": [".csv"] },
                    },
                  ],
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
              })();
            } else {
              var url = URL.createObjectURL(blob);
              var a = document.createElement("a");
              a.href = url;
              a.download = "original_chart.csv";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
          } else if (type === "png") {
            if (window.Plotly && document.getElementById("myPlot")) {
              saveBtn.disabled = true;
              Plotly.downloadImage("myPlot", {
                format: type,
                filename: "chart_original",
              })
                .then(function () {
                  saveBtn.disabled = false;
                })
                .catch(function (error) {
                  console.error(error);
                  saveBtn.disabled = false;
                });
            }
          } else {
            alert("此格式不支援");
          }
        } else if (target === "chart_current") {
          // 儲存目前圖表 (包含平均線、濾波等所有 visible trace)
          if (type === "csv") {
            let plotDiv = document.getElementById("myPlot");
            if (!plotDiv || !plotDiv.data) {
              alert("目前沒有圖表資料");
              return;
            }
            // 抓取所有 visible 的 trace 數據
            // 結構：x, trace1_y, trace2_y ...
            // 注意不同 trace 的 x 可能長度不同 (例如平均線 x 點數較少)
            // 為了存成單一 CSV，通常需要對齊 X 軸，或簡單地將它們分開存/合併存
            // 這裡採用簡單合併：Time, Trace1_Name, Trace1_Val, Trace2_Name, Trace2_Val...
            // 或是更簡單的：把所有 traces 的 x,y 依序寫入 (x1, y1, x2, y2...)

            let csvContent = "";
            let maxRows = 0;
            // 先找出所有 visible traces
            let visibleTraces = plotDiv.data.filter(
              (t) => t.visible === true || t.visible === undefined
            ); // undefined usually means visible in Plotly

            if (visibleTraces.length === 0) {
              alert("目前圖表沒有可見的數據");
              return;
            }

            // 構建標頭
            let headerArr = [];
            visibleTraces.forEach((t, i) => {
              let name = t.name || `Trace${i}`;
              headerArr.push(`${name}_x`);
              headerArr.push(`${name}_y`);
              if (t.x.length > maxRows) maxRows = t.x.length;
            });
            csvContent += headerArr.join(",") + "\n";

            // 構建內容
            for (let i = 0; i < maxRows; i++) {
              let rowData = [];
              visibleTraces.forEach((t) => {
                let xVal = t.x && i < t.x.length ? t.x[i] : "";
                let yVal = t.y && i < t.y.length ? t.y[i] : "";
                rowData.push(xVal);
                rowData.push(yVal);
              });
              csvContent += rowData.join(",") + "\n";
            }

            var blob = new Blob([csvContent], { type: "text/csv" });
            var url = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = url;
            a.download = "current_chart.csv";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } else if (type === "png") {
            if (window.Plotly && document.getElementById("myPlot")) {
              saveBtn.disabled = true;
              Plotly.downloadImage("myPlot", {
                format: type,
                filename: "chart_current",
              })
                .then(function () {
                  saveBtn.disabled = false;
                })
                .catch(function (error) {
                  console.error(error);
                  saveBtn.disabled = false;
                });
            }
          }
        } else if (target === "table") {
          if (type === "csv") {
            // 儲存表格 csv
            $("#myTable").DataTable().button(".buttons-csv").trigger();
          } else {
            alert("表格僅支援 CSV 匯出");
          }
        } else if (target === "fft") {
          if (type === "csv") {
            // 匯出 FFT 頻譜 csv
            let fftDiv = document.getElementById("fftPlot");
            if (!fftDiv || !fftDiv.data || !fftDiv.data[0]) {
              alert("請先產生 FFT 圖");
              return;
            }
            let x = fftDiv.data[0].x;
            let y = fftDiv.data[0].y;
            let csv = "freq,amp\n";
            for (let i = 0; i < x.length; i++) {
              csv += x[i] + "," + y[i] + "\n";
            }
            var blob = new Blob([csv], { type: "text/csv" });
            if (window.showSaveFilePicker) {
              (async () => {
                const handle = await window.showSaveFilePicker({
                  suggestedName: "fft.csv",
                  types: [
                    {
                      description: "CSV 檔案",
                      accept: { "text/csv": [".csv"] },
                    },
                  ],
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
              })();
            } else {
              var url = URL.createObjectURL(blob);
              var a = document.createElement("a");
              a.href = url;
              a.download = "fft.csv";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
          } else if (type === "png") {
            if (window.Plotly && document.getElementById("fftPlot")) {
              saveBtn.disabled = true;
              Plotly.downloadImage("fftPlot", {
                format: type,
                filename: "fft",
              })
                .then(function () {
                  saveBtn.disabled = false;
                })
                .catch(function (e) {
                  console.error("Plotly.downloadImage error:", e);
                  saveBtn.disabled = false;
                });
            }
          }
        } else if (target === "compare") {
          if (type === "csv") {
            // 匯出疊圖 csv（x, y1, y2 格式，僅支援兩條線）
            var compareDiv = document.getElementById("comparePlot");
            if (!compareDiv || !compareDiv.data || compareDiv.data.length < 2) {
              alert("請先產生疊圖");
              return;
            }
            let x1 = compareDiv.data[0].x,
              y1 = compareDiv.data[0].y,
              x2 = compareDiv.data[1].x,
              y2 = compareDiv.data[1].y;
            let csv = "x,y1,y2\n";
            let len = Math.max(x1.length, x2.length);
            for (let i = 0; i < len; i++) {
              csv +=
                (x1[i] ?? "") +
                "," +
                (y1[i] ?? "") +
                "," +
                (y2[i] ?? "") +
                "\n";
            }
            var blob = new Blob([csv], { type: "text/csv" });
            if (window.showSaveFilePicker) {
              (async () => {
                const handle = await window.showSaveFilePicker({
                  suggestedName: "compare.csv",
                  types: [
                    {
                      description: "CSV 檔案",
                      accept: { "text/csv": [".csv"] },
                    },
                  ],
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
              })();
            } else {
              var url = URL.createObjectURL(blob);
              var a = document.createElement("a");
              a.href = url;
              a.download = "compare.csv";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
          } else if (type === "png") {
            var compareDiv = document.getElementById("comparePlot");
            if (
              !compareDiv ||
              !compareDiv.data ||
              compareDiv.data.length === 0
            ) {
              alert("請先產生疊圖");
              return;
            }
            if (window.Plotly) {
              saveBtn.disabled = true;
              Plotly.downloadImage("comparePlot", {
                format: type,
                filename: "compare",
              })
                .then(function () {
                  saveBtn.disabled = false;
                })
                .catch(function (e) {
                  console.error("Plotly.downloadImage error:", e);
                  saveBtn.disabled = false;
                });
            }
          }
        }
      } catch (err) {
        console.error("Save-btn error:", err);
        alert("儲存時發生錯誤，請檢查 console log。");
      }
    });
  }
});
// FFT 分析按鈕事件
// 疊圖比較按鈕事件
document.addEventListener("DOMContentLoaded", function () {
  var compareBtn = document.getElementById("compare-btn");
  if (compareBtn) {
    compareBtn.addEventListener("click", function () {
      // 取得選擇的軸
      const axisIdx1 = parseInt(document.getElementById("axis-select").value);
      const axisIdx2 = parseInt(document.getElementById("axis2-select").value);
      if (
        !globalTableYList ||
        !globalTableYList[axisIdx1] ||
        !globalTableYList2 ||
        !globalTableYList2[axisIdx2]
      ) {
        console.warn("Compare Error: Missing data or invalid axis selection.");
        alert("請先載入兩組檔案並選擇軸");
        return;
      }
      console.log("Compare Plot: Axis1=", axisIdx1, "Axis2=", axisIdx2);

      // 檢查X軸類型是否一致
      let x1 = globalTableX;
      let x2 = globalTableX2;
      let isNum1 = x1.length > 0 && typeof x1[0] === "number";
      let isNum2 = x2.length > 0 && typeof x2[0] === "number";
      let xTitle = "x";

      if (isNum1 !== isNum2) {
        console.warn("X軸類型不一致 (數值 vs 字串)，改用索引繪製");
        // 產生索引陣列
        x1 = Array.from({ length: x1.length }, (_, i) => i);
        x2 = Array.from({ length: x2.length }, (_, i) => i);
        xTitle = "Index (X軸類型不符)";
      }

      // 畫疊圖
      let trace1 = {
        x: x1,
        y: globalTableYList[axisIdx1],
        type: "scatter",
        mode: "lines",
        name: globalTableHeader ? globalTableHeader[axisIdx1 + 1] : "檔案1",
        line: { color: "#FF0000", width: 2 },
      };
      let trace2 = {
        x: x2,
        y: globalTableYList2[axisIdx2],
        type: "scatter",
        mode: "lines",
        name: globalTableHeader2 ? globalTableHeader2[axisIdx2 + 1] : "檔案2",
        line: { color: "#808080", width: 2 },
      };
      let layout = {
        title: "疊圖比較",
        xaxis: {
          title: xTitle,
          gridcolor:
            document.documentElement.getAttribute("data-bs-theme") === "dark"
              ? "rgba(255, 255, 255, 0.15)"
              : "#ddd",
          zerolinecolor:
            document.documentElement.getAttribute("data-bs-theme") === "dark"
              ? "rgba(255, 255, 255, 0.15)"
              : "#ddd",
        },
        yaxis: {
          title: "y",
          gridcolor:
            document.documentElement.getAttribute("data-bs-theme") === "dark"
              ? "rgba(255, 255, 255, 0.15)"
              : "#ddd",
          zerolinecolor:
            document.documentElement.getAttribute("data-bs-theme") === "dark"
              ? "rgba(255, 255, 255, 0.15)"
              : "#ddd",
        },
        plot_bgcolor:
          document.documentElement.getAttribute("data-bs-theme") === "dark"
            ? "#212529"
            : "#f4f6fa",
        paper_bgcolor:
          document.documentElement.getAttribute("data-bs-theme") === "dark"
            ? "#212529"
            : "#f4f6fa",
      };
      var compareDiv = document.getElementById("comparePlot");
      let parent =
        compareDiv && compareDiv.parentElement
          ? compareDiv.parentElement
          : null;
      let width = parent ? parent.offsetWidth : 600;
      let height = parent ? parent.offsetHeight : 400;
      Plotly.newPlot("comparePlot", [trace1, trace2], layout, {
        responsive: true,
        displayModeBar: true,
      });
      Plotly.relayout("comparePlot", { width: width, height: height });
      // 自動切換到疊圖分頁
      let compareTab = document.getElementById("compare-tab");
      if (compareTab) compareTab.click();
    });
  }
});
var fftBtn = document.getElementById("fft-btn");
if (fftBtn) {
  fftBtn.addEventListener("click", function () {
    // 取得目前選擇的軸、範圍
    const axisIdx = parseInt(document.getElementById("axis-select").value);
    const start = parseInt(document.getElementById("range-start").value);
    const end = parseInt(document.getElementById("range-end").value) + 1;
    if (!globalTableYList || !globalTableYList[axisIdx]) {
      console.warn("FFT Error: No data loaded.");
      alert("請先載入資料並選擇軸");
      return;
    }

    // Loading State
    const originalText = fftBtn.innerHTML;
    fftBtn.disabled = true;
    fftBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 分析中...';

    const restoreBtn = () => {
      fftBtn.disabled = false;
      fftBtn.innerHTML = originalText;
    };

    console.log("FFT Request: Axis=", axisIdx, "Range=", start, "~", end);
    // 送出 FFT 請求
    fetch("/fft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        y_list: globalTableYList,
        axis: axisIdx,
        start: start,
        end: end,
        sample_rate: 1.0,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          alert("FFT 錯誤: " + json.error);
          restoreBtn();
          return;
        }
        // 畫 FFT 結果於 FFT 分頁
        let freq = json.freq;
        let amp = json.amp;
        let fftTrace = {
          x: freq,
          y: amp,
          type: "scatter",
          mode: "lines",
          name: "FFT 頻譜",
          // FFT 紫色
          line: { width: 2, color: "#9400D3" },
        };
        let layout = {
          title: "FFT 頻譜圖",
          xaxis: {
            title: "頻率 (Hz)",
            gridcolor:
              document.documentElement.getAttribute("data-bs-theme") === "dark"
                ? "rgba(255, 255, 255, 0.15)"
                : "#ddd",
            zerolinecolor:
              document.documentElement.getAttribute("data-bs-theme") === "dark"
                ? "rgba(255, 255, 255, 0.15)"
                : "#ddd",
          },
          yaxis: {
            title: "幅值",
            gridcolor:
              document.documentElement.getAttribute("data-bs-theme") === "dark"
                ? "rgba(255, 255, 255, 0.15)"
                : "#ddd",
            zerolinecolor:
              document.documentElement.getAttribute("data-bs-theme") === "dark"
                ? "rgba(255, 255, 255, 0.15)"
                : "#ddd",
          },
          plot_bgcolor:
            document.documentElement.getAttribute("data-bs-theme") === "dark"
              ? "#212529"
              : "#f4f6fa",
          paper_bgcolor:
            document.documentElement.getAttribute("data-bs-theme") === "dark"
              ? "#212529"
              : "#f4f6fa",
        };
        // 取得容器大小自動調整
        let fftDiv = document.getElementById("fftPlot");
        let parent =
          fftDiv && fftDiv.parentElement ? fftDiv.parentElement : null;
        let width = parent ? parent.offsetWidth : 600;
        let height = parent ? parent.offsetHeight : 400;
        Plotly.newPlot("fftPlot", [fftTrace], layout, {
          responsive: true,
          displayModeBar: true,
        });
        Plotly.relayout("fftPlot", { width: width, height: height });
        // 自動切換到 FFT 分頁
        let fftTab = document.getElementById("fft-tab");
        if (fftTab) fftTab.click();

        restoreBtn();
      })
      .catch((err) => {
        alert("FFT 請求失敗: " + err);
        restoreBtn();
      });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // 按鈕4：匯入 CSV
  var btn4 = document.getElementById("import-csv-btn");
  if (btn4) {
    btn4.addEventListener("click", function () {
      // 建立隱藏檔案 input
      var input = document.createElement("input");
      input.type = "file";
      input.accept = ".csv";
      input.style.display = "none";
      document.body.appendChild(input);
      input.click();
      input.addEventListener("change", function () {
        var file = input.files[0];
        if (file) {
          var formData = new FormData();
          formData.append("file", file);
          fetch("/upload_csv", {
            method: "POST",
            body: formData,
          })
            .then((res) => res.json())
            .then((json) => {
              console.log(
                "CSV Uploaded. Header:",
                json.header,
                "Rows:",
                json.x ? json.x.length : 0
              );
              console.log("匯入檔案1 詳細資料 (json):", json);
              if (json.x && json.y_list && json.header) {
                const lbl = document.getElementById("axis-label");
                if (lbl) lbl.innerText = "選擇軸：";
                window.isDemoMode = false;
                chartData = [];
                // Reset layout to ensure axis types are re-inferred (fixes string vs number axis issue)
                layout = {
                  title: "",
                  autosize: true,
                  margin: { l: 40, r: 20, t: 40, b: 40 },
                  yaxis: {
                    title: "",
                    automargin: true,
                    gridcolor:
                      document.documentElement.getAttribute("data-bs-theme") ===
                      "dark"
                        ? "rgba(255, 255, 255, 0.15)"
                        : "#ddd",
                    zerolinecolor:
                      document.documentElement.getAttribute("data-bs-theme") ===
                      "dark"
                        ? "rgba(255, 255, 255, 0.15)"
                        : "#ddd",
                  },
                  xaxis: {
                    title: "",
                    gridcolor:
                      document.documentElement.getAttribute("data-bs-theme") ===
                      "dark"
                        ? "rgba(255, 255, 255, 0.15)"
                        : "#ddd",
                    zerolinecolor:
                      document.documentElement.getAttribute("data-bs-theme") ===
                      "dark"
                        ? "rgba(255, 255, 255, 0.15)"
                        : "#ddd",
                  },
                  plot_bgcolor:
                    document.documentElement.getAttribute("data-bs-theme") ===
                    "dark"
                      ? "#212529"
                      : "#f4f6fa",
                  paper_bgcolor:
                    document.documentElement.getAttribute("data-bs-theme") ===
                    "dark"
                      ? "#212529"
                      : "#f4f6fa",
                };

                // 三軸配色：紅、綠、藍
                const axisColors = ["#FF0000", "#008000", "#0000FF"];
                for (let i = 0; i < json.y_list.length; i++) {
                  chartData.push({
                    x: json.x,
                    y: json.y_list[i],
                    type: "scatter",
                    mode: "lines+markers",
                    name: json.header[i + 1] || `y${i + 1}`,
                    line: {
                      width: 2,
                      color: axisColors[i % axisColors.length],
                    },
                    marker: {
                      size: 4,
                      color: axisColors[i % axisColors.length],
                    },
                  });
                }
                // 儲存到全域
                globalTableHeader = json.header;
                globalTableX = json.x;
                globalTableYList = json.y_list;
                console.log("全域變數更新:", {
                  globalTableHeader: globalTableHeader,
                  "globalTableX.length": globalTableX.length,
                  "globalTableYList.length": globalTableYList.length,
                });
                // 動態填入軸選單
                const axisSelect = document.getElementById("axis-select");
                if (axisSelect && globalTableHeader) {
                  axisSelect.innerHTML = "";
                  for (let i = 1; i < globalTableHeader.length; i++) {
                    const opt = document.createElement("option");
                    opt.value = i - 1; // y_list index
                    opt.textContent = globalTableHeader[i];
                    axisSelect.appendChild(opt);
                  }
                }
                // 設定範圍預設值
                document.getElementById("range-start").value = 0;
                document.getElementById("range-end").value =
                  globalTableX.length - 1;

                // Draw the chart
                Plotly.newPlot("myPlot", chartData, layout, {
                  responsive: true,
                  displayModeBar: true,
                });

                resizePlot();
                setTimeout(function () {
                  syncTableWithChart();
                }, 0);
              }
              // 匯入後自動切換到圖表分頁
              let chartTab = document.getElementById("chart-tab");
              if (chartTab) chartTab.click();

              // Enable controls dependent on CSV1
              const controlsToEnable = [
                "axis-select",
                "calc-btn",
                "apply-avg-btn",
                "apply-filter-btn",
                "fft-btn",
                "save-btn",
              ];
              controlsToEnable.forEach((id) => {
                const el = document.getElementById(id);
                if (el) el.disabled = false;
              });
              // Filter inputs
              const filterInputs = [
                "filter-type",
                "filter-order",
                "filter-cutoff1",
                "filter-cutoff2",
                "avg-n",
                "range-start",
                "range-end",
              ];
              filterInputs.forEach((id) => {
                const el = document.getElementById(id);
                if (el) el.disabled = false;
              });
            });
        }
        document.body.removeChild(input);
      });
    });
  }
});
// 計算並顯示 right-header 統計
function updateHeaderStats(
  mean,
  max,
  min,
  rms,
  std,
  variance,
  median,
  q25,
  q75
) {
  document.getElementById("header-mean").textContent = mean;
  document.getElementById("header-max").textContent = max;
  document.getElementById("header-min").textContent = min;
  document.getElementById("header-rms").textContent = rms;
  document.getElementById("header-std").textContent = std;
  document.getElementById("header-var").textContent = variance;
  document.getElementById("header-median").textContent = median;
  document.getElementById("header-q25").textContent = q25;
  document.getElementById("header-q75").textContent = q75;
}

document.addEventListener("DOMContentLoaded", function () {
  // 計算按鈕事件
  // 計算按鈕事件：僅計算 Header 統計值
  const calcBtn = document.getElementById("calc-btn");
  if (calcBtn) {
    calcBtn.addEventListener("click", function () {
      const axisIdx = parseInt(document.getElementById("axis-select").value);
      const start = parseInt(document.getElementById("range-start").value);
      const end = parseInt(document.getElementById("range-end").value);

      console.log("Calc Stats: Axis=", axisIdx, "Range=", start, "~", end);
      if (!globalTableYList || !globalTableYList[axisIdx]) {
        updateHeaderStats("-", "-", "-");
        return;
      }
      const arr = globalTableYList[axisIdx].slice(start, end + 1);
      if (arr.length === 0) {
        updateHeaderStats("-", "-", "-");
        return;
      }
      // 平均
      const mean = (
        arr.reduce((a, b) => a + Number(b), 0) / arr.length
      ).toFixed(3);
      // 最大值
      const max = Math.max(...arr.map(Number)).toFixed(3);
      // 最小值
      const min = Math.min(...arr.map(Number)).toFixed(3);
      // 均方根值
      const rms = Math.sqrt(
        arr.reduce((a, b) => a + Math.pow(Number(b), 2), 0) / arr.length
      ).toFixed(3);
      // 標準差
      const std = Math.sqrt(
        arr.reduce((a, b) => a + Math.pow(Number(b) - mean, 2), 0) / arr.length
      ).toFixed(3);
      // 變異數
      const variance = (
        arr.reduce((a, b) => a + Math.pow(Number(b) - mean, 2), 0) / arr.length
      ).toFixed(3);
      // 中位數與分位數
      let sorted = arr.map(Number).sort((a, b) => a - b);
      const median =
        sorted.length % 2 === 1
          ? sorted[Math.floor(sorted.length / 2)].toFixed(3)
          : (
              (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) /
              2
            ).toFixed(3);
      const q25 = sorted.length > 0 ? quantile(sorted, 0.25).toFixed(3) : "-";
      const q75 = sorted.length > 0 ? quantile(sorted, 0.75).toFixed(3) : "-";

      console.log("統計結果:", {
        mean,
        max,
        min,
        rms,
        std,
        variance,
        median,
        q25,
        q75,
      });
      updateHeaderStats(mean, max, min, rms, std, variance, median, q25, q75);

      function quantile(arr, q) {
        const pos = (arr.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (arr[base + 1] !== undefined) {
          return arr[base] + rest * (arr[base + 1] - arr[base]);
        } else {
          return arr[base];
        }
      }
    });
  }

  // 繪製每N筆平均線按鈕事件
  const avgBtn = document.getElementById("apply-avg-btn");
  if (avgBtn) {
    avgBtn.addEventListener("click", function () {
      const axisIdx = parseInt(document.getElementById("axis-select").value);
      const start = parseInt(document.getElementById("range-start").value);
      const end = parseInt(document.getElementById("range-end").value);
      const n = parseInt(document.getElementById("avg-n").value);

      if (!globalTableYList || !globalTableYList[axisIdx]) {
        alert("無資料");
        return;
      }
      const arr = globalTableYList[axisIdx].slice(start, end + 1);
      if (arr.length === 0) return;

      // 每N筆平均
      let nMeans = [];
      let nMeansX = [];
      for (let i = 0; i < arr.length; i += n) {
        const chunk = arr.slice(i, i + n);
        const chunkMean =
          chunk.reduce((a, b) => a + Number(b), 0) / chunk.length;
        nMeans.push(Number(chunkMean.toFixed(3)));
        if (globalTableX) {
          let xChunk = globalTableX.slice(start + i, start + i + n);
          if (xChunk.length > 0) {
            nMeansX.push(xChunk[0]);
          }
        }
      }
      console.log("繪製平均線 - N:", n, "Points:", nMeans.length);

      // 繪圖
      let plotDiv = document.getElementById("myPlot");
      if (plotDiv && !plotDiv.data) {
        Plotly.newPlot(plotDiv, [], { title: "" });
      }
      let traceIdxs = [];
      if (plotDiv && plotDiv.data) {
        for (let i = 0; i < plotDiv.data.length; i++) {
          if (plotDiv.data[i].name === "每N筆平均") {
            traceIdxs.push(i);
          }
        }
      }
      if (traceIdxs.length > 0) {
        Plotly.deleteTraces(plotDiv, traceIdxs);
      }

      // 隱藏其他未選取的原始訊號 (設定為 legendonly 讓使用者可點擊圖例開啟)
      if (plotDiv && plotDiv.data) {
        let visibilityUpdates = [];
        let indicesToUpdate = [];
        const currentAxisIdx = parseInt(
          document.getElementById("axis-select").value
        );

        for (let i = 0; i < plotDiv.data.length; i++) {
          indicesToUpdate.push(i);
          // 如果是目前選取的軸，則顯示；否則隱藏 (legendonly)
          if (i === currentAxisIdx) {
            visibilityUpdates.push(true);
          } else {
            visibilityUpdates.push("legendonly");
          }
        }

        if (indicesToUpdate.length > 0) {
          Plotly.restyle(
            plotDiv,
            { visible: visibilityUpdates },
            indicesToUpdate
          );
        }
      }
      Plotly.addTraces(plotDiv, {
        x: nMeansX,
        y: nMeans,
        type: "scatter",
        mode: "lines", // Explicitly using lines as per the dashed line style
        name: "每N筆平均",
        // 平均線 淺綠色
        line: { dash: "dot", width: 3, color: "#32CD32" },
      });

      // 切換到圖表頁
      let chartTab = document.getElementById("chart-tab");
      if (chartTab) chartTab.click();
    });
  }
});
// Plotly.js
// 預設資料生成：產生更適合濾波與 FFT 測試的訊號
// 訊號：低頻弦波 + 高頻弦波 + 些許雜訊
// function resizePlot() definition removed.
// default data initialization removed.

function resizePlot() {
  var plotDiv = document.getElementById("myPlot");
  if (!plotDiv || !plotDiv.parentElement) return;
  var parent = plotDiv.parentElement;
  var rect = parent.getBoundingClientRect();
  if (!rect || !rect.height || !rect.width) return;

  if (plotDiv.layout) {
    if (
      plotDiv.layout.width !== rect.width ||
      plotDiv.layout.height !== rect.height
    ) {
      Plotly.relayout(plotDiv, { width: rect.width, height: rect.height });
    }
  }
}

window.addEventListener("resize", resizePlot);
setTimeout(resizePlot, 100);
// DataTables
// 根據圖表資料動態生成表格內容，並初始化 DataTables
function syncTableWithChart() {
  console.log("syncTableWithChart called");
  // 多軸支援：優先用全域變數
  var table = document.getElementById("myTable");
  if (!table) return;
  // 如果已初始化 DataTable，先 destroy
  if ($.fn.DataTable.isDataTable(table)) {
    $(table).DataTable().destroy();
  }
  table.innerHTML = "";
  var header = globalTableHeader,
    x = globalTableX,
    y_list = globalTableYList;
  if (header && x && y_list) {
    // 多軸表格
    var thead = document.createElement("thead");
    var trHead = document.createElement("tr");
    var thx = document.createElement("th");
    thx.textContent = header[0];
    trHead.appendChild(thx);
    for (let i = 1; i < header.length; i++) {
      var th = document.createElement("th");
      th.textContent = header[i];
      trHead.appendChild(th);
    }
    thead.appendChild(trHead);
    table.appendChild(thead);
    var tbody = document.createElement("tbody");
    for (let i = 0; i < x.length; i++) {
      var tr = document.createElement("tr");
      var tdx = document.createElement("td");
      tdx.textContent = x[i];
      tr.appendChild(tdx);
      for (let j = 0; j < y_list.length; j++) {
        var tdy = document.createElement("td");
        tdy.textContent = y_list[j][i];
        tr.appendChild(tdy);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
  } else {
    // fallback 單軸
    if (chartData && chartData[0] && chartData[0].x) {
      var thead = document.createElement("thead");
      var trHead = document.createElement("tr");
      var th1 = document.createElement("th");
      th1.textContent = "x";
      var th2 = document.createElement("th");
      th2.textContent = "y";
      trHead.appendChild(th1);
      trHead.appendChild(th2);
      thead.appendChild(trHead);
      table.appendChild(thead);
      var tbody = document.createElement("tbody");
      for (let i = 0; i < chartData[0].x.length; i++) {
        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        td1.textContent = chartData[0].x[i];
        tr.appendChild(td1);
        var td2 = document.createElement("td");
        td2.textContent = chartData[0].y[i];
        tr.appendChild(td2);
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
    }
  }
  // 初始化 DataTable
  $(table).DataTable({
    destroy: true, // 確保舊實例可被覆蓋
    pageLength: 10, // 每頁顯示 10 筆
    lengthMenu: [10, 25, 50, 100], // 使用者可選每頁頁數
    searching: true, // 啟用搜尋
    ordering: true, // 啟用排序
    info: true, // 顯示 "Showing 1 to N of ..." 資訊
    scrollX: true, // 橫向捲動
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // 頁面載入時延遲初始化，確保分區有高度
  setTimeout(function () {
    resizePlot();
    syncTableWithChart();
  }, 100);

  // 切換到表格分頁時自動刷新表格
  var tableTab = document.getElementById("table-tab");
  if (tableTab) {
    tableTab.addEventListener("shown.bs.tab", function () {
      var table = document.getElementById("myTable");
      if ($.fn.DataTable.isDataTable(table)) {
        $(table).DataTable().columns.adjust();
      }
    });
  }
  // 切換到圖表分頁時自動刷新圖表
  var chartTab = document.getElementById("chart-tab");
  if (chartTab) {
    chartTab.addEventListener("shown.bs.tab", function () {
      setTimeout(resizePlot, 0);
    });
  }

  // 濾波器 UI 互動
  const filterTypeSelect = document.getElementById("filter-type");
  const cutoffSep = document.getElementById("cutoff-sep");
  const cutoff2 = document.getElementById("filter-cutoff2");

  if (filterTypeSelect) {
    filterTypeSelect.addEventListener("change", function () {
      if (this.value === "band") {
        cutoffSep.style.display = "inline";
        cutoff2.style.display = "block";
      } else {
        cutoffSep.style.display = "none";
        cutoff2.style.display = "none";
      }
    });
  }
});

// 註冊全域 applyFilter 函式
window.applyFilter = function () {
  console.log("Apply Filter button clicked!"); // 立即顯示
  const applyFilterBtn = document.getElementById("apply-filter-btn");

  // 取得參數
  const axisSelect = document.getElementById("axis-select");
  if (!axisSelect) {
    console.error("No axis select found");
    return;
  }

  const axisIdx = parseInt(axisSelect.value);
  const type = document.getElementById("filter-type").value;
  const order = parseInt(document.getElementById("filter-order").value) || 4;
  const c1 = parseFloat(document.getElementById("filter-cutoff1").value);
  const c2 = parseFloat(document.getElementById("filter-cutoff2").value);

  if (!globalTableYList || !globalTableYList[axisIdx]) {
    alert("請先載入資料");
    return;
  }

  if (type === "none") {
    alert("請選擇濾波器類型");
    return;
  }

  let cutoff;
  if (type === "band") {
    if (isNaN(c1) || isNaN(c2) || c1 >= c2) {
      alert("帶通濾波需要兩個有效頻率 (低頻 < 高頻)");
      return;
    }
    cutoff = [c1, c2];
  } else {
    if (isNaN(c1)) {
      alert("請輸入截止頻率");
      return;
    }
    cutoff = c1;
  }

  console.log("Applying filter with params:", { axisIdx, type, cutoff, order });

  // 顯示 loading
  let oldText = "";
  if (applyFilterBtn) {
    oldText = applyFilterBtn.innerHTML;
    applyFilterBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm"></span> 計算中...';
    applyFilterBtn.disabled = true;
  }

  fetch("/apply_filter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      y: globalTableYList[axisIdx],
      type: type,
      cutoff: cutoff,
      fs: 1.0,
      order: order,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Filter response:", data);
      if (data.error) {
        alert("濾波錯誤: " + data.error);
      } else {
        // 繪製濾波後訊號
        let plotDiv = document.getElementById("myPlot");
        if (!plotDiv) {
          console.error("Plot div not found");
          return;
        }

        // 隱藏其他未選取的原始訊號 (設定為 legendonly)
        if (plotDiv && plotDiv.data) {
          let visibilityUpdates = [];
          let indicesToUpdate = [];
          // axisIdx 來自 function scope 上方定義的變數

          for (let i = 0; i < plotDiv.data.length; i++) {
            indicesToUpdate.push(i);
            // 如果是目前選取的軸，則顯示；否則隱藏 (legendonly)
            // 注意：要排除已經存在的「濾波線」或「平均線」嗎？
            // 需求是「隱藏其他訊號」，通常包含舊的分析線。
            // 這裡簡單邏輯：只保留「原始選取軸」，其他全隱藏，讓畫面乾淨比較 "Raw vs Filtered"
            if (i === axisIdx) {
              visibilityUpdates.push(true);
            } else {
              visibilityUpdates.push("legendonly");
            }
          }

          if (indicesToUpdate.length > 0) {
            Plotly.restyle(
              plotDiv,
              { visible: visibilityUpdates },
              indicesToUpdate
            );
          }
        }

        console.log("Adding trace to plot...");
        Plotly.addTraces(plotDiv, {
          x: globalTableX,
          y: data.y_filtered,
          type: "scatter",
          mode: "lines",
          name: `Filtered (${type})`,
          line: { width: 2, color: "#FFD700" }, // gold/yellow
          opacity: 0.8,
        });

        // 切換到圖表頁
        let chartTab = document.getElementById("chart-tab");
        if (chartTab) chartTab.click();
      }
    })
    .catch((err) => {
      console.error("Filter fetch error:", err);
      alert("請求失敗: " + err);
    })
    .finally(() => {
      if (applyFilterBtn) {
        applyFilterBtn.innerHTML = oldText;
        applyFilterBtn.disabled = false;
      }
    });
};
console.log("Main_v3.js loaded and window.applyFilter is defined.");

// Theme Toggle Logic
document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("theme-toggle");
  const icon = toggleBtn ? toggleBtn.querySelector("i") : null;
  const html = document.documentElement;

  // Function to apply theme to plots
  window.updatePlotTheme = function () {
    const isDark = html.getAttribute("data-bs-theme") === "dark";
    const bgColor = isDark ? "#212529" : "#f4f6fa";
    const textColor = isDark ? "#f8f9fa" : "#333";

    const layoutUpdate = {
      plot_bgcolor: bgColor,
      paper_bgcolor: bgColor,
      font: { color: textColor },
      "xaxis.gridcolor": isDark ? "rgba(255, 255, 255, 0.15)" : "#ddd",
      "xaxis.zerolinecolor": isDark ? "rgba(255, 255, 255, 0.15)" : "#ddd",
      "yaxis.gridcolor": isDark ? "rgba(255, 255, 255, 0.15)" : "#ddd",
      "yaxis.zerolinecolor": isDark ? "rgba(255, 255, 255, 0.15)" : "#ddd",
    };

    ["myPlot", "fftPlot", "comparePlot"].forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.data) {
        Plotly.relayout(id, layoutUpdate);
      }
    });
  };

  // Init from localStorage
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    html.setAttribute("data-bs-theme", "dark");
    if (icon) {
      icon.classList.remove("bi-moon");
      icon.classList.add("bi-sun");
    }
    // Update plots if they exist (unlikely on load, but good practice)
    setTimeout(window.updatePlotTheme, 100);
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      const currentTheme = html.getAttribute("data-bs-theme");
      if (currentTheme === "dark") {
        html.setAttribute("data-bs-theme", "light");
        localStorage.setItem("theme", "light");
        if (icon) {
          icon.classList.remove("bi-sun");
          icon.classList.add("bi-moon");
        }
      } else {
        html.setAttribute("data-bs-theme", "dark");
        localStorage.setItem("theme", "dark");
        if (icon) {
          icon.classList.remove("bi-moon");
          icon.classList.add("bi-sun");
        }
      }
      window.updatePlotTheme();
    });
  }
});

// Disable controls on load
// Initialize with Mixed Signal Demo
document.addEventListener("DOMContentLoaded", function () {
  // Check if data is already loaded (e.g. from previous session or other init logic)
  if (!globalTableYList) {
    console.log("Auto-loading Default (Mixed) Signal...");
    // Ensure loadDemoSignal is defined before calling if possible,
    // otherwise use setTimeout or ensure script order.
    // Since this is consistent with other listeners, it should be fine.
    if (window.loadDemoSignal) {
      window.loadDemoSignal("mixed");
    } else {
      // Fallback if function not ready immediately (unlikely in this structure)
      setTimeout(() => {
        if (window.loadDemoSignal) window.loadDemoSignal("mixed");
      }, 100);
    }
  }
});

// Demo Signal Generation (Called by Dropdown)
// Demo Signal Generation (Called by Dropdown)
window.loadDemoSignal = function (type) {
  console.log("Generating demo signal:", type);

  // Generate data
  const points = 1000;
  const fs = 100; // 100Hz sample rate
  let x = [];
  let yLow = [];
  let yHigh = [];
  let yMixed = [];

  for (let i = 0; i < points; i++) {
    let t = i / fs;
    x.push(t);

    // Low Freq (2Hz)
    yLow.push(10 * Math.sin(2 * Math.PI * 2 * t));

    // High Freq (20Hz)
    yHigh.push(5 * Math.sin(2 * Math.PI * 20 * t));

    // Mixed (2Hz + 20Hz + Random)
    let val =
      10 * Math.sin(2 * Math.PI * 2 * t) +
      2 * Math.sin(2 * Math.PI * 20 * t) +
      (Math.random() - 0.5) * 5;
    yMixed.push(val);
  }

  // Populate Globals with ALL signals
  globalTableHeader = [
    "time",
    "Low_Freq_2Hz",
    "High_Freq_20Hz",
    "Mixed_Signal",
  ];
  globalTableX = x;
  globalTableYList = [yLow, yHigh, yMixed];

  console.log("Demo data generated. Rows:", x.length);

  // Determine which index to show initially
  let initialIndex = 0;
  if (type === "high") initialIndex = 1;
  if (type === "mixed") initialIndex = 2;

  let name = globalTableHeader[initialIndex + 1];
  let y = globalTableYList[initialIndex];

  // Reset layout
  layout = {
    title: name,
    autosize: true,
    margin: { l: 40, r: 20, t: 40, b: 40 },
    yaxis: {
      title: "",
      automargin: true,
      gridcolor:
        document.documentElement.getAttribute("data-bs-theme") === "dark"
          ? "#555"
          : "#ddd",
      zerolinecolor:
        document.documentElement.getAttribute("data-bs-theme") === "dark"
          ? "#555"
          : "#ddd",
    },
    xaxis: {
      title: "Time (s)",
      gridcolor:
        document.documentElement.getAttribute("data-bs-theme") === "dark"
          ? "#555"
          : "#ddd",
      zerolinecolor:
        document.documentElement.getAttribute("data-bs-theme") === "dark"
          ? "#555"
          : "#ddd",
    },
    plot_bgcolor:
      document.documentElement.getAttribute("data-bs-theme") === "dark"
        ? "#212529"
        : "#f4f6fa",
    paper_bgcolor:
      document.documentElement.getAttribute("data-bs-theme") === "dark"
        ? "#212529"
        : "#f4f6fa",
  };

  chartData = [];
  let trace = {
    x: x,
    y: y,
    type: "scatter",
    mode: "lines",
    name: name,
    line: { width: 2 },
  };
  chartData.push(trace);

  // Draw
  Plotly.newPlot("myPlot", chartData, layout, {
    responsive: true,
    displayModeBar: true,
  });

  // Fill Axis Select with ALL options
  const axisSelect = document.getElementById("axis-select");
  if (axisSelect) {
    axisSelect.innerHTML = "";
    // Header[0] is time, so start from 1
    for (let i = 1; i < globalTableHeader.length; i++) {
      const opt = document.createElement("option");
      opt.value = i - 1; // 0-based index for Y lists
      opt.textContent = globalTableHeader[i];
      axisSelect.appendChild(opt);
    }
    // Set selected value
    axisSelect.value = initialIndex;
  }

  // Update Range Inputs
  const startInput = document.getElementById("range-start");
  const endInput = document.getElementById("range-end");
  if (startInput) {
    startInput.value = 0;
    startInput.max = x.length - 1;
  }
  if (endInput) {
    endInput.value = x.length - 1;
    endInput.max = x.length - 1;
  }

  // Enable Controls (Just in case)
  const controlsToEnable = [
    "axis-select",
    "calc-btn",
    "apply-avg-btn",
    "apply-filter-btn",
    "fft-btn",
    "save-btn",
  ];
  controlsToEnable.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.disabled = false;
  });

  const filterInputs = [
    "filter-type",
    "filter-order",
    "filter-cutoff1",
    "filter-cutoff2",
    "avg-n",
    "range-start",
    "range-end",
  ];
  filterInputs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.disabled = false;
  });

  // Switch to chart tab
  let chartTab = document.getElementById("chart-tab");
  if (chartTab) chartTab.click();

  // Sync Table
  setTimeout(syncTableWithChart, 0);

  // Set Label to Demo Mode
  const lbl = document.getElementById("axis-label");
  if (lbl) lbl.innerText = "選擇範例：";

  // Set Demo Mode Flag
  window.isDemoMode = true;
};

// Axis Select Change Listener for Demo Mode
document.addEventListener("DOMContentLoaded", function () {
  const axisSelect = document.getElementById("axis-select");
  if (axisSelect) {
    axisSelect.addEventListener("change", function () {
      if (window.isDemoMode && globalTableYList) {
        const idx = parseInt(this.value);
        const y = globalTableYList[idx];
        const x = globalTableX;
        const name = globalTableHeader[idx + 1];

        const trace = {
          x: x,
          y: y,
          type: "scatter",
          mode: "lines",
          name: name,
          line: { width: 2 },
        };

        const layout = {
          title: name,
          autosize: true,
          margin: { l: 40, r: 20, t: 40, b: 40 },
          yaxis: {
            title: "",
            automargin: true,
            gridcolor:
              document.documentElement.getAttribute("data-bs-theme") === "dark"
                ? "rgba(255, 255, 255, 0.15)"
                : "#ddd",
            zerolinecolor:
              document.documentElement.getAttribute("data-bs-theme") === "dark"
                ? "rgba(255, 255, 255, 0.15)"
                : "#ddd",
          },
          xaxis: {
            title: "Time (s)",
            gridcolor:
              document.documentElement.getAttribute("data-bs-theme") === "dark"
                ? "rgba(255, 255, 255, 0.15)"
                : "#ddd",
            zerolinecolor:
              document.documentElement.getAttribute("data-bs-theme") === "dark"
                ? "rgba(255, 255, 255, 0.15)"
                : "#ddd",
          },
          plot_bgcolor:
            document.documentElement.getAttribute("data-bs-theme") === "dark"
              ? "#212529"
              : "#f4f6fa",
          paper_bgcolor:
            document.documentElement.getAttribute("data-bs-theme") === "dark"
              ? "#212529"
              : "#f4f6fa",
        };

        Plotly.react("myPlot", [trace], layout);
      }
    });
  }
});
