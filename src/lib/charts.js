/**
 * DataViz helpers for Dashboard reports and charts.
 * Uses Chart.js for rendering and regression for trendlines / R².
 *
 * Supported chart types:
 * - Radar
 * - Doughnut / Pie
 * - Scatter (with optional trendline, R², linear regression)
 * - Bar (vertical / horizontal)
 * - Grouped bar
 * - Line
 */
import { Chart } from 'chart.js/auto';
import regression from 'regression';

const DEFAULT_COLORS = [
  'rgb(99, 132, 255)',
  'rgb(255, 99, 132)',
  'rgb(75, 192, 192)',
  'rgb(255, 205, 86)',
  'rgb(153, 102, 255)',
  'rgb(201, 203, 207)',
];

/**
 * Linear regression from [[x,y], ...]. Returns { points, equation, r2, string }.
 * @param {Array<[number, number]>} data
 * @returns {{ points: Array<{x: number, y: number}>, equation: number[], r2: number, string: string }}
 */
export function linearRegression(data) {
  if (!data?.length) return { points: [], equation: [], r2: 0, string: '' };
  const result = regression.linear(data);
  const [a, b] = result.equation;
  const minX = Math.min(...data.map((d) => d[0]));
  const maxX = Math.max(...data.map((d) => d[0]));
  const points = [
    { x: minX, y: a * minX + b },
    { x: maxX, y: a * maxX + b },
  ];
  return {
    points,
    equation: result.equation,
    r2: result.r2 ?? 0,
    string: result.string,
  };
}

/**
 * Create a Chart.js instance. Destroy previous chart on the same canvas if any.
 * @param {HTMLCanvasElement} canvas
 * @param {import('chart.js').ChartConfiguration} config
 * @returns {Chart}
 */
export function createChart(canvas, config) {
  const existing = Chart.getChart(canvas);
  if (existing) existing.destroy();
  return new Chart(canvas, { ...config, options: { responsive: true, maintainAspectRatio: true, ...config.options } });
}

/** Radar chart. labels: string[], datasets: { label, data: number[], borderColor?, backgroundColor? }[]. options: { min?, max? } for fixed scale. */
export function createRadar(canvas, { labels, datasets, min = 0, max = 4 }) {
  const fullDatasets = datasets.map((ds, i) => ({
    label: ds.label,
    data: ds.data,
    borderColor: ds.borderColor ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    backgroundColor: (ds.backgroundColor ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length].replace('rgb', 'rgba').replace(')', ', 0.2)')),
    borderWidth: 2,
    pointBackgroundColor: ds.borderColor ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));
  return createChart(canvas, {
    type: 'radar',
    data: { labels, datasets: fullDatasets },
    options: {
      maintainAspectRatio: false,
      scales: {
        r: {
          min,
          max,
          beginAtZero: true,
        },
      },
    },
  });
}

/** Doughnut or pie. labels: string[], values: number[], options: { doughnut?: boolean } */
export function createDoughnut(canvas, { labels, values, doughnut = true }) {
  return createChart(canvas, {
    type: doughnut ? 'doughnut' : 'pie',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: DEFAULT_COLORS.slice(0, values.length),
        borderWidth: 2,
        borderColor: '#fff',
      }],
    },
    options: {
      plugins: { legend: { position: 'right' } },
    },
  });
}

/**
 * Scatter with optional trendline and R².
 * data: { x: number[], y: number[] } or points: Array<{x, y, label?: string}>.
 * options: { showTrendline?: boolean, showR2?: boolean, xTitle?: string, yTitle?: string }
 */
export function createScatter(canvas, { data, points, showTrendline = true, showR2 = true, xTitle = 'x', yTitle = 'y' }) {
  const pts = points ?? (data ? data.x.map((x, i) => ({ x, y: data.y[i] })) : []);
  const scatterData = pts.map((p) => ({ x: p.x, y: p.y }));
  const pointLabels = pts.map((p) => (p.label != null ? String(p.label) : null));
  const datasets = [
    {
      label: 'Data',
      data: scatterData,
      _pointLabels: pointLabels,
      backgroundColor: DEFAULT_COLORS[0].replace('rgb', 'rgba').replace(')', ', 0.6)'),
      borderColor: DEFAULT_COLORS[0],
      borderWidth: 1,
      pointRadius: 5,
      pointHoverRadius: 7,
    },
  ];
  let r2Text = '';
  if (showTrendline && pts.length >= 2) {
    const xy = pts.map((p) => [p.x, p.y]);
    const reg = linearRegression(xy);
    datasets.push({
      label: 'Trend',
      data: reg.points,
      type: 'line',
      borderColor: DEFAULT_COLORS[1],
      borderWidth: 2,
      borderDash: [4, 2],
      pointRadius: 0,
      fill: false,
    });
    if (showR2) r2Text = `R² = ${reg.r2.toFixed(4)}`;
  }
  return createChart(canvas, {
    type: 'scatter',
    data: { datasets },
    options: {
      scales: {
        x: { type: 'linear', title: { display: true, text: xTitle } },
        y: { type: 'linear', title: { display: true, text: yTitle } },
      },
      plugins: {
        legend: { display: true },
        tooltip: {
          callbacks: {
            title(items) {
              const i = items[0]?.dataIndex;
              const labels = datasets[0]._pointLabels;
              if (labels && i != null && labels[i] != null) return labels[i];
              return items.length ? `(${items[0].parsed.x}, ${items[0].parsed.y})` : '';
            },
            afterLabel: () => r2Text,
          },
        },
      },
    },
  });
}

