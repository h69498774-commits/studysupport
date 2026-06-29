import Dexie, { type Table } from "dexie";
import type { AnswerStatus, AppData, Field, Material, Question } from "./types";
import { createId, nowIso } from "./lib/ids";

class StudySupportDatabase extends Dexie {
  materials!: Table<Material, string>;
  fields!: Table<Field, string>;
  questions!: Table<Question, string>;

  constructor() {
    super("study-support-db");
    this.version(1).stores({
      materials: "id, name, updatedAt",
      fields: "id, materialId, [materialId+name], updatedAt",
      questions: "id, fieldId, [fieldId+number], number, status, updatedAt"
    });
  }
}

export const db = new StudySupportDatabase();

export async function loadAppData(): Promise<AppData> {
  const [materials, fields, questions] = await Promise.all([
    db.materials.orderBy("updatedAt").reverse().toArray(),
    db.fields.toArray(),
    db.questions.orderBy("number").toArray()
  ]);

  return {
    materials,
    fields: fields.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    questions
  };
}

export async function createMaterial(name: string): Promise<string> {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throw new Error("教材名を入力してください。");
  }

  const id = createId("mat");
  const timestamp = nowIso();
  await db.materials.add({ id, name: trimmed, createdAt: timestamp, updatedAt: timestamp });
  return id;
}

export async function renameMaterial(materialId: string, name: string): Promise<void> {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throw new Error("教材名を入力してください。");
  }

  await db.materials.update(materialId, { name: trimmed, updatedAt: nowIso() });
}

export async function deleteMaterial(materialId: string): Promise<void> {
  await db.transaction("rw", db.materials, db.fields, db.questions, async () => {
    const fields = await db.fields.where("materialId").equals(materialId).toArray();
    const fieldIds = fields.map((field) => field.id);
    if (fieldIds.length > 0) {
      await db.questions.where("fieldId").anyOf(fieldIds).delete();
    }
    await db.fields.where("materialId").equals(materialId).delete();
    await db.materials.delete(materialId);
  });
}

export async function createField(materialId: string, name: string): Promise<string> {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throw new Error("分野名を入力してください。");
  }

  const duplicate = await db.fields.where("[materialId+name]").equals([materialId, trimmed]).first();
  if (duplicate) {
    throw new Error("同じ教材内に同名の分野があります。");
  }

  const id = createId("fld");
  const timestamp = nowIso();
  await db.fields.add({ id, materialId, name: trimmed, createdAt: timestamp, updatedAt: timestamp });
  return id;
}

export async function renameField(fieldId: string, materialId: string, name: string): Promise<void> {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throw new Error("分野名を入力してください。");
  }

  const duplicate = await db.fields.where("[materialId+name]").equals([materialId, trimmed]).first();
  if (duplicate && duplicate.id !== fieldId) {
    throw new Error("同じ教材内に同名の分野があります。");
  }

  await db.fields.update(fieldId, { name: trimmed, updatedAt: nowIso() });
}

export async function deleteField(fieldId: string): Promise<void> {
  await db.transaction("rw", db.fields, db.questions, async () => {
    await db.questions.where("fieldId").equals(fieldId).delete();
    await db.fields.delete(fieldId);
  });
}

export async function addQuestions(fieldId: string, numbers: number[]): Promise<void> {
  const timestamp = nowIso();
  const records: Question[] = numbers.map((number) => ({
    id: createId("que"),
    fieldId,
    number,
    status: "unanswered",
    createdAt: timestamp,
    updatedAt: timestamp
  }));

  await db.questions.bulkAdd(records);
}

export async function updateQuestionStatus(ids: string[], status: AnswerStatus): Promise<void> {
  const updatedAt = nowIso();
  await db.transaction("rw", db.questions, async () => {
    await Promise.all(ids.map((id) => db.questions.update(id, { status, updatedAt })));
  });
}

export async function deleteQuestions(ids: string[]): Promise<void> {
  await db.questions.bulkDelete(ids);
}

export async function replaceAllData(data: AppData): Promise<void> {
  await db.transaction("rw", db.materials, db.fields, db.questions, async () => {
    await Promise.all([db.questions.clear(), db.fields.clear(), db.materials.clear()]);
    await db.materials.bulkAdd(data.materials);
    await db.fields.bulkAdd(data.fields);
    await db.questions.bulkAdd(data.questions);
  });
}

export async function deleteAllData(): Promise<void> {
  await db.transaction("rw", db.materials, db.fields, db.questions, async () => {
    await Promise.all([db.questions.clear(), db.fields.clear(), db.materials.clear()]);
  });
}
