export type AnswerStatus = "unanswered" | "correct" | "incorrect";

export interface Timestamped {
  createdAt: string;
  updatedAt: string;
}

export interface Material extends Timestamped {
  id: string;
  name: string;
}

export interface Field extends Timestamped {
  id: string;
  materialId: string;
  name: string;
}

export interface Question extends Timestamped {
  id: string;
  fieldId: string;
  number: number;
  status: AnswerStatus;
}

export interface AppData {
  materials: Material[];
  fields: Field[];
  questions: Question[];
}

export interface FieldStats {
  fieldId: string;
  fieldName: string;
  total: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  answered: number;
  accuracyRate: number;
  progressRate: number;
  achievementRate: number;
}

export type ChartMetric = "accuracyRate" | "progressRate" | "achievementRate";

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  data: AppData;
}
