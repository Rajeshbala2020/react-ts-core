export function deepEqual(value1: any, value2: any): boolean {
  // Check for strict equality first
  if (value1 === value2) {
    return true;
  }

  // If either is null (but not both), they're not equal
  if (value1 === null || value2 === null) {
    return false;
  }

  // If types differ, they're not equal
  if (typeof value1 !== typeof value2) {
    return false;
  }

  // Check objects (including arrays)
  if (typeof value1 === 'object' && typeof value2 === 'object') {
    // Different constructors means they are different objects
    if (value1.constructor !== value2.constructor) {
      return false;
    }

    if (Array.isArray(value1)) {
      // Array length comparison
      if (value1.length !== value2.length) {
        return false;
      }
      // Deep compare each element
      for (let i = 0; i < value1.length; i++) {
        if (!deepEqual(value1[i], value2[i])) {
          return false;
        }
      }
      return true;
    } else {
      // Compare object keys and values
      const keys1 = Object.keys(value1);
      const keys2 = new Set(Object.keys(value2));
      if (keys1.length !== keys2.size) {
        return false;
      }
      for (const key of keys1) {
        if (!keys2.has(key) || !deepEqual(value1[key], value2[key])) {
          return false;
        }
      }
      return true;
    }
  }

  // If none of the above, they're not equal
  return false;
}
