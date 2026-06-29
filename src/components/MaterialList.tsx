import { useState } from "react";
import type { AppData } from "../types";

interface Props {
  data: AppData;
  onCreateMaterial: (name: string) => Promise<void>;
  onOpenMaterial: (materialId: string) => void;
  onRenameMaterial: (materialId: string, name: string) => Promise<void>;
  onDeleteMaterial: (materialId: string) => Promise<void>;
}

export function MaterialList({ data, onCreateMaterial, onOpenMaterial, onRenameMaterial, onDeleteMaterial }: Props) {
  const [name, setName] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreateMaterial(name);
    setName("");
  }

  return (
    <section className="page-stack">
      <div className="toolbar">
        <div>
          <h2>教材一覧</h2>
          <p>教材名だけを登録して、分野と問題番号をあとから追加します。</p>
        </div>
      </div>

      <form className="inline-form panel" onSubmit={submit}>
        <label htmlFor="material-name">教材名</label>
        <input id="material-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="例：SPI問題集" />
        <button type="submit">教材を追加</button>
      </form>

      {data.materials.length === 0 ? (
        <div className="panel empty-state">まだ教材がありません。最初の教材を追加してください。</div>
      ) : (
        <div className="card-grid">
          {data.materials.map((material) => {
            const fields = data.fields.filter((field) => field.materialId === material.id);
            const fieldIds = new Set(fields.map((field) => field.id));
            const questionCount = data.questions.filter((question) => fieldIds.has(question.fieldId)).length;

            return (
              <article className="item-card" key={material.id}>
                <div>
                  <h3>{material.name}</h3>
                  <p>{fields.length}分野 / {questionCount}問</p>
                </div>
                <div className="button-row">
                  <button type="button" onClick={() => onOpenMaterial(material.id)}>
                    開く
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      const nextName = window.prompt("教材名を入力してください。", material.name);
                      if (nextName !== null) {
                        void onRenameMaterial(material.id, nextName);
                      }
                    }}
                  >
                    編集
                  </button>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => {
                      if (window.confirm("教材と関連する分野・問題を削除します。よろしいですか？")) {
                        void onDeleteMaterial(material.id);
                      }
                    }}
                  >
                    削除
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
