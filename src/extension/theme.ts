/**
 * 設定と VSCode のカラーテーマから Webview 用のテーマを解決する。
 * ユニットテスト可能な純粋関数として分離。
 */
export function resolveTheme(
  setting: "auto" | "light" | "dark",
  colorThemeKind: number
): "light" | "dark" {
  if (setting === "light") return "light";
  if (setting === "dark") return "dark";
  // ColorThemeKind.Light === 1
  return colorThemeKind === 1 ? "light" : "dark";
}
