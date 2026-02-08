import { describe, it, expect, vi } from "vitest";
import { stopEventPropagation, preventMultiTouch } from "./eventHelpers";

describe("eventHelpers", () => {
  describe("stopEventPropagation", () => {
    it("マウスイベントの伝播とデフォルト動作を停止する", () => {
      const mockEvent = {
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
      } as unknown as React.MouseEvent<Element>;

      stopEventPropagation(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1);
      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
    });

    it("タッチイベントの伝播とデフォルト動作を停止する", () => {
      const mockEvent = {
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        touches: [] as unknown as TouchList,
      } as unknown as React.TouchEvent<Element>;

      stopEventPropagation(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1);
      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
    });

    it("ホイールイベントの伝播とデフォルト動作を停止する", () => {
      const mockEvent = {
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
        deltaMode: 0,
        deltaX: 0,
        deltaY: 0,
        deltaZ: 0,
      } as unknown as React.WheelEvent<Element>;

      stopEventPropagation(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1);
      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
    });
  });

  describe("preventMultiTouch", () => {
    it("一本指のタッチイベントでは伝播のみ停止する", () => {
      const mockTouches = {
        length: 1,
        item: vi.fn(),
        identifiedTouch: vi.fn(),
      } as unknown as TouchList;
      const mockEvent = {
        touches: mockTouches,
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
      } as unknown as React.TouchEvent<Element>;

      preventMultiTouch(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1);
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it("二本指のタッチイベントでは伝播とデフォルト動作を停止する", () => {
      const mockTouches = {
        length: 2,
        item: vi.fn(),
        identifiedTouch: vi.fn(),
      } as unknown as TouchList;
      const mockEvent = {
        touches: mockTouches,
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
      } as unknown as React.TouchEvent<Element>;

      preventMultiTouch(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1);
      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
    });

    it("三本指以上のタッチイベントでは伝播とデフォルト動作を停止する", () => {
      const mockTouches = {
        length: 3,
        item: vi.fn(),
        identifiedTouch: vi.fn(),
      } as unknown as TouchList;
      const mockEvent = {
        touches: mockTouches,
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
      } as unknown as React.TouchEvent<Element>;

      preventMultiTouch(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1);
      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
    });
  });
});
