import { describe, it, expect } from "vitest";
import {
  ZOOM_CONFIG,
  TIMEOUT_CONFIG,
  NODE_WIDTH_CONFIG,
  NODE_EDIT_CONFIG,
  NODE_CARD_SELECTOR,
  DEFAULTS,
} from "./constants";

describe("constants", () => {
  describe("ZOOM_CONFIG", () => {
    it("MIN_SCALEが0.1である", () => {
      expect(ZOOM_CONFIG.MIN_SCALE).toBe(0.1);
    });

    it("MAX_SCALEが3である", () => {
      expect(ZOOM_CONFIG.MAX_SCALE).toBe(3);
    });

    it("ZOOM_FACTORが0.01である", () => {
      expect(ZOOM_CONFIG.ZOOM_FACTOR).toBe(0.01);
    });

    it("MIN_SCALEがMAX_SCALEより小さい", () => {
      expect(ZOOM_CONFIG.MIN_SCALE).toBeLessThan(ZOOM_CONFIG.MAX_SCALE);
    });
  });

  describe("TIMEOUT_CONFIG", () => {
    it("INITIAL_POSITION_DELAYが100である", () => {
      expect(TIMEOUT_CONFIG.INITIAL_POSITION_DELAY).toBe(100);
    });

    it("INITIAL_POSITION_DELAYが正の数である", () => {
      expect(TIMEOUT_CONFIG.INITIAL_POSITION_DELAY).toBeGreaterThan(0);
    });
  });

  describe("NODE_WIDTH_CONFIG", () => {
    it("MIN_WIDTHが80である", () => {
      expect(NODE_WIDTH_CONFIG.MIN_WIDTH).toBe(80);
    });

    it("MAX_WIDTHが400である", () => {
      expect(NODE_WIDTH_CONFIG.MAX_WIDTH).toBe(400);
    });

    it("MIN_WIDTHがMAX_WIDTHより小さい", () => {
      expect(NODE_WIDTH_CONFIG.MIN_WIDTH).toBeLessThan(
        NODE_WIDTH_CONFIG.MAX_WIDTH
      );
    });

    it("MIN_WIDTHが正の数である", () => {
      expect(NODE_WIDTH_CONFIG.MIN_WIDTH).toBeGreaterThan(0);
    });

    it("MAX_WIDTHが正の数である", () => {
      expect(NODE_WIDTH_CONFIG.MAX_WIDTH).toBeGreaterThan(0);
    });
  });

  describe("NODE_EDIT_CONFIG", () => {
    it("MAX_TEXTAREA_HEIGHTが200である", () => {
      expect(NODE_EDIT_CONFIG.MAX_TEXTAREA_HEIGHT).toBe(200);
    });

    it("MIN_CARD_HEIGHTが36である", () => {
      expect(NODE_EDIT_CONFIG.MIN_CARD_HEIGHT).toBe(36);
    });

    it("CARD_PADDING_Yが16である", () => {
      expect(NODE_EDIT_CONFIG.CARD_PADDING_Y).toBe(16);
    });

    it("MAX_TEXTAREA_HEIGHTが正の数である", () => {
      expect(NODE_EDIT_CONFIG.MAX_TEXTAREA_HEIGHT).toBeGreaterThan(0);
    });

    it("MIN_CARD_HEIGHTが正の数である", () => {
      expect(NODE_EDIT_CONFIG.MIN_CARD_HEIGHT).toBeGreaterThan(0);
    });

    it("CARD_PADDING_Yが正の数である", () => {
      expect(NODE_EDIT_CONFIG.CARD_PADDING_Y).toBeGreaterThan(0);
    });
  });

  describe("NODE_CARD_SELECTOR", () => {
    it("正しいセレクター文字列である", () => {
      expect(NODE_CARD_SELECTOR).toBe("div.flex.items-center.justify-start");
    });

    it("空文字列ではない", () => {
      expect(NODE_CARD_SELECTOR.length).toBeGreaterThan(0);
    });
  });

  describe("DEFAULTS", () => {
    it("SVG_WIDTHが800である", () => {
      expect(DEFAULTS.SVG_WIDTH).toBe(800);
    });

    it("SVG_HEIGHTが600である", () => {
      expect(DEFAULTS.SVG_HEIGHT).toBe(600);
    });

    it("NODE_TITLEが「新しいノード」である", () => {
      expect(DEFAULTS.NODE_TITLE).toBe("新しいノード");
    });

    it("NODE_WIDTHが172である", () => {
      expect(DEFAULTS.NODE_WIDTH).toBe(172);
    });

    it("SVG_WIDTHが正の数である", () => {
      expect(DEFAULTS.SVG_WIDTH).toBeGreaterThan(0);
    });

    it("SVG_HEIGHTが正の数である", () => {
      expect(DEFAULTS.SVG_HEIGHT).toBeGreaterThan(0);
    });

    it("NODE_WIDTHが正の数である", () => {
      expect(DEFAULTS.NODE_WIDTH).toBeGreaterThan(0);
    });

    it("NODE_TITLEが空文字列ではない", () => {
      expect(DEFAULTS.NODE_TITLE.length).toBeGreaterThan(0);
    });
  });
});
