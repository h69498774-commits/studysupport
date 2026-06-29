import type { FieldStats } from "../types";

interface Props {
  stats: FieldStats;
}

export function StatGrid({ stats }: Props) {
  return (
    <dl className="stat-grid">
      <div><dt>登録問題数</dt><dd>{stats.total}</dd></div>
      <div><dt>正解</dt><dd>{stats.correct}</dd></div>
      <div><dt>不正解</dt><dd>{stats.incorrect}</dd></div>
      <div><dt>未回答</dt><dd>{stats.unanswered}</dd></div>
      <div><dt>解答済み</dt><dd>{stats.answered}</dd></div>
      <div><dt>正答率</dt><dd>{stats.answered === 0 ? "未解答" : `${stats.accuracyRate}%`}</dd></div>
      <div><dt>学習進捗率</dt><dd>{stats.progressRate}%</dd></div>
      <div><dt>正解達成率</dt><dd>{stats.achievementRate}%</dd></div>
    </dl>
  );
}
