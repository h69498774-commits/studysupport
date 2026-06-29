import { useState } from "react";
import type { ChartMetric, Field, FieldStats, Material, Question } from "../types";
import { RadarPanel } from "./RadarPanel";
import { StatGrid } from "./StatGrid";

interface Props {
  material: Material;
  fields: Field[];
  questions: Question[];
  stats: FieldStats[];
  chartMetric: ChartMetric;
  onChartMetricChange: (metric: ChartMetric) => void;
  onBack: () => void;
  onCreateField: (name: string) => Promise<void>;
  onRenameField: (fieldId: string, name: string) => Promise<void>;
  onDeleteField: (fieldId: string) => Promise<void>;
  onOpenField: (fieldId: string) => void;
}

export function MaterialDetail({
  material,
  fields,
  questions,
  stats,
  chartMetric,
  onChartMetricChange,
  onBack,
  onCreateField,
  onRenameField,
  onDeleteField,
  onOpenField
}: Props) {
  const [fieldName, setFieldName] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreateField(fieldName);
    setFieldName("");
  }

  return (
    <section className="page-stack">
      <div className="toolbar">
        <div>
          <button type="button" className="text-button" onClick={onBack}>← 教材一覧へ</button>
          <h2>{material.name}</h2>
        </div>
      </div>

      <form className="inline-form panel" onSubmit={submit}>
        <label htmlFor="field-name">分野名</label>
        <input id="field-name" value={fieldName} onChange={(event) => setFieldName(event.target.value)} placeholder="例：確率" />
        <button type="submit">分野を追加</button>
      </form>

      <RadarPanel stats={stats} metric={chartMetric} onMetricChange={onChartMetricChange} />

      {fields.length === 0 ? (
        <div className="panel empty-state">まだ分野がありません。最初の分野を追加してください。</div>
      ) : (
        <div className="field-list">
          {fields.map((field) => {
            const fieldStats = stats.find((item) => item.fieldId === field.id);
            const questionCount = questions.filter((question) => question.fieldId === field.id).length;
            if (!fieldStats) {
              return null;
            }

            return (
              <article className="panel field-panel" key={field.id}>
                <div className="section-heading">
                  <div>
                    <h3>{field.name}</h3>
                    <p>{questionCount}問を登録済み</p>
                  </div>
                  <div className="button-row">
                    <button type="button" onClick={() => onOpenField(field.id)}>開く</button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        const nextName = window.prompt("分野名を入力してください。", field.name);
                        if (nextName !== null) {
                          void onRenameField(field.id, nextName);
                        }
                      }}
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => {
                        if (window.confirm("分野と含まれる問題を削除します。よろしいですか？")) {
                          void onDeleteField(field.id);
                        }
                      }}
                    >
                      削除
                    </button>
                  </div>
                </div>
                <StatGrid stats={fieldStats} />
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
