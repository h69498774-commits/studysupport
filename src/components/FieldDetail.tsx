import { useEffect, useMemo, useState } from "react";
import type { AnswerStatus, Field, FieldStats, Material, Question } from "../types";
import { parseQuestionInput } from "../lib/questionParser";
import { StatGrid } from "./StatGrid";

interface Props {
  material: Material;
  field: Field;
  questions: Question[];
  stats: FieldStats;
  onBack: () => void;
  onAddQuestions: (numbers: number[], duplicateCount: number) => Promise<void>;
  onUpdateStatus: (ids: string[], status: AnswerStatus) => Promise<void>;
  onDeleteQuestions: (ids: string[]) => Promise<void>;
}

const QUESTIONS_PER_PAGE = 10;

const statusLabels: Record<AnswerStatus, string> = {
  unanswered: "－ 未回答",
  correct: "○ 正解",
  incorrect: "× 不正解"
};

function questionLabel(number: number): string {
  return `問題${number}`;
}

export function FieldDetail({ material, field, questions, stats, onBack, onAddQuestions, onUpdateStatus, onDeleteQuestions }: Props) {
  const [rangeInput, setRangeInput] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [localError, setLocalError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(questions.length / QUESTIONS_PER_PAGE));
  const pageStartIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const pageQuestions = questions.slice(pageStartIndex, pageStartIndex + QUESTIONS_PER_PAGE);
  const pageEndIndex = pageStartIndex + pageQuestions.length;

  const selectedList = useMemo(() => [...selectedIds], [selectedIds]);
  const allSelected = questions.length > 0 && selectedIds.size === questions.length;
  const visiblePageSelected = pageQuestions.length > 0 && pageQuestions.every((question) => selectedIds.has(question.id));

  useEffect(() => {
    setCurrentPage((page) => Math.min(Math.max(page, 1), pageCount));
  }, [pageCount]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    try {
      const result = parseQuestionInput(rangeInput, { existingNumbers: questions.map((question) => question.number) });
      if (result.numbers.length === 0) {
        setLocalError(`${result.duplicateCount}問は登録済みまたは重複のため除外されました。追加できる問題がありません。`);
        return;
      }
      await onAddQuestions(result.numbers, result.duplicateCount);
      setCurrentPage(Math.max(1, Math.ceil((questions.length + result.numbers.length) / QUESTIONS_PER_PAGE)));
      setRangeInput("");
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "問題番号の解析に失敗しました。");
    }
  }

  function toggle(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectVisiblePage() {
    setSelectedIds((current) => {
      const next = new Set(current);
      pageQuestions.forEach((question) => next.add(question.id));
      return next;
    });
  }

  async function bulkStatus(status: AnswerStatus) {
    if (selectedList.length === 0) {
      setLocalError("問題を選択してください。");
      return;
    }
    await onUpdateStatus(selectedList, status);
    setSelectedIds(new Set());
  }

  async function bulkDelete(ids: string[]) {
    if (ids.length === 0) {
      setLocalError("問題を選択してください。");
      return;
    }
    if (window.confirm(`${ids.length}問を削除します。よろしいですか？`)) {
      await onDeleteQuestions(ids);
      setSelectedIds(new Set());
    }
  }

  return (
    <section className="page-stack">
      <div className="toolbar">
        <div>
          <button type="button" className="text-button" onClick={onBack}>← {material.name}へ</button>
          <h2>{field.name}</h2>
          <p>{material.name}</p>
        </div>
      </div>

      <form className="inline-form panel" onSubmit={submit}>
        <label htmlFor="question-range">問題番号</label>
        <input
          id="question-range"
          value={rangeInput}
          onChange={(event) => setRangeInput(event.target.value)}
          placeholder="例：1-20, 25, 30-35"
          inputMode="text"
        />
        <button type="submit">問題を追加</button>
      </form>

      {localError && <div className="notice error" role="alert">{localError}</div>}

      <section className="panel">
        <div className="section-heading">
          <div>
            <h3>集計</h3>
            <p>正答率は未回答を分母に含めません。</p>
          </div>
        </div>
        <StatGrid stats={stats} />
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h3>問題一覧</h3>
            <p>{selectedIds.size}問を選択中</p>
          </div>
          <div className="button-row">
            <button type="button" className="secondary-button" onClick={selectVisiblePage} disabled={pageQuestions.length === 0 || visiblePageSelected}>
              表示中を選択
            </button>
            <button type="button" className="secondary-button" onClick={() => setSelectedIds(new Set(questions.map((question) => question.id)))} disabled={questions.length === 0 || allSelected}>
              全選択
            </button>
            <button type="button" className="secondary-button" onClick={() => setSelectedIds(new Set())} disabled={selectedIds.size === 0}>
              選択解除
            </button>
          </div>
        </div>

        <div className="bulk-actions" aria-label="一括操作">
          <button type="button" onClick={() => void bulkStatus("correct")}>選択を正解</button>
          <button type="button" onClick={() => void bulkStatus("incorrect")}>選択を不正解</button>
          <button type="button" onClick={() => void bulkStatus("unanswered")}>選択を未回答</button>
          <button type="button" className="danger-button" onClick={() => void bulkDelete(selectedList)}>選択を削除</button>
        </div>

        {questions.length === 0 ? (
          <div className="empty-state">まだ問題がありません。範囲指定で追加してください。</div>
        ) : (
          <>
            <div className="pagination-bar" aria-label="問題一覧のページ切り替え">
              <button type="button" className="secondary-button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}>
                前へ
              </button>
              <span>
                {currentPage} / {pageCount}ページ
                <small>（{pageStartIndex + 1}-{pageEndIndex}問目 / 全{questions.length}問）</small>
              </span>
              <button type="button" className="secondary-button" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} disabled={currentPage === pageCount}>
                次へ
              </button>
            </div>

            <div className="question-list">
              {pageQuestions.map((question) => (
                <article className={`question-row ${question.status}`} key={question.id}>
                  <label className="check-label">
                    <input type="checkbox" checked={selectedIds.has(question.id)} onChange={() => toggle(question.id)} />
                    <span>{questionLabel(question.number)}</span>
                  </label>
                  <span className="status-badge">{statusLabels[question.status]}</span>
                  <div className="status-buttons">
                    <button type="button" className={question.status === "correct" ? "active" : ""} onClick={() => onUpdateStatus([question.id], "correct")}>
                      ○ 正解
                    </button>
                    <button type="button" className={question.status === "incorrect" ? "active danger-soft" : ""} onClick={() => onUpdateStatus([question.id], "incorrect")}>
                      × 不正解
                    </button>
                    <button type="button" className={question.status === "unanswered" ? "active neutral" : ""} onClick={() => onUpdateStatus([question.id], "unanswered")}>
                      － 未回答
                    </button>
                    <button type="button" className="danger-button" onClick={() => void bulkDelete([question.id])}>
                      削除
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </section>
  );
}
