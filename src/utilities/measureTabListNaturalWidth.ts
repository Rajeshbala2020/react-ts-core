const DROPDOWN_HORIZONTAL_PADDING_PX = 16; // .qbs-autocomplete-suggestions has padding: 8px
const VIEWPORT_RIGHT_GUTTER_PX = 8;
const VIEWPORT_LEFT_GUTTER_PX = 8;
export const MIN_DROPDOWN_WIDTH_PX = 300;
// When tabs exist, cap dropdown width and let the tab strip scroll horizontally if needed.
export const MAX_DROPDOWN_WIDTH_WITH_TABS_PX = 600;

/**
 * Measures the "natural" (nowrap) width of a rendered tabs <ul>, including the dropdown's horizontal padding.
 * This avoids tabs wrapping/squishing when the trigger/input is narrower than the tab labels.
 */
export function measureTabListNaturalWidth(tabListEl: HTMLUListElement): number | null {
  if (!tabListEl || typeof document === 'undefined') return null;

  try {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-99999px';
    container.style.left = '-99999px';
    container.style.visibility = 'hidden';
    container.style.pointerEvents = 'none';
    container.style.whiteSpace = 'nowrap';

    const clone = tabListEl.cloneNode(true) as HTMLUListElement;

    // Force a single row with natural width.
    clone.style.display = 'inline-flex';
    clone.style.flexWrap = 'nowrap';
    clone.style.width = 'max-content';
    clone.style.whiteSpace = 'nowrap';

    // Remove width constraints from items so content can dictate width.
    clone.querySelectorAll('li').forEach((li) => {
      (li as HTMLElement).style.flex = '0 0 auto';
      (li as HTMLElement).style.width = 'auto';
    });
    clone.querySelectorAll('span').forEach((span) => {
      (span as HTMLElement).style.width = 'max-content';
      (span as HTMLElement).style.whiteSpace = 'nowrap';
    });

    container.appendChild(clone);
    document.body.appendChild(container);

    const tabRowWidth = Math.ceil(clone.getBoundingClientRect().width);

    document.body.removeChild(container);

    // Include dropdown padding so the tabs still fit within the content box.
    return tabRowWidth + DROPDOWN_HORIZONTAL_PADDING_PX;
  } catch {
    return null;
  }
}

/**
 * Keeps a dropdown fully visible within the viewport by clamping width and shifting left/right as needed.
 * All coordinates are page coordinates (i.e., include window.scrollX).
 */
export function clampDropdownToViewport(opts: { desiredWidth: number; desiredLeft: number }): {
  width: number;
  left: number;
} {
  if (typeof window === 'undefined') return { width: opts.desiredWidth, left: opts.desiredLeft };

  const viewportLeft = window.scrollX;
  const viewportRight = window.scrollX + window.innerWidth;
  const maxWidth = Math.max(
    0,
    Math.floor(viewportRight - viewportLeft - VIEWPORT_LEFT_GUTTER_PX - VIEWPORT_RIGHT_GUTTER_PX)
  );

  const width = maxWidth > 0 ? Math.min(opts.desiredWidth, maxWidth) : opts.desiredWidth;

  const minLeft = viewportLeft + VIEWPORT_LEFT_GUTTER_PX;
  const maxLeft = viewportRight - VIEWPORT_RIGHT_GUTTER_PX - width;

  const left = Math.min(Math.max(opts.desiredLeft, minLeft), maxLeft);

  return { width, left };
}

/**
 * Same as clampDropdownToViewport, but if the dropdown would overflow the right edge, it will prefer
 * right-aligning the dropdown to the provided anchor (typically the input's right edge).
 */
export function clampDropdownToViewportPreferRightAlign(opts: {
  desiredWidth: number;
  desiredLeft: number;
  anchorRight: number;
}): { width: number; left: number } {
  if (typeof window === 'undefined') return { width: opts.desiredWidth, left: opts.desiredLeft };

  const viewportLeft = window.scrollX;
  const viewportRight = window.scrollX + window.innerWidth;
  const maxWidth = Math.max(
    0,
    Math.floor(viewportRight - viewportLeft - VIEWPORT_LEFT_GUTTER_PX - VIEWPORT_RIGHT_GUTTER_PX)
  );

  const width = maxWidth > 0 ? Math.min(opts.desiredWidth, maxWidth) : opts.desiredWidth;

  const minLeft = viewportLeft + VIEWPORT_LEFT_GUTTER_PX;
  const maxLeft = viewportRight - VIEWPORT_RIGHT_GUTTER_PX - width;

  // Default: left-align to the trigger.
  let left = opts.desiredLeft;

  // If it would overflow right, prefer right-align to the trigger's right edge.
  if (left + width > viewportRight - VIEWPORT_RIGHT_GUTTER_PX) {
    left = opts.anchorRight - width;
  }

  left = Math.min(Math.max(left, minLeft), maxLeft);

  return { width, left };
}