/**
 * Bar chart (vertical or horizontal).
 * labels: string[], values: number[] or datasets: { label, data: number[] }[].
 * options: { horizontal?: boolean }
 */
export function createBar(canvas, { labels, values, datasets: ds, horizontal = false }) {
  const datasets = ds ?? [{
    label: 'Value',
    data: values ?? [],
    backgroundColor: DEFAULT_COLORS[0].replace('rgb', 'rgba').replace(')', ', 0.7)'),
    borderColor: DEFAULT_COLORS[0],
    borderWidth: 1,
  }];
  return createChart(canvas, {
    type: 'bar',
    data: { labels: labels ?? [], datasets },
    options: {
      indexAxis: horizontal ? 'y' : 'x',
      scales: {
        x: { beginAtZero: true },
        y: { beginAtZero: true },
      },
    },
  });
}

const REF_LINE_HIT_PX = 8;
const REF_LINE_STYLES = [
  { label: 'Average', color: 'rgb(34, 197, 94)', dash: [] },
  { label: 'Median', color: 'rgb(59, 130, 246)', dash: [6, 4] },
  { label: 'Mode', color: 'rgb(168, 85, 247)', dash: [2, 4] },
];

/**
 * Bar chart: one bar per person (labels on x), rank on y (0–4), with horizontal crosshair on hover.
 * Optional stats: { average, median, mode } to draw reference lines (rollover for tooltip).
 * labels: string[] (person names); values: number[] (rank).
 */
