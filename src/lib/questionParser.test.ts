import { describe, expect, it } from "vitest";
import { parseQuestionInput } from "./questionParser";

describe("parseQuestionInput", () => {
  it.each([
    ["1-20", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]],
    ["1～20", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]],
    ["1-5,10,15-18", [1, 2, 3, 4, 5, 10, 15, 16, 17, 18]],
    ["1～5、10、15～18", [1, 2, 3, 4, 5, 10, 15, 16, 17, 18]],
    ["1,3,5", [1, 3, 5]],
    [" 1 - 3 、 5 ", [1, 2, 3, 5]]
  ])("parses %s", (input, expected) => {
    expect(parseQuestionInput(input).numbers).toEqual(expected);
  });

  it("excludes already registered numbers", () => {
    const result = parseQuestionInput("1-5", { existingNumbers: [2, 4] });
    expect(result.numbers).toEqual([1, 3, 5]);
    expect(result.duplicateCount).toBe(2);
  });

  it.each(["", "0", "-1", "abc", "1.5", "20-1", "1--5", "10000", "1-4000"])("rejects %s", (input) => {
    expect(() => parseQuestionInput(input)).toThrow();
  });
});
