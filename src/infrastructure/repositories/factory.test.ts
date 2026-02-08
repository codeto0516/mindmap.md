import { describe, it, expect } from "vitest";

import {
  createMapContentRepository,
  createMapRepository,
} from "./factory";

describe("repository factory", () => {
  it("createMapContentRepository は Mock 実装を返す", () => {
    const repo = createMapContentRepository();
    expect(typeof repo.getContent).toBe("function");
    expect(typeof repo.saveContent).toBe("function");
  });

  it("createMapRepository は Mock 実装を返す", () => {
    const repo = createMapRepository();
    expect(repo).toHaveProperty("setInitialData");
    expect(repo).toHaveProperty("clear");
  });
});
