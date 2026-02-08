/**
 * イベントハンドラーの共通化ユーティリティ
 *
 * マインドマップで使用するイベントハンドラーの共通処理を提供します。
 */

/**
 * イベント伝播を停止する共通ハンドラー
 *
 * イベントの伝播とデフォルト動作を停止します。
 * ノードのクリックやドラッグ時に、親要素へのイベント伝播を防ぐために使用します。
 *
 * @param e - イベントオブジェクト（マウス、タッチ、ホイールイベント）
 * @returns void
 *
 * @example
 * ```tsx
 * <div onClick={stopEventPropagation}>
 *   ノードコンテンツ
 * </div>
 * ```
 */
export function stopEventPropagation(e: React.MouseEvent | React.TouchEvent | React.WheelEvent) {
  e.stopPropagation();
  e.preventDefault();
}

/**
 * タッチイベントで二本指操作を防ぐハンドラー
 *
 * タッチイベントで二本指操作（ピンチズームなど）を検出し、それを防ぎます。
 * 一本指のタッチ操作のみを許可します。
 *
 * @param e - タッチイベントオブジェクト
 * @returns void
 *
 * @example
 * ```tsx
 * <div onTouchStart={preventMultiTouch} onTouchMove={preventMultiTouch}>
 *   ノードコンテンツ
 * </div>
 * ```
 */
export function preventMultiTouch(e: React.TouchEvent) {
  if (e.touches.length > 1) {
    e.preventDefault();
    e.stopPropagation();
  } else {
    e.stopPropagation();
  }
}
