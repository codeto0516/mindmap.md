# VSCode / Cursor 拡張機能化 TODO

マークダウンをマインドマップとして編集できる **VSCode / Cursor 用拡張機能** にするために必要な作業をまとめています。現状は Vite + React の Web アプリとして開発済み。これを拡張の Webview 内で動かし、開いている .md ファイルと連携させることを目指す。

---

## 1. 拡張の骨格・プロジェクト構成

- [ ] **拡張用 package.json の整備**
  - `name`, `displayName`, `description`, `publisher`, `repository` などメタデータ
  - `engines.vscode` でサポートする VSCode 最小バージョン（例: `^1.85.0`）
  - `main` でエントリポイント（例: `dist/extension.js`）
  - `activationEvents`: 例 `onCustomEditor:mindmap.md.markdown` や `onCommand:...`
  - `contributes`: コマンド・カスタムエディタ・設定・メニュー（後述）
- [ ] **拡張エントリポイントの作成**
  - `src/extension/extension.ts`（または `extension/extension.ts`）で `activate` / `deactivate` を実装
  - 拡張のビルドは esbuild や webpack で別ターゲット（Node 用）にし、`dist/extension.js` を出力
- [ ] **モノレポ or サブパッケージの検討**
  - 現行の Vite アプリ（Webview 用バンドル）と拡張（Node）を同じリポジトリでどう配置するか
  - 例: `packages/webview`（Vite）と `packages/extension`（Node）、または `src/extension` + `src/webview` をルートの vite/tsconfig で使い分け

---

## 2. エディタ連携（Custom Editor / Webview）

- [ ] **カスタムエディタの登録**
  - `contributes.customEditors` で `.md` をマインドマップ用エディタとして登録
  - `viewType`（例: `mindmap.md.markdown`）、`displayName`、`selector`（`fileNamePattern: "*.md"` など）
  - 必要に応じて「既定のエディタ」にできるようにする
- [ ] **Webview の作成と React の埋め込み**
  - `vscode.window.createWebviewPanel` または `CustomDocument` + `WebviewPanel` で Webview を用意
  - 現在の React アプリ（MindMap + マークダウンパース/シリアライズ）を Webview の `html` 内で実行
  - バンドル: 既存の Vite ビルドを単一の HTML + JS + CSS として出力し、`asWebviewUri` で読み込むか、インラインで埋め込む
- [ ] **Webview と拡張のメッセージング**
  - `postMessage` / `onDidReceiveMessage` で「初期マークダウン送信」「保存リクエスト」「未保存フラグ」などをやり取り
  - Webview 側: 開いているドキュメントのテキストを受け取り `parseMarkdownToMindNode` で表示
  - 保存時: Webview から「現在の MindNode」または「シリアライズ済みマークダウン」を受け取り、拡張側でファイルに書き戻す

---

## 3. ファイル I/O とマークダウン連携

- [ ] **ドキュメントの読み込み**
  - カスタムエディタを開いたとき、対象の `Uri` から `vscode.workspace.fs` または `vscode.workspace.openTextDocument` で内容を取得
  - 取得したテキストを Webview に送り、既存の `parseMarkdownToMindNode`（`src/markdown/parse.ts`）でツリー化して表示
- [ ] **ドキュメントへの書き戻し**
  - ユーザーが保存したとき、Webview から受け取ったマークダウン（`serializeMindNodeToMarkdown`）で `TextDocument` を編集
  - `vscode.workspace.applyEdit` または `TextDocument.save()` と整合する形で、未保存インジケータを管理
- [ ] **外部変更・競合の扱い**
  - ファイルがエディタ外で変更された場合の再読み込みや「ファイルが変更されました」の扱い（必要なら `CustomDocument` の `onDidChange` 等を検討）
- [ ] **未保存状態の表示**
  - マインドマップ側で編集したら「未保存」とし、保存コマンドまたは Ctrl+S で上記「書き戻し」を実行

---

## 4. コマンド・UX

- [ ] **コマンドの登録**
  - 例: 「マインドマップで開く」→ 現在の .md をマインドマップ Webview で開く
  - `contributes.commands` と `contributes.menues`（エディタタイトルバー・コマンドパレットなど）
- [ ] **エディタタブとの対応**
  - 同じ .md を「テキスト」と「マインドマップ」の両方で開けるようにするか、切り替えのみにするか方針を決める
- [ ] **設定項目（任意）**
  - テーマ（ダーク/ライト）は VSCode のテーマに合わせるか、`vscode.getConfiguration` で取得して Webview に渡す
  - フォントサイズ、レイアウト定数（GAP_X など）を設定で変えられるようにするか

---

## 5. ビルド・パッケージ・デバッグ

- [ ] **拡張のビルドスクリプト**
  - Node 用エントリ（`extension.ts`）をバンドルして `dist/extension.js` を生成（esbuild / tsc + webpack など）
- [ ] **Webview 用ビルド**
  - 既存の Vite ビルドを拡張から参照できるパスに出力（例: `dist/webview/`）。`index.html` を Webview のベース HTML に流用するか、拡張側で HTML を組み立てる
- [ ] **launch.json の追加**
  - `Extension Development Host` で拡張を起動し、.md を開いてマインドマップ表示・保存までを手動検証できるようにする
- [ ] **パッケージ化（任意）**
  - `@vscode/vsce` で `.vsix` を生成。マーケットプレース公開は別途手順で対応

---

## 6. 既存コードの流用・制約

- [ ] **フロント資産のそのまま利用**
  - `MindMap`、`Node`、`useDagreLayout`、`useMindMapState`、`useNodeOperations` などはそのまま利用する想定
  - 永続化は「メモリ上の MindNode → マークダウン」のみだった部分を「拡張から渡されたマークダウン → MindNode」「保存時に MindNode → マークダウン → ファイル」に接続する
- [ ] **エントリの分離**
  - `src/main.tsx` は現状「スタンドアロン用」。拡張では「Webview 用エントリ」を別ファイル（例: `src/webview/main.tsx`）にし、初期データを `postMessage` で受け取る形にするとよい
- [ ] **Node 環境と DOM**
  - 拡張本体（extension.ts）は Node 環境。パース/シリアライズ（`parse.ts`, `serialize.ts`）は Node でも動くので、必要なら拡張側で直接呼び、Webview には「マークダウン文字列」だけ渡す構成も可能
- [ ] **テスト**
  - 既存の Vitest テストはそのまま活用。拡張固有の I/O 部分（ファイル読み書きのモック）用のテストを追加するとよい

---

## 参照

- [map-json-design.md](map-json-design.md) - マークダウン形式での保存設計
- [node-requirements.md](node-requirements.md) - Node.js バージョン要件
- [layout-algorithm.md](layout-algorithm.md) - レイアウト仕様
- VSCode 公式: [Webview API](https://code.visualstudio.com/api/extension-guides/webview), [Custom Editors](https://code.visualstudio.com/api/extension-guides/custom-editors)
