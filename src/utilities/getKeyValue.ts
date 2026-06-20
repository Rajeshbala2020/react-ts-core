// Utility function to safely get a value by key (which may be empty, null, or a number) and fallback to a default key
export function getKeyValue(obj: any, key: any, fallbackKey: string): string {
  if (key !== undefined && key !== null && key !== '') {
    const val = obj[key];
    return val != null ? String(val).toLowerCase() : '';
  }
  const fallbackVal = obj[fallbackKey];
  return fallbackVal != null ? String(fallbackVal).toLowerCase() : '';
}

export function safeToLowerString(val: any): string {
  if (val === undefined || val === null) return '';
  return String(val).toLowerCase();
}

/** Match selected item to a suggestion — id when both exist, otherwise desc. */
export function isSelectionMatch(
  selectedItem: any,
  item: any,
  desc: string,
  descId: string,
): boolean {
  const selectedId = getKeyValue(selectedItem, descId, 'id');
  const itemId = getKeyValue(item, descId, 'id');

  if (selectedId && itemId) {
    return selectedId === itemId;
  }

  return (
    getKeyValue(selectedItem, desc, 'name') === getKeyValue(item, desc, 'name')
  );
}

/** Match a suggestion to a string value (single-select input). */
export function isSelectionMatchValue(
  item: any,
  selectedValue: string,
  desc: string,
  descId: string,
): boolean {
  const normalized = safeToLowerString(selectedValue);
  const itemId = getKeyValue(item, descId, 'id');
  if (itemId && itemId === normalized) {
    return true;
  }
  return getKeyValue(item, desc, 'name') === normalized;
} 