# ノード機能要件

このドキュメントは、マインドマップのノードコンポーネントの機能要件を定義します。

## ユーザーから見た振る舞い

### 表示・編集

#### 表示モード
- ノードのタイトル（`MindNode.title`）を表示する
- テキストは折り返し可能（`whitespace-pre-wrap` / `break-words`）
- 長いテキストは省略表示（`truncate`）

#### 編集開始
- **ダブルクリック**: ノードカードをダブルクリックすると編集モードに入る
- **Spaceキー**: ノードが選択されている状態でSpaceキーを押すと編集モードに入る
- **文字キー**: ノードが選択されている状態で文字キー（1文字）を押すと編集モードに入り、押した文字で既存タイトルを上書きする

#### 編集終了
- **Enterキー（Shiftなし）**: 編集内容を保存して編集モードを終了する
- **Shift+Enter**: 改行を挿入する（編集は継続）
- **Escapeキー**: 編集内容を破棄して編集モードを終了する（元のタイトルに戻る）
- **フォーカスアウト（blur）**: 編集内容を保存して編集モードを終了する
- **IME確定**: 日本語入力中にEnterキーを押しても編集は終了しない（変換確定として扱う）

#### 保存ルール
- 保存時にテキストの前後の空白を削除（`trim()`）
- トリム後のテキストが空の場合は、元のタイトルに戻す（保存しない）
- 保存時に `onUpdateTitle(id, title)` と `onEndEdit()` が呼ばれる

### レイアウト連携

#### 高さ
- ResizeObserver でノードカードの高さを計測し、親コンポーネントに `onNodeHeightChange(id, height)` で通知する
- ノードの幅が変更された後は、二重 rAF（requestAnimationFrame）でレイアウト・ペイント完了後に高さを再計測してから通知する
- これにより、ノードの重なりを防ぎ、レイアウトが正しく計算される

#### 幅
- `currentWidth` と `onWidthConfirm` が渡されている場合のみ、幅リサイズハンドルを表示する
- 幅の最小値は 80px、最大値は 400px
- ドラッグ中は破線のプレビュー枠を表示し、実際のノード幅は変更しない
- mouseup 時に `onWidthConfirm(finalWidth)` を呼び出して幅を確定する
- 編集モード中は幅リサイズハンドルを非表示にする

### フォーカス・選択（イベント駆動）

#### 編集終了時のフォーカス
- 編集モードを終了したとき（Enter / Escape / blur）、ノードカードにフォーカスを戻す
- これにより、Enter / Tab キーで兄弟・子ノードを追加できるようになる
- **実装**: EditMode の onBlur / 保存コールバック内で、親が渡した `onEndEdit()` のあとにノードカードへ `focus()` する。useEffect は使わない。

#### 選択時のフォーカス
- ノードをクリックしたとき、クリックされたカードにフォーカスを移す
- 矢印キーで選択を変更したとき、新しく選択されたノードのカードにフォーカスを移す
- **実装**: 
  - クリック時: `handleNodeClick` 内で `(event.target as HTMLElement).closest('[data-node-id]')?.focus()` する
  - 矢印キー時: `selectNode(nodeId)` のなかで `focusNodeCard(nodeId)` を呼ぶ
  - Node 側の「selected の変化でフォーカス」の useLayoutEffect は廃止する

### 子ノード・エッジ

#### 子ノードがある場合
- ノードの右側に展開/折りたたみボタン（RightHandle）を表示する
- `mindNode.collapsed === true` のとき（折りたたまれている）:
  - ボタンに子ノードの数を表示する（99個以上の場合は「99+」と表示）
  - ボタンをクリックすると展開する
  - 右側に source ハンドル（エッジの接続点）を表示する
- `mindNode.collapsed !== true` のとき（展開されている）:
  - ボタンに「−」を表示する
  - ボタンをクリックすると折りたたむ
  - source ハンドルは表示しない

#### エッジ（接続線）
- 左側: 常に target ハンドルを表示する（親からの接続を受け付ける）
- 右側: 子ノードがあり、かつ折りたたまれている場合のみ source ハンドルを表示する（子への接続を開始できる）

### 見た目・アクセシビリティ

#### カードのスタイル
- 最小高さ: 36px
- 選択時: 青い枠線（`border-blue-500`）、影を強調（`shadow-lg`）、少し拡大（`scale-105`）
- 未選択時: 透明な枠線、ホバー時に zinc 色の枠線を表示
- ダークモード対応: `dark:` プレフィックスでダークモード時の色を指定

