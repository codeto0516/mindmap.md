# mindmap.md

**マークダウンファイルをマインドマップとして編集できる** VSCode / Cursor 用の拡張機能です。

## 概要

- エディタ内でマークダウンをツリー構造のマインドマップとして表示・編集できます。
- ノードの追加・編集・削除・ドラッグによる階層変更など、マインドマップとしての操作をサポートします。
- フロントは Vite + React で構築し、DAG レイアウト（dagre）やドラッグ＆ドロップ（@dnd-kit）などを利用しています。

## 技術スタック

- **フロント**: React 19, Vite 6, Tailwind CSS, @xyflow/react, dagre
- **状態・データ**: MindNode 型でツリーを表現。永続化はマークダウンファイル（見出し階層でマインドマップを表現）のみ。
- **テスト**: Vitest, Testing Library

## 開発の始め方

### 必要環境

- Node.js（[docs/node-requirements.md](docs/node-requirements.md) を参照）
- pnpm

### セットアップ

```bash
pnpm install
```

### 開発サーバー（マインドマップ UI の開発）

```bash
pnpm dev
```

ブラウザで [http://localhost:5173](http://localhost:5173) を開くと、マインドマップ UI を単体で確認できます。エントリは `src/main.tsx` です。ファイルを編集するとホットリロードで反映されます。

### ビルド・プレビュー

```bash
pnpm build
pnpm preview
```

## その他のコマンド

| コマンド             | 説明                       |
| -------------------- | -------------------------- |
| `pnpm lint`          | ESLint でコードチェック    |
| `pnpm test`          | Vitest で単体テスト実行    |
| `pnpm test:ui`       | Vitest UI でテスト実行     |
| `pnpm test:coverage` | カバレッジ付きでテスト実行 |
| `pnpm format`        | Prettier でフォーマット    |
| `pnpm format:check`  | フォーマットチェック       |

## ドキュメント

- [docs/note.md](docs/note.md) - プロダクトノート・コンセプト
- [docs/map-json-design.md](docs/map-json-design.md) - マークダウン形式での保存設計
- [docs/node-requirements.md](docs/node-requirements.md) - Node.js バージョン要件
