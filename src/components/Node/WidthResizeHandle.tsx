"use client";

import { useRef } from "react";
import { NODE_WIDTH_CONFIG } from "@/utils/constants";

interface Props {
  /** 現在のノード幅 */
  currentWidth: number;
  /** プレビュー幅変更時のコールバック（ドラッグ中） */
  onPreviewWidthChange?: (width: number | null) => void;
  /** 幅確定時のコールバック（pointerup時） */
  onWidthConfirm: (width: number) => void;
  /** 編集モード中かどうか */
  isEditing?: boolean;
}

/**
 * ノードの幅をリサイズするためのハンドルコンポーネント
 *
 * ノードの右端に配置され、ドラッグ操作でノードの幅を変更できます。
 * setPointerCaptureを使用してポインターをキャプチャし、
 * 要素外に出てもドラッグを継続できます。
 * 最小幅・最大幅の制限内で幅を調整します。
 *
 * @param props - WidthResizeHandleコンポーネントのProps
 * @param props.currentWidth - 現在のノード幅
 * @param props.onPreviewWidthChange - プレビュー幅変更時のコールバック（ドラッグ中）
 * @param props.onWidthConfirm - 幅確定時のコールバック（pointerup時）
 * @param props.isEditing - 編集モード中かどうか
 * @returns リサイズハンドルコンポーネント
 */
export const WidthResizeHandle = ({
  currentWidth,
  onPreviewWidthChange,
  onWidthConfirm,
  isEditing = false,
}: Props) => {
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);

  // ドラッグ開始
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isEditing) return;

    e.stopPropagation();
    e.preventDefault();

    // ポインターキャプチャを取得（要素外でもイベントを受け取れる）
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerIdRef.current = e.pointerId;

    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = currentWidth;

    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
  };

  // ドラッグ中
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - startXRef.current;
    const previewWidth = Math.max(
      NODE_WIDTH_CONFIG.MIN_WIDTH,
      Math.min(NODE_WIDTH_CONFIG.MAX_WIDTH, startWidthRef.current + deltaX),
    );

    onPreviewWidthChange?.(previewWidth);
  };

  // ドラッグ終了
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;

    // ポインターキャプチャを解放
    if (pointerIdRef.current !== null) {
      e.currentTarget.releasePointerCapture(pointerIdRef.current);
      pointerIdRef.current = null;
    }

    const deltaX = e.clientX - startXRef.current;
    const finalWidth = Math.max(
      NODE_WIDTH_CONFIG.MIN_WIDTH,
      Math.min(NODE_WIDTH_CONFIG.MAX_WIDTH, startWidthRef.current + deltaX),
    );

    onPreviewWidthChange?.(null);
    onWidthConfirm(finalWidth);

    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  // キャンセル時（Escなど）
  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;

    if (pointerIdRef.current !== null) {
      e.currentTarget.releasePointerCapture(pointerIdRef.current);
      pointerIdRef.current = null;
    }

    onPreviewWidthChange?.(null);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  if (isEditing) return null;

  return (
    <div
      data-resize-handle
      className="nodrag absolute top-0 bottom-0 cursor-ew-resize pointer-events-auto z-10 touch-none"
      style={{
        right: "-8px",
        width: "16px",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      title="幅をリサイズ"
    />
  );
};
