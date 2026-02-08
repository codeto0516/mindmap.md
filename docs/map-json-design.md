# マップ JSON 保存設計（将来 RDB 移行を見据えた設計）

マインドマップの「ノード集合」を 1 つの JSON として保存する設計と、将来の `map_nodes` テーブルへの移行方針をまとめる。

---

## 1. 前提方針

- **初期フェーズ**: マップ構造は「1 つの JSON」として `maps.content` に保存する。
- **将来**: JSON を正規化し、`maps` / `map_nodes`（および必要なら `map_edges` や `parent_id`）の RDB 構造に移行する。
- **最優先**: 「最初から正規化しないが、後で壊さず移行できる」形で設計する。

---

## 2. 設計ルール

1. **JSON 構造は domain に依存しない純粋なデータ構造**とする。
   - UI 状態（zoom / viewport / selection など）は JSON に含めない。
2. **MapJSON のスキーマ**を TypeScript の型として定義する。
   - 将来 `map_nodes` テーブルの 1 行に 1:1 で展開できる形にする。
3. **JSON を直接扱うのは Infrastructure 層のみ**とする。
4. **Application / Domain 層**は
   - MapAggregate
   - MapNode（＝ Node）
   - MapId / NodeId
   などのドメインモデルを介して操作する。

---

## 3. JSON 構造の制約

- 各ノードは必ず一意な `id`（nodeId）を持つ。
- 親子関係は **parentId** で表現する（`children` 配列のネストは禁止）。
- ノード配列は **フラット構造** にする。
- 並び順は **order** フィールドで表現する。
- 後からノード単位で差分保存できる形を想定する。

### 例

```json
{
  "nodes": [
    {
      "id": "node-1",
      "parentId": null,
      "text": "Root",
      "order": 0,
      "type": "root"
    }
  ]
}
```

---

## 4. 実装の配置

| 役割 | 配置 | 説明 |
|------|------|------|
| MapJSON / MapNodeJSON 型 | `src/infrastructure/map-json/types.ts` | 純粋データ。将来 map_nodes と 1:1 対応。 |
| MapAggregate / Node（MapNode） | `src/domain/model/map/` | 集約ルートとエンティティ。 |
| JSON → Domain 変換 | `src/infrastructure/map-json/map-json-mapper.ts` | `toMapAggregate(mapId, json)`。 |
| Domain → JSON 変換 | 同上 | `toMapJSON(aggregate)`。 |
| MapContentRepository インターフェース | `src/domain/model/map/map-content-repository.ts` | `getContent` / `saveContent`。 |
| MapContentRepository 実装 | `src/infrastructure/repositories/prisma/prisma-map-content-repository.ts` | Map.content カラムの読み書き。 |

---

## 5. 型定義の対応関係

| MapJSON / MapNodeJSON | ドメイン（Node） | 将来 map_nodes 想定 |
|-----------------------|------------------|----------------------|
| id | id (NodeId) | id (PK) |
| parentId | parentId (NodeId \| null) | parent_id (FK, nullable) |
| text | text | text |
| order | order | order |
| type | type (NodeType) | type |
| （なし） | mapId | map_id (FK) |
| （なし） | position | レイアウト算出 or 別カラム |

- **position** は JSON に含めない。Domain ではレイアウト算出前は (0, 0) をデフォルトとし、UI 層で計算する想定。

---

## 6. 将来の RDB 移行

### 6.1 移行時の方針

- **MapContentRepository** のインターフェースは変更しない。
- 実装を「Map.content の JSON 読み書き」から「map_nodes の SELECT / INSERT / UPDATE」に差し替える。
- Application / Domain 層は MapAggregate を介して操作するため、呼び出し側の変更は最小限にする。

### 6.2 移行時に必要なマッピング

- **既存データ**: `Map.content` をパースし、`nodes` の各要素を `map_nodes` に 1 行ずつ INSERT するバッチを用意する。
- **toMapAggregate 相当**: map_nodes から取得した行を Node[] にマッピングする処理に置き換える。
- **toMapJSON**: RDB 移行後は「一括エクスポート」や「スナップショット JSON 出力」用に残すか検討する。

### 6.3 NG にすること

- JSON 構造に UI 専用の状態を混ぜない。
- `children` のネスト構造をそのまま保存しない。
- フロントコンポーネントが JSON を直接操作しない。

---

## 7. 参照

- 型定義: `src/infrastructure/map-json/types.ts`
- マッパー: `src/infrastructure/map-json/map-json-mapper.ts`
- ドメイン: `src/domain/model/map/map-aggregate.ts`, `node.ts`, `map-content-repository.ts`
- 永続化: `prisma/schema.prisma` の `Map.content`、`prisma-map-content-repository.ts`