export function createPersonRankBar(canvas, { labels, values, stats }) {
  const refLines = stats
    ? [
        { value: stats.average, ...REF_LINE_STYLES[0] },
        { value: stats.median, ...REF_LINE_STYLES[1] },
        { value: stats.mode, ...REF_LINE_STYLES[2] },
      ]
    : [];

  const tooltipEl = document.createElement('div');
  tooltipEl.className = 'chart-ref-line-tooltip';
  tooltipEl.setAttribute('role', 'tooltip');
  tooltipEl.style.cssText = 'position:absolute;pointer-events:none;display:none;background:rgba(0,0,0,0.85);color:#fff;padding:6px 10px;border-radius:4px;font-size:12px;z-index:10;white-space:nowrap;';
  const chartWrapper = canvas.parentElement;
  if (chartWrapper && chartWrapper.style.position !== 'absolute' && chartWrapper.style.position !== 'relative') {
    chartWrapper.style.position = 'relative';
  }
  (chartWrapper || canvas.parentElement).appendChild(tooltipEl);

  const chart = createChart(canvas, {
    type: 'bar',
    data: {
      labels: labels ?? [],
      datasets: [{
        label: 'Rank',
        data: values ?? [],
        backgroundColor: DEFAULT_COLORS[0].replace('rgb', 'rgba').replace(')', ', 0.7)'),
        borderColor: DEFAULT_COLORS[0],
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { maxRotation: 45, minRotation: 0, maxTicksLimit: 30 },
        },
        y: {
          beginAtZero: true,
          max: 4,
          title: { display: true, text: 'Rank' },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(ctx) {
              return `Rank: ${ctx.parsed.y}`;
            },
          },
        },
      },
    },
    plugins: [
      {
        id: 'barRefLines',
        afterDraw(chart) {
          if (!refLines.length || !chart.scales.y) return;
          const ctx = chart.ctx;
          const left = chart.chartArea?.left ?? 0;
          const right = chart.chartArea?.right ?? 0;
          const yScale = chart.scales.y;
          chart._refLinePixels = [];
          refLines.forEach((line) => {
            const y = yScale.getPixelForValue(line.value);
            chart._refLinePixels.push({ y, label: line.label, value: line.value });
            ctx.save();
            ctx.strokeStyle = line.color;
            ctx.lineWidth = 1.5;
            ctx.setLineDash(line.dash);
            ctx.beginPath();
            ctx.moveTo(left, y);
            ctx.lineTo(right, y);
            ctx.stroke();
            ctx.restore();
          });
        },
      },
      {
        id: 'barCrosshair',
        afterDraw(chart) {
          const active = chart.getActiveElements?.() ?? chart._active ?? [];
          if (!active.length) return;
          const el = active[0];
          const yScale = chart.scales.y;
          if (!yScale || el.datasetIndex == null || el.index == null) return;
          const value = chart.data.datasets[el.datasetIndex].data[el.index];
          if (value == null) return;
          const y = yScale.getPixelForValue(value);
          const left = chart.chartArea?.left ?? 0;
          const right = chart.chartArea?.right ?? 0;
          const ctx = chart.ctx;
          ctx.save();
          ctx.strokeStyle = 'rgba(0,0,0,0.4)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(left, y);
          ctx.lineTo(right, y);
          ctx.stroke();
          ctx.restore();
        },
      },
    ],
  });

  function onMove(e) {
    const x = e.offsetX ?? e.clientX - canvas.getBoundingClientRect().left;
    const y = e.offsetY ?? e.clientY - canvas.getBoundingClientRect().top;
    const area = chart.chartArea;
    if (!area || x < area.left || x > area.right) {
      tooltipEl.style.display = 'none';
      return;
    }
    const pixels = chart._refLinePixels;
    if (pixels) {
      for (const line of pixels) {
        if (Math.abs(y - line.y) <= REF_LINE_HIT_PX) {
          tooltipEl.textContent = `${line.label}: ${Number(line.value).toFixed(2)}`;
          tooltipEl.style.display = 'block';
          tooltipEl.style.position = 'fixed';
          tooltipEl.style.left = `${e.clientX + 12}px`;
          tooltipEl.style.top = `${e.clientY + 12}px`;
          return;
        }
      }
    }
    tooltipEl.style.display = 'none';
  }
  function onLeave() {
    tooltipEl.style.display = 'none';
  }
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseleave', onLeave);

  const origDestroy = chart.destroy.bind(chart);
  chart.destroy = () => {
    canvas.removeEventListener('mousemove', onMove);
    canvas.removeEventListener('mouseleave', onLeave);
    tooltipEl.remove();
    origDestroy();
  };

  return chart;
}

/** Grouped bar chart. labels: string[], datasets: { label, data: number[] }[] */
export function createGroupedBar(canvas, { labels, datasets }) {
  const fullDatasets = datasets.map((ds, i) => ({
    label: ds.label,
    data: ds.data,
    backgroundColor: DEFAULT_COLORS[i % DEFAULT_COLORS.length].replace('rgb', 'rgba').replace(')', ', 0.7)'),
    borderColor: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    borderWidth: 1,
  }));
  return createChart(canvas, {
    type: 'bar',
    data: { labels, datasets: fullDatasets },
    options: {
      scales: {
        x: { stacked: false, beginAtZero: true },
        y: { stacked: false, beginAtZero: true },
      },
    },
  });
}

/** Pale, pleasant colors per category: Green, Blue, Purple, Orange (cycle if more categories). */
const SPECTRUM_CATEGORY_COLORS = [
  { bg: 'rgba(167, 243, 208, 0.9)', border: 'rgb(74, 222, 128)' },   // green
  { bg: 'rgba(191, 219, 254, 0.9)', border: 'rgb(96, 165, 250)' },   // blue
  { bg: 'rgba(233, 213, 255, 0.9)', border: 'rgb(192, 132, 252)' }, // purple
  { bg: 'rgba(254, 215, 170, 0.9)', border: 'rgb(251, 146, 60)' },   // orange
];

/**
 * Spectrum report: vertical grouped bar (one bar per competency), category dividers, hover crosshair.
 * labels: display labels (may be truncated); fullLabels: full text for tooltip; values: bar heights;
 * categoryBoundaries: x positions (between bars) to draw vertical separator lines, e.g. [2.5, 5.5].
 * categoryIndices: index of category per bar (for coloring); cycles through Green, Blue, Purple, Orange.
 * categoryNames: label to show at the top of each block (one per category).
 */
