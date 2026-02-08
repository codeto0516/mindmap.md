/**
 * マインドマップの定数定義
 */

/**
 * ズーム設定
 */
export const ZOOM_CONFIG = {
  /** 最小ズーム倍率 */
  MIN_SCALE: 0.1,
  /** 最大ズーム倍率 */
  MAX_SCALE: 3,
  /** ズーム率の係数 */
  ZOOM_FACTOR: 0.01,
} as const;

/**
 * タイムアウト設定
 */
export const TIMEOUT_CONFIG = {
  /** 初期位置設定の遅延（ミリ秒） */
  INITIAL_POSITION_DELAY: 100,
} as const;

/**
 * ノード幅設定
 */
export const NODE_WIDTH_CONFIG = {
  /** 最小幅（px） */
  MIN_WIDTH: 80,
  /** 最大幅（px） */
  MAX_WIDTH: 400,
} as const;

/**
 * ノード編集設定
 */
export const NODE_EDIT_CONFIG = {
  /** テキストエリアの最大高さ（px） */
  MAX_TEXTAREA_HEIGHT: 200,
  /** ノードカードの最小高さ（px） */
  MIN_CARD_HEIGHT: 36,
  /** ノードカードの縦方向パディング（px） */
  CARD_PADDING_Y: 16,
} as const;

/**
 * ノードカードのセレクター（EditMode で使用）
 */
export const NODE_CARD_SELECTOR = "div.flex.items-center.justify-start";

/**
 * デフォルト値
 */
export const DEFAULTS = {
  /** デフォルトのSVG幅 */
  SVG_WIDTH: 800,
  /** デフォルトのSVG高さ */
  SVG_HEIGHT: 600,
  /** デフォルトのノードタイトル */
  NODE_TITLE: "新しいノード",
  /** 初期描画時のノード幅（統一値・px） */
  NODE_WIDTH: 172,
} as const;
