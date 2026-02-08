# マークダウン形式での保存設計

マインドマップは**マークダウンファイル**として永続化する。拡張機能で開いた .md の内容をそのままマップとして編集し、保存時にファイルに書き戻す。

---

## 1. 形式

- **見出しレベルで階層を表現する**
  - `# タイトル` = ルート（1 ノードのみ）
  - `## タイトル` = ルートの直下（2 階層目）
  - `### タイトル` = 3 階層目、以降同様
- **1 行 = 1 ノード**。空行は無視する。
- 先頭に有効な見出しが無い、または先頭が `#`（レベル 1）でない場合は「ルートのみ・無題」として扱う。

### 例

```markdown
# ルート
## 子 A
### 孫 A1
### 孫 A2
## 子 B
```

---

## 2. 実装

| 役割 | 配置 |
|------|------|
| MindNode 型 | `src/types/mind-node.ts` |
| マークダウン → MindNode | `src/markdown/parse.ts`（`parseMarkdownToMindNode`） |
| MindNode → マークダウン | `src/markdown/serialize.ts`（`serializeMindNodeToMarkdown`） |

- **collapsed** / **type** / **metadata** は初版ではマークダウンに含めない。必要になったら YAML frontmatter や行末コメントで拡張する。

---

## 3. 参照

- 型: `src/types/mind-node.ts`
- パース・シリアライズ: `src/markdown/index.ts`
