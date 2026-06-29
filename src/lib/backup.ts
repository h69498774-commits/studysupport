import type { AppData, BackupPayload, Field, Material, Question } from "../types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasTimestampedEntity(value: Record<string, unknown>): boolean {
  return typeof value.id === "string" && typeof value.createdAt === "string" && typeof value.updatedAt === "string";
}

function isMaterial(value: unknown): value is Material {
  return isRecord(value) && hasTimestampedEntity(value) && typeof value.name === "string";
}

function isField(value: unknown): value is Field {
  return isRecord(value) && hasTimestampedEntity(value) && typeof value.materialId === "string" && typeof value.name === "string";
}

function isQuestion(value: unknown): value is Question {
  return (
    isRecord(value) &&
    hasTimestampedEntity(value) &&
    typeof value.fieldId === "string" &&
    typeof value.number === "number" &&
    Number.isInteger(value.number) &&
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
  const parsed: unknown = JSON.parse(json);
  if (!isRecord(parsed) || parsed.version !== 1 || typeof parsed.exportedAt !== "string" || !isRecord(parsed.data)) {
    throw new Error("バックアップファイルの形式が正しくありません。");
  }

  const data = parsed.data;
  if (!Array.isArray(data.materials) || !Array.isArray(data.fields) || !Array.isArray(data.questions)) {
    throw new Error("バックアップデータに必要な項目がありません。");
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
