import { describe, it, expect } from "vitest";
import { resolveTheme } from "./theme";

const ColorThemeKind = { Light: 1, Dark: 2, HighContrast: 3 } as const;

describe("resolveTheme", () => {
  it("setting が light のとき常に light を返す", () => {
    expect(resolveTheme("light", ColorThemeKind.Light)).toBe("light");
    expect(resolveTheme("light", ColorThemeKind.Dark)).toBe("light");
    expect(resolveTheme("light", ColorThemeKind.HighContrast)).toBe("light");
  });

  it("setting が dark のとき常に dark を返す", () => {
    expect(resolveTheme("dark", ColorThemeKind.Light)).toBe("dark");
    expect(resolveTheme("dark", ColorThemeKind.Dark)).toBe("dark");
  });

  it("setting が auto のとき colorThemeKind に従う", () => {
    expect(resolveTheme("auto", ColorThemeKind.Light)).toBe("light");
    expect(resolveTheme("auto", ColorThemeKind.Dark)).toBe("dark");
    expect(resolveTheme("auto", ColorThemeKind.HighContrast)).toBe("dark");
  });
});
