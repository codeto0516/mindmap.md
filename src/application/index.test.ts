import { describe, it, expect } from "vitest";

import * as app from "./index";

describe("application/index", () => {
  it("map のユースケースをエクスポートしている", () => {
    expect(typeof app.getMap).toBe("function");
    expect(typeof app.getMapById).toBe("function");
  });
});
