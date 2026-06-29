import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addQuestions,
  createField,
  createMaterial,
  deleteAllData,
  deleteField,
  deleteMaterial,
  deleteQuestions,
  loadAppData,
  renameField,
  renameMaterial,
  replaceAllData,
  updateQuestionStatus
} from "./db";
import type { AnswerStatus, AppData, ChartMetric } from "./types";
import { calculateFieldStats } from "./lib/stats";
import { MaterialList } from "./components/MaterialList";
import { MaterialDetail } from "./components/MaterialDetail";
import { FieldDetail } from "./components/FieldDetail";
import { DataManagement } from "./components/DataManagement";
import { StorageNotice } from "./components/StorageNotice";

type View =
  | { screen: "materials" }
  | { screen: "material"; materialId: string }
  | { screen: "field"; materialId: string; fieldId: string }
  | { screen: "data" };

interface Notice {
  tone: "success" | "error" | "info";
  text: string;
}

const emptyData: AppData = { materials: [], fields: [], questions: [] };

export default function App() {
  const [data, setData] = useState<AppData>(emptyData);
  const [view, setView] = useState<View>({ screen: "materials" });
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartMetric, setChartMetric] = useState<ChartMetric>("accuracyRate");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setData(await loadAppData());
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "データの読み込みに失敗しました。" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const selectedMaterial = view.screen === "material" || view.screen === "field" ? data.materials.find((item) => item.id === view.materialId) : undefined;
  const selectedField = view.screen === "field" ? data.fields.find((item) => item.id === view.fieldId) : undefined;

  const materialFields = useMemo(
    () => (selectedMaterial ? data.fields.filter((field) => field.materialId === selectedMaterial.id) : []),
    [data.fields, selectedMaterial]
  );

  const materialStats = useMemo(
    () => materialFields.map((field) => calculateFieldStats(field, data.questions)),
    [materialFields, data.questions]
  );

  useEffect(() => {
    if (!loading && view.screen !== "materials" && view.screen !== "data" && !selectedMaterial) {
      setView({ screen: "materials" });
    }
  }, [loading, selectedMaterial, view.screen]);

  async function runAction(action: () => Promise<void>, successText?: string) {
    try {
      await action();
      await refresh();
      if (successText) {
        setNotice({ tone: "success", text: successText });
      }
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "操作に失敗しました。" });
    }
  }

  async function handleCreateMaterial(name: string) {
    try {
      const id = await createMaterial(name);
      await refresh();
      setView({ screen: "material", materialId: id });
      setNotice({ tone: "success", text: "教材を追加しました。" });
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "教材の追加に失敗しました。" });
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">IndexedDB local learning tracker</p>
          <h1>Study Support</h1>
        </div>
        <nav aria-label="主要画面">
          <button className="ghost-button" type="button" onClick={() => setView({ screen: "materials" })}>
            教材
          </button>
          <button className="ghost-button" type="button" onClick={() => setView({ screen: "data" })}>
            データ管理
          </button>
        </nav>
      </header>

      {notice && (
        <div className={`notice ${notice.tone}`} role={notice.tone === "error" ? "alert" : "status"}>
          <span>{notice.text}</span>
          <button type="button" className="icon-button" onClick={() => setNotice(null)} aria-label="通知を閉じる">
            ×
          </button>
        </div>
      )}

      <main>
        {loading ? (
          <section className="panel empty-state">読み込み中です。</section>
        ) : (
          <>
            {view.screen === "materials" && (
              <MaterialList
                data={data}
                onCreateMaterial={handleCreateMaterial}
                onOpenMaterial={(materialId) => setView({ screen: "material", materialId })}
                onRenameMaterial={(materialId, name) => runAction(() => renameMaterial(materialId, name), "教材名を変更しました。")}
                onDeleteMaterial={(materialId) => runAction(() => deleteMaterial(materialId), "教材を削除しました。")}
              />
            )}

            {view.screen === "material" && selectedMaterial && (
              <MaterialDetail
                material={selectedMaterial}
                fields={materialFields}
                questions={data.questions}
                stats={materialStats}
                chartMetric={chartMetric}
                onChartMetricChange={setChartMetric}
                onBack={() => setView({ screen: "materials" })}
                onCreateField={(name) => runAction(async () => {
                  await createField(selectedMaterial.id, name);
                }, "分野を追加しました。")}
                onRenameField={(fieldId, name) => runAction(() => renameField(fieldId, selectedMaterial.id, name), "分野名を変更しました。")}
                onDeleteField={(fieldId) => runAction(() => deleteField(fieldId), "分野を削除しました。")}
                onOpenField={(fieldId) => setView({ screen: "field", materialId: selectedMaterial.id, fieldId })}
              />
            )}

            {view.screen === "field" && selectedMaterial && selectedField && (
              <FieldDetail
                material={selectedMaterial}
                field={selectedField}
                questions={data.questions.filter((question) => question.fieldId === selectedField.id).sort((a, b) => a.number - b.number)}
                stats={calculateFieldStats(selectedField, data.questions)}
                onBack={() => setView({ screen: "material", materialId: selectedMaterial.id })}
                onAddQuestions={(numbers, duplicateCount) =>
                  runAction(
                    () => addQuestions(selectedField.id, numbers),
                    `${numbers.length}問を追加しました。${duplicateCount}問は登録済みまたは重複のため除外しました。`
                  )
                }
                onUpdateStatus={(ids: string[], status: AnswerStatus) => runAction(() => updateQuestionStatus(ids, status), "解答状態を更新しました。")}
                onDeleteQuestions={(ids) => runAction(() => deleteQuestions(ids), "問題を削除しました。")}
              />
            )}

            {view.screen === "data" && (
              <DataManagement
                data={data}
                onReplaceData={(backupData) =>
                  runAction(() => replaceAllData(backupData), "バックアップから復元しました。").then(() => setView({ screen: "materials" }))
                }
                onDeleteAll={() => runAction(() => deleteAllData(), "すべてのデータを削除しました。")}
              />
            )}
          </>
        )}
      </main>

      <StorageNotice />
    </div>
  );
}
