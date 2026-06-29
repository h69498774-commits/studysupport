export function StorageNotice() {
  return (
    <aside className="storage-note" aria-label="保存に関する注意">
      <strong>保存について</strong>
      <span>
        データはこのブラウザの IndexedDB に保存されます。端末やブラウザ間では自動同期されず、ブラウザデータを削除すると記録が消える場合があります。個人情報は収集せず、外部サーバーへ学習データを送信しません。
      </span>
    </aside>
  );
}
