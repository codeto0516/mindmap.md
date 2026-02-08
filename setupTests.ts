import "@testing-library/jest-dom";

// ResizeObserverのモック
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
