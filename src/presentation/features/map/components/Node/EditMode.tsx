"use client";

import { useState, useRef, useCallback } from "react";
import type { MindNode } from "@/application/map/mind-node";
import {
  NODE_EDIT_CONFIG,
  NODE_CARD_SELECTOR,
} from "../../utils/constants";

interface Props {
  id: string;
  mindNode: MindNode;
  /** 文字キーで編集開始したとき、その文字で既存タイトルを上書きする初期値 */
  initialEditKey?: string;
  onEndEdit?: () => void;
  onUpdateTitle?: (nodeId: string, title: string) => void;
  onNodeHeightChange?: (nodeId: string, height: number) => void;
}

export const EditMode = ({
  id,
  mindNode,
  initialEditKey,
  onEndEdit,
  onUpdateTitle,
  onNodeHeightChange,
}: Props) => {
  const [editValue, setEditValue] = useState(
    initialEditKey != null ? initialEditKey : mindNode.title,
  );
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const isCancellingRef = useRef(false);

  // テキストエリアとノードカードの高さを同期する関数
  const syncNodeEditHeight = useCallback(
    (textarea: HTMLTextAreaElement) => {
      textarea.style.height = "auto";
      const newHeight = Math.min(
        textarea.scrollHeight,
        NODE_EDIT_CONFIG.MAX_TEXTAREA_HEIGHT,
      );
      textarea.style.height = `${newHeight}px`;

      const nodeCard = textarea.closest(NODE_CARD_SELECTOR);
      if (nodeCard) {
        const cardElement = nodeCard as HTMLElement;
        const cardHeight = Math.max(
          newHeight + NODE_EDIT_CONFIG.CARD_PADDING_Y,
          NODE_EDIT_CONFIG.MIN_CARD_HEIGHT,
        );
        cardElement.style.height = "auto";
        cardElement.style.minHeight = `${cardHeight}px`;

        // ノードの高さが変わったことを親に通知
        if (onNodeHeightChange) {
          onNodeHeightChange(id, cardHeight);
        }
      }
    },
    [id, onNodeHeightChange],
  );

  // マウント時にフォーカス・高さ初期化（コールバック ref で useEffect なし）
  const setTextareaRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      inputRef.current = el;
      if (el) {
        el.focus();
        syncNodeEditHeight(el);
        el.setSelectionRange(el.value.length, el.value.length);
      }
    },
    [syncNodeEditHeight],
  );

  // 編集を保存
  const handleSave = useCallback(() => {
    // キャンセル中の場合は保存しない
    if (isCancellingRef.current) {
      return;
    }
    const trimmedValue = editValue.trim();
    if (trimmedValue && onUpdateTitle) {
      onUpdateTitle(id, trimmedValue);
    } else {
      // 空の場合は元の値に戻す
      setEditValue(mindNode.title);
    }

    // 編集終了時にノードの高さを通知（ResizeObserver が計測するので、ここでは通知しない）
    // ただし、ResizeObserver が動作しない場合に備えて、現在の高さを取得して通知することも可能
    // 現状は ResizeObserver に任せる

    if (onEndEdit) {
      onEndEdit();
    }
  }, [editValue, id, mindNode.title, onEndEdit, onUpdateTitle]);

  // 編集をキャンセル
  const handleCancel = useCallback(() => {
    isCancellingRef.current = true;
    setEditValue(mindNode.title);
    if (onEndEdit) {
      onEndEdit();
    }
    // onBlur が発火する前にフラグをリセット（次のフレームで）
    setTimeout(() => {
      isCancellingRef.current = false;
    }, 0);
  }, [mindNode.title, onEndEdit]);

  // キーボードイベントハンドラー
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        // IME変換中（日本語など）のEnterは変換確定として扱い、編集終了しない
        if (e.nativeEvent.isComposing) {
          return;
        }
        // Enterキー（Shiftなし）: 編集を保存して終了（グローバルで兄弟ノード追加に使われないよう伝播を止める）
        e.preventDefault();
        e.stopPropagation();
        handleSave();
      } else if (e.key === "Enter" && e.shiftKey) {
        // Shift+Enter: 改行を挿入（デフォルト動作を許可、他で処理されないよう伝播のみ止める）
        e.stopPropagation();
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        handleCancel();
      }
    },
    [handleSave, handleCancel],
  );

  return (
    <textarea
      ref={setTextareaRef}
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleSave}
      className="w-full bg-transparent border-none outline-none text-left text-sm font-medium text-zinc-900 dark:text-zinc-100 resize-none overflow-hidden self-center"
      style={{
        lineHeight: "1.5",
        minHeight: "20px",
        maxHeight: `${NODE_EDIT_CONFIG.MAX_TEXTAREA_HEIGHT}px`,
        verticalAlign: "middle",
      }}
      rows={1}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onInput={(e) => {
        // textareaの高さを自動調整し、ノードカードの高さも同期
        syncNodeEditHeight(e.target as HTMLTextAreaElement);
      }}
    />
  );
};