#### フォーカス管理
- `data-node-id` 属性でノードを識別する
- `tabIndex={-1}` でフォーカス可能にする（キーボード操作のため）
- フォーカスリングは `focus:outline-none` で非表示にする（カスタムスタイルで選択状態を表示）

#### 幅リサイズハンドル
- 編集モード中は非表示にする

---

## 実装の契約（コールバック・Props）

### Node コンポーネントの Props

```typescript
interface Props {
  data: {
    mindNode: MindNode;                    // ノードのデータ
    isEditing?: boolean;                   // 編集中かどうか
    onStartEdit?: (nodeId: string) => void; // 編集開始時のコールバック
    onEndEdit?: () => void;                // 編集終了時のコールバック
    onUpdateTitle?: (nodeId: string, title: string) => void; // タイトル更新時のコールバック
    onNodeHeightChange?: (nodeId: string, height: number) => void; // 高さ変更時のコールバック
    onToggleNode?: (nodeId: string) => void; // 展開/折りたたみ時のコールバック
    currentWidth?: number;                 // 現在のノード幅
    onWidthConfirm?: (width: number) => void; // 幅確定時のコールバック
    initialEditKey?: string;              // 文字キーで編集開始したときの初期文字
  };
  selected: boolean;                       // ノードが選択されているかどうか
  id: string;                             // ノードID
}
```

### コールバックの役割

- **onStartEdit**: 編集モードを開始する。MindMap が `editingNodeId` を更新する。
- **onEndEdit**: 編集モードを終了する。MindMap が `editingNodeId` を `null` に設定する。**実装**: Node が EditMode に渡す `onEndEdit` は、`data.onEndEdit()` を呼んだあと `cardRef.current?.focus()` するラッパーにする。
- **onUpdateTitle**: ノードのタイトルを更新する。MindMap がデータを更新する。
- **onNodeHeightChange**: ノードの高さが変わったことを親に通知する。MindMap が `nodeHeights` を更新し、レイアウトを再計算する。
- **onToggleNode**: ノードの展開/折りたたみを切り替える。MindMap が `mindNode.collapsed` を更新する。
- **onWidthConfirm**: ノードの幅を確定する。MindMap が `nodeWidths` を更新し、レイアウトを再計算する。

### イベントハンドラ

#### キーボード（イベント駆動）
- **ペインの onKeyDown**: どのノードにもフォーカスがないとき、マップのペインでキー入力を検知する
- **ノードカードの onKeyDown**: ノードにフォーカスがあるとき、そのカードでキー入力を検知する
- `window.addEventListener("keydown")` と useEffect は使わない

#### マウス
- **onDoubleClick**: ノードカードをダブルクリックすると編集モードに入る
- **onClick**: RightHandle のボタンをクリックすると展開/折りたたみを切り替える
- **onMouseDown / onMouseMove / onMouseUp**: WidthResizeHandle で幅をリサイズする

#### フォーカス
- **onBlur**: EditMode の textarea からフォーカスが外れたとき、編集内容を保存する

---

## 実装の原則

### useEffect を避け、イベントハンドラで検知する

- **理由**: useEffect に頼ると「状態とタイミング」の扱いが難しくなり、再現しづらいバグや依存配列のずれが起きやすい。イベント駆動にすると「いつ・何が起きたか」が明確になる。
- **キーボード**: Enter / Tab / 矢印 / Delete / Space / 文字キーなどは、ノードカードにフォーカスがあるときはそのカードの `onKeyDown`、どのノードにもフォーカスがないときはマップ（ペイン）の `onKeyDown` で処理する。
- **フォーカス**: 編集終了時は EditMode の onBlur / 保存コールバック内で実行する。選択時は `handleNodeClick` 内で `closest('[data-node-id]')?.focus()` し、矢印キーで選択変更したときは `selectNode(nodeId)` のなかで `focusNodeCard(nodeId)` を呼ぶ。
- **高さ計測**: ResizeObserver の登録・解除は ref コールバックで行う。幅変更後の高さ再計測だけは「prop 変更の後」に動かす必要があるため、例外として 1 つの useLayoutEffect を許容する。

### コンポーネント指向・責務分離

- **単一責任**: 各コンポーネント・フックは「一つの役割」だけ持つ
- **ロジックとUIの分離**: ロジックはカスタムフック、コンポーネントは主にUIの描画に集中
- **コンポジション**: 小さなコンポーネントを組み合わせてノードを構成する