export function createSpectrumBar(canvas, { labels, fullLabels, values, categoryBoundaries = [], categoryIndices = [], categoryNames = [] }) {
  const palette = SPECTRUM_CATEGORY_COLORS;
  const n = values.length;
  const backgroundColor = categoryIndices.length
    ? categoryIndices.map((i) => palette[i % palette.length].bg)
    : palette[0].bg;
  const borderColor = categoryIndices.length
    ? categoryIndices.map((i) => palette[i % palette.length].border)
    : palette[0].border;
  const chart = createChart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Avg rank',
        data: values,
        backgroundColor,
        borderColor,
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 26, right: 8, bottom: 4, left: 4 } },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            maxRotation: 45,
            minRotation: 0,
            maxTicksLimit: 40,
            callback(value, index) {
              const label = this.getLabelForValue(value);
              if (typeof label !== 'string' || label.length <= 18) return label;
              return label.slice(0, 16) + '…';
            },
          },
        },
        y: {
          beginAtZero: true,
          max: 4,
          title: { display: true, text: 'Average rank' },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          yAlign: 'bottom',
          xAlign: 'center',
          callbacks: {
            title(items) {
              const i = items[0]?.dataIndex;
              return fullLabels && fullLabels[i] != null ? fullLabels[i] : items[0]?.label;
            },
            label(ctx) {
              return `Avg: ${ctx.parsed.y}`;
            },
          },
        },
      },
    },
    plugins: [
      {
        id: 'spectrumCategoryLabels',
        afterDraw(chart) {
          const names = categoryNames;
          if (!names?.length) return;
          const ctx = chart.ctx;
          const xScale = chart.scales.x;
          const chartArea = chart.chartArea;
          if (!xScale || !chartArea) return;
          const n = chart.data.labels?.length ?? 0;
          const boundaries = categoryBoundaries;
          ctx.save();
          ctx.font = '12px system-ui, sans-serif';
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          const y = chartArea.top - 6;
          for (let i = 0; i < names.length; i++) {
            const startBar = i === 0 ? 0 : Math.floor(boundaries[i - 1]) + 1;
            const endBar = i < boundaries.length ? Math.floor(boundaries[i]) + 1 : n;
            if (startBar >= endBar) continue;
            const centerX = (startBar + endBar - 1) / 2;
            const x = xScale.getPixelForValue(centerX);
            if (x < chartArea.left || x > chartArea.right) continue;
            const label = names[i].length > 24 ? names[i].slice(0, 22) + '…' : names[i];
            ctx.fillText(label, x, y);
          }
          ctx.restore();
        },
      },
      {
        id: 'spectrumCategoryDividers',
        afterDraw(chart) {
          const boundaries = categoryBoundaries;
          if (!boundaries?.length) return;
          const ctx = chart.ctx;
          const xScale = chart.scales.x;
          if (!xScale) return;
          const top = chart.chartArea?.top ?? 0;
          const bottom = chart.chartArea?.bottom ?? 0;
          ctx.save();
          ctx.strokeStyle = 'rgba(0,0,0,0.15)';
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
          for (const xVal of boundaries) {
            const x = xScale.getPixelForValue(xVal);
            if (x <= chart.chartArea.left || x >= chart.chartArea.right) continue;
            ctx.beginPath();
            ctx.moveTo(x, top);
            ctx.lineTo(x, bottom);
            ctx.stroke();
          }
          ctx.restore();
        },
      },
      {
        id: 'spectrumCrosshair',
        afterDraw(chart) {
          const active = chart.getActiveElements?.() ?? chart._active ?? [];
          if (!active.length) return;
          const el = active[0];
          const yScale = chart.scales.y;
          if (!yScale || el.datasetIndex == null || el.index == null) return;
          const value = chart.data.datasets[el.datasetIndex].data[el.index];
          if (value == null) return;
          const y = yScale.getPixelForValue(value);
          const left = chart.chartArea?.left ?? 0;
          const right = chart.chartArea?.right ?? 0;
          const ctx = chart.ctx;
          ctx.save();
          ctx.strokeStyle = 'rgba(0,0,0,0.4)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(left, y);
          ctx.lineTo(right, y);
          ctx.stroke();
          ctx.restore();
        },
      },
    ],
  });
  chart.update();
  return chart;
}

/** Line chart. labels: string[], datasets: { label, data: number[], fill?: boolean }[] */
export function createLine(canvas, { labels, datasets }) {
  const fullDatasets = datasets.map((ds, i) => ({
    label: ds.label,
    data: ds.data,
    borderColor: ds.borderColor ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    backgroundColor: (ds.backgroundColor ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length].replace('rgb', 'rgba').replace(')', ', 0.1)')),
    borderWidth: 2,
    fill: ds.fill ?? false,
    tension: 0.2,
    pointRadius: 3,
    pointHoverRadius: 5,
  }));
  return createChart(canvas, {
    type: 'line',
    data: { labels, datasets: fullDatasets },
    options: {
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true },
      },
    },
  });
}

export { Chart };
