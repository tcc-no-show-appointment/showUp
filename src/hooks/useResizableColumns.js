import { useState, useRef, useCallback } from "react";

/**
 * Hook to add drag-to-resize behaviour to table columns.
 *
 * @param {number[]} initialWidths - Initial width (px) for each column.
 * @returns {{ widths: number[], startResize: (colIndex: number) => (e: MouseEvent) => void }}
 */
export const useResizableColumns = (initialWidths) => {
  const [widths, setWidths] = useState(initialWidths);
  const widthsRef = useRef(widths);
  widthsRef.current = widths;

  const startResize = useCallback(
    (colIndex) => (e) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startWidth = widthsRef.current[colIndex];

      const onMove = (moveEvt) => {
        const newWidth = Math.max(60, startWidth + (moveEvt.clientX - startX));
        setWidths((prev) => {
          const next = [...prev];
          next[colIndex] = newWidth;
          return next;
        });
      };

      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [],
  );

  return { widths, startResize };
};
