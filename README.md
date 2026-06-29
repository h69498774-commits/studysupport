# Study Support

教材に収録されている問題番号と解答状態を記録し、分野ごとの正答率をレーダーチャートで確認する学習管理Webアプリです。問題文や解説、氏名、メールアドレスは登録しません。

## 主な機能

- 教材の登録、編集、削除
- 教材ごとの分野の登録、編集、削除
- `1-20`、`1～20、25、30～40` などの範囲指定による問題番号の一括登録
- 問題ごとの「未回答」「正解」「不正解」の記録
- 複数問題の一括状態変更と一括削除
- 分野ごとの登録問題数、正答率、学習進捗率、正解達成率の表示
- 教材ごとのレーダーチャート表示
- JSONバックアップと復元
- 全データ削除
- PCとスマートフォン向けのレスポンシブ表示

## 使用技術

- React
- Vite
- TypeScript
- IndexedDB
- Dexie.js
- Chart.js / react-chartjs-2
- Vitest

## 必要な環境

Node.js と npm が必要です。GitHub Actions では Node.js 22 を使用します。

## インストール

```bash
npm install
```

## 開発サーバー

```bash
npm run dev
```

表示されたローカルURLをブラウザで開きます。

## テスト

```bash
npm run test
```

問題番号入力の解析処理を確認します。

## ビルド

```bash
npm run build
```

ビルド結果は `dist` に作成されます。

## プレビュー

```bash
npm run preview
```

## データ保存について

データは利用中のブラウザ内の IndexedDB に保存されます。外部サーバーや外部データベースへ学習データを送信しません。

PCとスマートフォン間、ChromeとEdgeなど異なるブラウザ間では自動同期されません。ブラウザのサイトデータや IndexedDB を削除すると記録も消える可能性があります。定期的に「データ管理」画面からJSONバックアップを書き出してください。

## バックアップと復元

1. アプリ右上の「データ管理」を開きます。
2. 「書き出す」を押すと `study-progress-backup-YYYY-MM-DD.json` が保存されます。
3. 復元する場合はJSONファイルを選択します。
4. 確認後、現在のデータをバックアップ内容で置き換えます。

不正な形式のJSONは読み込まれません。

## GitHubへの保存

```bash
git init
git add .
git commit -m "Create study support app"
git branch -M main
git remote add origin https://github.com/ユーザー名/リポジトリ名.git
git push -u origin main
```

## GitHub Pagesで公開する手順

1. GitHubリポジトリの `Settings` を開きます。
2. `Pages` を開きます。
3. `Build and deployment` の `Source` で `GitHub Actions` を選択します。
4. `main` ブランチへ push すると `.github/workflows/deploy.yml` が実行されます。
5. 成功後、Pages のURLからアプリを開けます。

このアプリは画面内で表示を切り替えるため、GitHub Pages上で再読み込みしてもルーティング由来の404が起きにくい構成です。

## リポジトリ名を変更した場合

GitHub Actions では `VITE_BASE_PATH: /${{ github.event.repository.name }}/` を指定しているため、通常はリポジトリ名に合わせて自動でbaseが設定されます。手元で明示したい場合は次のように実行します。

```bash
VITE_BASE_PATH=/リポジトリ名/ npm run build
```

Windows PowerShell の場合:

```powershell
$env:VITE_BASE_PATH="/リポジトリ名/"; npm run build
```

## 全データ削除

「データ管理」画面で確認欄に `削除` と入力し、確認ダイアログに同意した場合だけ削除されます。削除後は復元できないため、必要に応じて先にJSONバックアップを保存してください。
