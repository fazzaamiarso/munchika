import { useEffect } from 'react';

export const useFocusOnFirstLoadedContent = (
  list: any[],
  elementId: string,
  itemsPerLoad: number,
) => {
  useEffect(() => {
    if (list.length === 0 || !list) return;
    const listLengthDivided = Math.floor(list.length / itemsPerLoad) - 1;
    const listItemIdx = String(listLengthDivided * itemsPerLoad + 1);
    const itemToFocus =
      listLengthDivided === 0
        ? document.getElementById(`${elementId}-0`)
        : document.getElementById(`${elementId}-${listItemIdx}`);
    itemToFocus?.focus();
  }, [list, elementId, itemsPerLoad]);
};
