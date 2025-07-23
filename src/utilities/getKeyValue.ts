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