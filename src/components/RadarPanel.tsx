import {
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip
} from "chart.js";
import { Radar } from "react-chartjs-2";
import type { ChartMetric, FieldStats } from "../types";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface Props {
  stats: FieldStats[];
  metric: ChartMetric;
  onMetricChange: (metric: ChartMetric) => void;
}

const metricLabels: Record<ChartMetric, string> = {
  accuracyRate: "正答率",
  progressRate: "学習進捗率",
  achievementRate: "正解達成率"
};

export function RadarPanel({ stats, metric, onMetricChange }: Props) {
  const chartData = {
    labels: stats.map((item) => item.fieldName),
    datasets: [
      {
        label: metricLabels[metric],
        data: stats.map((item) => item[metric]),
        backgroundColor: "rgba(54, 114, 124, 0.18)",
        borderColor: "#36727c",
        pointBackgroundColor: "#24545d",
        borderWidth: 2
      }
    ]
  };

  return (
    <section className="panel chart-panel" aria-label="分野別チャート">
      <div className="section-heading">
        <div>
          <h3>分野別レーダーチャート</h3>
          <p>分野が3個未満でも、数値一覧で確認できます。</p>
        </div>
        <label className="select-label">
          表示指標
          <select value={metric} onChange={(event) => onMetricChange(event.target.value as ChartMetric)}>
            <option value="accuracyRate">正答率</option>
            <option value="progressRate">学習進捗率</option>
            <option value="achievementRate">正解達成率</option>
          </select>
        </label>
      </div>

      {stats.length === 0 ? (
        <div className="empty-state">分野を追加するとチャートが表示されます。</div>
      ) : (
        <>
          <div className="chart-wrap">
            <Radar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    min: 0,
                    max: 100,
                    ticks: { stepSize: 20, backdropColor: "transparent" },
                    pointLabels: { font: { size: 12 } }
                  }
                },
                plugins: {
                  legend: { position: "bottom" }
                }
              }}
            />
          </div>
          <div className="metric-list">
            {stats.map((item) => (
              <div key={item.fieldId}>
                <span>{item.fieldName}</span>
                <strong>{item[metric]}%</strong>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
