import type { Field, FieldStats, Question } from "../types";

function roundRate(value: number): number {
  return Math.round(value * 10) / 10;
}

export function calculateFieldStats(field: Field, questions: Question[]): FieldStats {
  const ownQuestions = questions.filter((question) => question.fieldId === field.id);
  const total = ownQuestions.length;
  const correct = ownQuestions.filter((question) => question.status === "correct").length;
  const incorrect = ownQuestions.filter((question) => question.status === "incorrect").length;
  const unanswered = total - correct - incorrect;
  const answered = correct + incorrect;

  return {
    fieldId: field.id,
    fieldName: field.name,
    total,
    correct,
    incorrect,
    unanswered,
    answered,
    accuracyRate: answered === 0 ? 0 : roundRate((correct / answered) * 100),
    progressRate: total === 0 ? 0 : roundRate((answered / total) * 100),
    achievementRate: total === 0 ? 0 : roundRate((correct / total) * 100)
  };
}

export function summarizeMaterial(fieldStats: FieldStats[]) {
  return fieldStats.reduce(
    (summary, stats) => ({
      total: summary.total + stats.total,
      correct: summary.correct + stats.correct,
      incorrect: summary.incorrect + stats.incorrect,
      unanswered: summary.unanswered + stats.unanswered
    }),
    { total: 0, correct: 0, incorrect: 0, unanswered: 0 }
  );
}
