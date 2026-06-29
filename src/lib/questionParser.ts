export interface ParseOptions {
  existingNumbers?: Iterable<number>;
  maxNumber?: number;
  maxAdditions?: number;
}

export interface ParseQuestionResult {
  numbers: number[];
  duplicateCount: number;
}

const DEFAULT_MAX_NUMBER = 9999;
const DEFAULT_MAX_ADDITIONS = 3000;

function normalizeInput(input: string): string {
  return input
    .replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/[－ー―]/g, "-")
    .replace(/[〜～]/g, "~")
    .replace(/[，、]/g, ",")
    .replace(/[　\s]+/g, "");
}

function readPositiveInteger(value: string, maxNumber: number): number {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new Error("問題番号は正の整数で入力してください。");
  }

  const number = Number(value);
  if (!Number.isSafeInteger(number) || number > maxNumber) {
    throw new Error(`問題番号は${maxNumber}以下で入力してください。`);
  }

  return number;
}

export function parseQuestionInput(input: string, options: ParseOptions = {}): ParseQuestionResult {
  const maxNumber = options.maxNumber ?? DEFAULT_MAX_NUMBER;
  const maxAdditions = options.maxAdditions ?? DEFAULT_MAX_ADDITIONS;
  const normalized = normalizeInput(input);

  if (normalized.length === 0) {
    throw new Error("問題番号を入力してください。");
  }

  const existing = new Set(options.existingNumbers ?? []);
  const pending = new Set<number>();
  let duplicateCount = 0;

  for (const token of normalized.split(",")) {
    if (token.length === 0) {
      throw new Error("入力形式を確認してください。");
    }

    const rangeSeparator = token.includes("~") ? "~" : token.includes("-") ? "-" : null;

    if (rangeSeparator === null) {
      const number = readPositiveInteger(token, maxNumber);
      if (existing.has(number) || pending.has(number)) {
        duplicateCount += 1;
      } else {
        pending.add(number);
      }
      continue;
    }

    const parts = token.split(rangeSeparator);
    if (parts.length !== 2 || parts[0] === "" || parts[1] === "") {
      throw new Error("範囲指定は 1-20 のように入力してください。");
    }

    const start = readPositiveInteger(parts[0], maxNumber);
    const end = readPositiveInteger(parts[1], maxNumber);
    if (start > end) {
      throw new Error("範囲の開始番号は終了番号以下にしてください。");
    }

    const rangeSize = end - start + 1;
    if (rangeSize > maxAdditions) {
      throw new Error(`一度に登録できる範囲は${maxAdditions}問までです。`);
    }

    for (let number = start; number <= end; number += 1) {
      if (existing.has(number) || pending.has(number)) {
        duplicateCount += 1;
      } else {
        pending.add(number);
      }
    }
  }

  return {
    numbers: [...pending].sort((a, b) => a - b),
    duplicateCount
  };
}
