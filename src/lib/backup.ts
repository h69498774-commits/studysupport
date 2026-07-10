import type { AppData, BackupPayload, Field, Material, Question } from "../types";

const MAX_JSON_BYTES = 2_000_000;
const MAX_MATERIALS = 200;
const MAX_FIELDS = 2_000;
const MAX_QUESTIONS = 50_000;
const MAX_NAME_LENGTH = 120;
const MAX_ID_LENGTH = 120;
const MAX_QUESTION_NUMBER = 9999;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasTimestampedEntity(value: Record<string, unknown>): boolean {
  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    value.id.length <= MAX_ID_LENGTH &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isMaterial(value: unknown): value is Material {
  return isRecord(value) && hasTimestampedEntity(value) && typeof value.name === "string" && value.name.length <= MAX_NAME_LENGTH;
}

function isField(value: unknown): value is Field {
  return (
    isRecord(value) &&
    hasTimestampedEntity(value) &&
    typeof value.materialId === "string" &&
    value.materialId.length > 0 &&
    value.materialId.length <= MAX_ID_LENGTH &&
    typeof value.name === "string" &&
    value.name.length <= MAX_NAME_LENGTH
  );
}

function isQuestion(value: unknown): value is Question {
  return (
    isRecord(value) &&
    hasTimestampedEntity(value) &&
    typeof value.fieldId === "string" &&
    value.fieldId.length > 0 &&
    value.fieldId.length <= MAX_ID_LENGTH &&
    typeof value.number === "number" &&
    Number.isInteger(value.number) &&
    value.number >= 1 &&
    value.number <= MAX_QUESTION_NUMBER &&
    ["unanswered", "correct", "incorrect"].includes(String(value.status))
  );
}

export function createBackupPayload(data: AppData): BackupPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data
  };
}

export function createBackupFilename(date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `study-progress-backup-${yyyy}-${mm}-${dd}.json`;
}

export function parseBackupJson(json: string): BackupPayload {
  if (new Blob([json]).size > MAX_JSON_BYTES) {
    throw new Error("バックアップファイルが大きすぎます。");
  }

  const parsed: unknown = JSON.parse(json);
  if (!isRecord(parsed) || parsed.version !== 1 || typeof parsed.exportedAt !== "string" || !isRecord(parsed.data)) {
    throw new Error("バックアップファイルの形式が正しくありません。");
  }

  const data = parsed.data;
  if (!Array.isArray(data.materials) || !Array.isArray(data.fields) || !Array.isArray(data.questions)) {
    throw new Error("バックアップデータに必要な項目がありません。");
  }

  if (data.materials.length > MAX_MATERIALS || data.fields.length > MAX_FIELDS || data.questions.length > MAX_QUESTIONS) {
    throw new Error("バックアップデータの件数が多すぎます。");
  }

  if (!data.materials.every(isMaterial) || !data.fields.every(isField) || !data.questions.every(isQuestion)) {
    throw new Error("バックアップデータの内容が正しくありません。");
  }

  return {
    version: 1,
    exportedAt: parsed.exportedAt,
    data: {
      materials: data.materials,
      fields: data.fields,
      questions: data.questions
    }
  };
}
