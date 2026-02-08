# VSCode / Cursor 拡張機能化 TODO

マークダウンをマインドマップとして編集できる **VSCode / Cursor 用拡張機能** にするために必要な作業をまとめています。現状は Vite + React の Web アプリとして開発済み。これを拡張の Webview 内で動かし、開いている .md ファイルと連携させることを目指す。

---

## 1. 拡張の骨格・プロジェクト構成

- [x] **拡張用 package.json の整備**
  - `name`, `displayName`, `description`, `publisher`, `repository` などメタデータ
  - `engines.vscode` でサポートする VSCode 最小バージョン（例: `^1.85.0`）
  - `main` でエントリポイント（例: `dist/extension.js`）
  - `activationEvents`: contributes から自動付与のため未記載
  - `contributes`: コマンド・カスタムエディタ・メニュー（実装済み）
- [x] **拡張エントリポイントの作成**
  - `src/extension/extension.ts` で `activate` / `deactivate` を実装。CustomTextEditorProvider 登録と「マインドマップで開く」コマンドを実装
  - 拡張のビルドは esbuild で `scripts/build-extension.mjs` → `dist/extension.js` を出力
- [x] **モノレポ or サブパッケージの検討**
  - 採用: 単一リポジトリで `src/extension`（Node）＋ 既存 `src`（Vite/Webview 用）。`src/webview` は後続で必要に応じて追加

---

## 2. エディタ連携（Custom Editor / Webview）

- [x] **カスタムエディタの登録**
  - `contributes.customEditors` で `.md` をマインドマップ用エディタとして登録済み（`viewType: mindmap.md.markdown`、`selector: *.md`）
  - `CustomTextEditorProvider` で登録。必要に応じて「既定のエディタ」にできるようにする
- [x] **Webview の作成と React の埋め込み**
  - Webview は `resolveCustomTextEditor` 内で作成。Vite ビルド（`pnpm run build:webview`）で `dist/webview/` に出力した HTML/JS/CSS を `getWebviewHtml` で読み、アセットを `asWebviewUri` で差し替えて表示
  - React アプリは `src/webview/main.tsx` をエントリにビルドし、MindMap + マークダウンパース/シリアライズをそのまま利用
  - バンドル: `vite.webview.config.ts` で `index-webview.html` を入力に `dist/webview` へ出力。extension 側で fs で HTML を読み、CSP nonce 付きで差し替え
- [x] **Webview と拡張のメッセージング（骨格）**
  - `postMessage` / `onDidReceiveMessage` で `ready` → `init`（初期テキスト送信）、編集時は Webview から `save`（シリアライズ済みテキスト）を送り拡張が `WorkspaceEdit.replace` で書き戻し
  - Webview 側: `src/webview/main.tsx` で `parseMarkdownToMindNode` で表示、`onChange` で debounce して `serializeMindNodeToMarkdown` を送信
  - 保存時: 拡張側で `message.type === 'save'` かつ `message.text` を `WorkspaceEdit.replace` で書き戻す処理は実装済み

---

## 3. ファイル I/O とマークダウン連携

- [x] **ドキュメントの読み込み**
  - CustomTextEditor のため開いた時点で `TextDocument` が渡る。`document.getText()` を Webview に `init` で送り、Webview 側で `parseMarkdownToMindNode` でツリー化して表示済み
- [x] **ドキュメントへの書き戻し**
  - Webview の編集で Webview から `save` でマークダウン文字列を受け取り、`WorkspaceEdit.replace` で `TextDocument` を更新。未保存は VS Code が自動管理
- [x] **外部変更・競合の扱い**
  - `onDidChangeTextDocument` でドキュメント変更を購読し、外部変更時に `init` を送って Webview を更新。自発的な `applyEdit` 直後のイベントは `skipNextChangeForUri` でスキップし、二重更新を防止
- [x] **未保存状態の表示**
  - Webview で編集するたびに `WorkspaceEdit` で Document を更新しているため、VS Code が自動で未保存表示。ユーザーが Ctrl+S で保存するとファイルに書き込まれる

---

## 4. コマンド・UX

