const HEIGHT_CLASS = /^(min-|max-)?h-/;

export const omitHeightClasses = (className?: string) =>
  (className ?? '')
    .split(/\s+/)
    .filter((cls) => cls && !HEIGHT_CLASS.test(cls))
    .join(' ');
