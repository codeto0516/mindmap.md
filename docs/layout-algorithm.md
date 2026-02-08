# マインドマップ レイアウトアルゴリズム

メインのマインドマップ（`app/page.tsx` → `components/MindMap`）で使っているツリーレイアウトの仕様と実装のメモ。あとから見直す用。

## 概要

- **方針**: 右展開（LR）のツリー。親ノードは**直下の子ノード群の縦方向の中心**に配置する。
- **実装**: `components/hooks/useDagreLayout.ts` の `layoutTree`（フック名は歴史的経緯で `useDagreLayout` のまま）。

## 用語

- **子ノードグループ / 子グループ**: そのノードの**1つ下の階層**のノードだけの集合。孫以下は含めない。
- **nodeCenterY**: 各ノードの「縦方向の中心」の Y 座標（ノード上端 + 高さ/2）。

## ルール

1. **X 座標**: 親の右端 + `GAP_X`。ルートは `x = 0`。子は `x = 親の右端 + GAP_X`（`GAP_X = 220`）。ノード幅は `nodeWidths` で渡し、親をリサイズしても子ノードにかぶらない。
2. **末端ノード（子なし）**: 親から渡された `startY` を上端としてそのまま配置。兄弟は上から順に `currentY = 前の子の bottomY + GAP_Y` で並べる。
3. **親ノードの Y 座標**:  
   直下の子ノードそれぞれの **nodeCenterY** を求め、その**平均**に親の中心が来るようにする。  
   つまり「子のサブツリー全体の範囲」ではなく、「1つ下の階層のノードの中心」だけで親の位置を決める。
4. **折りたたみ**: レイアウト計算の前に `filterCollapsed` で折りたたまれたノードの子を落としたツリーを使う。

## 再帰の流れ（layoutTree）

- **入力**: 対象ノード、親の右端 X `parentRightEdge`（ルートのとき 0）、このサブツリーの開始 Y `startY`、ノード高さマップ `heights`、ノード幅マップ `widths`、出力用の `nodes` / `edges`、元データ `data`。
- **出力**: `{ topY, bottomY, nodeCenterY }`
  - `topY` / `bottomY`: このサブツリーが占める Y 範囲（兄弟の積み上げに使用）。
  - `nodeCenterY`: **このノード自身**の縦方向の中心。親が「直下の子の中心」で揃えるときに使う。

**末端（子なし）**

- ノードを `(parentRightEdge === 0 ? 0 : parentRightEdge + GAP_X, startY)` に配置。
- `topY = startY`, `bottomY = startY + height`, `nodeCenterY = startY + height/2` を返す。

**子あり**

1. 各子について `layoutTree` を呼ぶ。子の `parentRightEdge` はこのノードの右端（`x + width`）。子の `startY` は前の子の `bottomY + GAP_Y`（最初の子は `startY`）。
2. 各子の戻り値から `nodeCenterY` を集め、その平均を親の「中心の Y」とする。  
   → 親の上端は `y = (平均) - height/2`。
3. 親を `(parentRightEdge === 0 ? 0 : parentRightEdge + GAP_X, y)` に配置。
4. `topY = min(子の topY)`, `bottomY = max(子の bottomY)`、`nodeCenterY = y + height/2` を返す。

## 定数（useDagreLayout.ts）

| 定数          | 値  | 意味                           |
| ------------- | --- | ------------------------------ |
| `GAP_X`       | 50  | 親の右端と子の左端の間隔（px） |
| `GAP_Y`       | 10  | 兄弟ノード間の縦の間隔（px）   |
| `NODE_HEIGHT` | 36  | 高さ未計測時のデフォルト（px） |
| `NODE_WIDTH`  | 172 | 幅未計測時のデフォルト（px）   |

ノードの高さは `nodeHeights`、幅は `nodeWidths` で渡し、未計測時は上記デフォルトを使う。

## 子グループの中心に合わせる理由

- 親を「子のサブツリー全体の範囲」の中心にすると、子の下に孫がたくさんいる場合、親がその孫たちの方向に寄ってしまう。
- 「直下の子ノードだけ」の中心に合わせることで、見た目上「親が子たちの真ん中にいる」ようになり、階層関係が分かりやすくなる。

## 関連コード

- レイアウト: `components/hooks/useDagreLayout.ts`（`layoutTree`, `useDagreLayout`）
- 利用箇所: `components/MindMap/index.tsx`（`useDagreLayout(data, nodeHeights, nodeWidths, layoutVersion)` で nodes/edges を取得）
- プロトタイプ: `app/v2/MindMap.tsx` に同じ考え方のシンプル版あり（`layoutTree` + 子範囲の中心。v2 は「子ノードの中心」ではなく「子サブツリー範囲の中心」だったが、本番は上記の通り直下の子の中心に変更済み）