- [x] **コマンドの登録**
  - 「マインドマップで開く」(`mindmap-md.openAsMindMap`) を実装。現在の .md を `vscode.openWith(uri, viewType)` でマインドマップで開く
  - `contributes.commands` と `contributes.menus.commandPalette` に登録済み。`editor/title/context`（エディタタブの⋯メニュー）にも登録しており、.md を開いているとき「マインドマップで開く」が表示される
- [x] **エディタタブとの対応**
  - 同じ .md を「テキスト」と「マインドマップ」の両方で開ける（Reopen with で切り替え）。Custom Editor の selector で `*.md` に `priority: "option"` を指定しているため、既定はテキストで開き、エディタの⋯メニュー「マインドマップで開く」や Reopen with で必要に応じてマインドマップで開く運用
- [x] **設定項目（テーマ）**
  - `mindmap-md.theme`（auto | light | dark）を contributes に追加。`getThemeForWebview()` で取得し、`init` / `theme` メッセージで Webview に渡す。`onDidChangeActiveColorTheme` でテーマ変更時も送信。Webview はルートに `dark` クラスを付与（main.css で `@custom-variant dark` を定義）。フォントサイズ・レイアウト定数は未対応

---

## 5. ビルド・パッケージ・デバッグ

- [x] **拡張のビルドスクリプト**
  - `scripts/build-extension.mjs`（esbuild）で `src/extension/extension.ts` を `dist/extension.js` にバンドル。`pnpm run build:extension`
- [x] **Webview 用ビルド**
  - `vite.webview.config.ts` で `index-webview.html` をエントリに `dist/webview/` へ出力。`pnpm run build:webview`。extension の `getWebviewHtml` で `index-webview.html` を読み、アセット URI を差し替えて表示
- [x] **launch.json の追加**
  - `.vscode/launch.json` に「拡張を起動 (Extension Development Host)」を追加。`preLaunchTask: build:extension-and-webview` で拡張＋Webview をビルド後に起動
- [x] **パッケージ化（任意）**
  - `@vscode/vsce` を devDependency に追加。`pnpm run package` で拡張＋Webview をビルド後に `vsce package --no-dependencies` を実行し `.vsix` を生成。`.vscodeignore` でソース・開発用・スタンドアロン用 dist を除外。`package.json` の `repository.url` が空だと vsce がエラーになるため、パッケージ化前に URL を設定するか、手動で `--baseContentUrl` / `--baseImagesUrl` を指定すること。マーケットプレース公開は別途手順で対応

---

## 6. 既存コードの流用・制約

- [x] **フロント資産のそのまま利用**
  - `MindMap`、`Node`、`useDagreLayout`、`useMindMapState`、`useNodeOperations` などはそのまま利用。Webview 側で `parseMarkdownToMindNode` / `serializeMindNodeToMarkdown` で入出力
  - 永続化: 拡張から `init` でマークダウン → Webview で MindNode にパースして表示。編集時は debounce で `save` にシリアライズ済みマークダウンを送り、拡張が `WorkspaceEdit` で書き戻し
- [x] **エントリの分離**
  - `src/main.tsx` はスタンドアロン用のまま。`src/webview/main.tsx` を Webview 用エントリとして追加し、`postMessage`（`ready` / `init` / `save`）で拡張と連携
- [x] **Node 環境と DOM**
  - 拡張本体（extension.ts）は Node 環境。現状は Webview 側でパース/シリアライズを実行する構成のまま。必要に応じて拡張側で直接呼ぶ構成にも変更可能
- [x] **テスト**
  - 既存の Vitest テストはそのまま活用。拡張のテーマ解決ロジックを `src/extension/theme.ts`（`resolveTheme`）に分離し、`theme.test.ts` でユニットテストを追加済み

---

## 参照

- [map-json-design.md](map-json-design.md) - マークダウン形式での保存設計
- [node-requirements.md](node-requirements.md) - Node.js バージョン要件
- [layout-algorithm.md](layout-algorithm.md) - レイアウト仕様
- VSCode 公式: [Webview API](https://code.visualstudio.com/api/extension-guides/webview), [Custom Editors](https://code.visualstudio.com/api/extension-guides/custom-editors)
