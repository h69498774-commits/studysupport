import { useRef, useState } from "react";
import type { AppData } from "../types";
import { createBackupFilename, createBackupPayload, parseBackupJson } from "../lib/backup";

interface Props {
  data: AppData;
  onReplaceData: (data: AppData) => Promise<void>;
  onDeleteAll: () => Promise<void>;
}

export function DataManagement({ data, onReplaceData, onDeleteAll }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  function exportJson() {
    const payload = createBackupPayload(data);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = createBackupFilename();
    link.click();
    URL.revokeObjectURL(url);
    setMessage("JSONバックアップを書き出しました。");
  }

  async function importJson(file: File) {
    setMessage(null);
    try {
      const text = await file.text();
      const backup = parseBackupJson(text);
      if (window.confirm("現在のデータをバックアップ内容で置き換えます。よろしいですか？")) {
        await onReplaceData(backup.data);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "JSONを読み込めませんでした。");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function deleteEverything() {
    if (!window.confirm("すべての教材・分野・問題を削除します。よろしいですか？")) {
      return;
    }
    if (deleteConfirmText !== "削除") {
      setMessage("確認欄に「削除」と入力した場合だけ削除できます。");
      return;
    }
    await onDeleteAll();
    setDeleteConfirmText("");
  }

  return (
    <section className="page-stack">
      <div className="toolbar">
        <div>
          <h2>データ管理</h2>
          <p>バックアップ、復元、全データ削除を行います。</p>
        </div>
      </div>

      {message && <div className="notice info" role="status">{message}</div>}

      <section className="panel">
        <div className="section-heading">
          <div>
            <h3>JSONバックアップ</h3>
            <p>教材・分野・問題番号・解答状態・日時をまとめて保存します。</p>
          </div>
          <button type="button" onClick={exportJson}>書き出す</button>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h3>JSON復元</h3>
            <p>復元方法は「現在のデータを置き換える」です。</p>
          </div>
        </div>
        <label className="file-input">
          バックアップファイル
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void importJson(file);
              }
            }}
          />
        </label>
      </section>

      <section className="panel danger-zone">
        <div className="section-heading">
          <div>
            <h3>全データ削除</h3>
            <p>誤操作防止のため、確認欄に「削除」と入力してください。</p>
          </div>
        </div>
        <div className="inline-form">
          <label htmlFor="delete-confirm">確認文字</label>
          <input id="delete-confirm" value={deleteConfirmText} onChange={(event) => setDeleteConfirmText(event.target.value)} placeholder="削除" />
          <button type="button" className="danger-button" onClick={() => void deleteEverything()}>
            全データ削除
          </button>
        </div>
      </section>
    </section>
  );
}
