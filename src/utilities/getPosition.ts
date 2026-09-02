import React from 'react';

// const getPosition = (textFieldElement: HTMLElement) => {
//   const textFieldRect = textFieldElement.getBoundingClientRect()

//   const spaceBelow = window.innerHeight - textFieldRect.bottom
//   return spaceBelow < 180 ? 'top' : 'bottom'
// }
const getScrollableParent = (element: HTMLElement): HTMLElement | Window => {
  let parent = element.parentElement;
  while (parent) {
    const overflowY = window.getComputedStyle(parent).overflowY;
    if (overflowY === 'scroll' || overflowY === 'auto') {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window; // Fallback to window if no scrollable parent is found
};

const getPosition = (
  textFieldElement: HTMLElement,
  formFieldView?: boolean
) => {
  const textFieldRect = textFieldElement.getBoundingClientRect();
  const scrollableParent = getScrollableParent(textFieldElement) as HTMLElement;
  const parentRect = scrollableParent.getBoundingClientRect();

  const spaceBelow = parentRect.bottom - textFieldRect.bottom;
  if (formFieldView) {
    return spaceBelow < 50 ? 'top-tool' : 'bottom-tool';
  } else {
    return spaceBelow < 60 ? 'top' : 'bottom';
  }
};
export const applyPositionClass = (
  textFieldRef: React.RefObject<HTMLDivElement>,
  isHovered?: boolean
) => {
  if (textFieldRef.current) {
    const textFieldElement = textFieldRef.current;
    if (isHovered) {
      const positionClass = getPosition(textFieldElement); // Get either 'top' or 'bottom'
      textFieldElement.classList.remove('top', 'bottom');
      textFieldElement.classList.add(positionClass);
    } else {
      textFieldElement.classList.add('bottom');
    }
  }
};
export const applyToolTipPositionClass = (
  textFieldRef: React.RefObject<HTMLDivElement>
) => {
  if (textFieldRef.current) {
    const textFieldElement = textFieldRef.current;
    const positionClass = getPosition(textFieldElement, true); // Get either 'top' or 'bottom'

    textFieldElement.classList.remove('top-tool', 'bottom-tool');
    textFieldElement.classList.add(positionClass);
  }
};

export type PortalTooltipPlacement = 'top-position' | 'bottom-position';

export type PortalTooltipCoords = {
  top: number;
  left: number;
  arrowOffset: number;
  placement: PortalTooltipPlacement;
};

const VIEWPORT_PAD = 8;
const TOOLTIP_GAP = 8;
const ARROW_HALF = 5;

/** Center a portaled tooltip on its trigger and keep the arrow on the trigger. */
export const getPortalTooltipCoords = (
  anchorEl: HTMLElement,
  tooltipEl: HTMLElement
): PortalTooltipCoords => {
  const anchor = anchorEl.getBoundingClientRect();
  const tooltipWidth = Math.max(tooltipEl.offsetWidth, 60);
  const tooltipHeight = tooltipEl.offsetHeight;

  const spaceAbove = anchor.top;
  const spaceBelow = window.innerHeight - anchor.bottom;

  let placement: PortalTooltipPlacement = 'bottom-position';
  if (spaceBelow >= tooltipHeight + 20) {
    placement = 'bottom-position';
  } else if (spaceAbove >= tooltipHeight + 20) {
    placement = 'top-position';
  } else {
    placement = spaceBelow > spaceAbove ? 'bottom-position' : 'top-position';
  }

  const top =
    placement === 'bottom-position'
      ? anchor.bottom + TOOLTIP_GAP + window.scrollY
      : anchor.top - tooltipHeight - TOOLTIP_GAP + window.scrollY;

  const triggerCenterX = anchor.left + anchor.width / 2;
  const minLeft = VIEWPORT_PAD;
  const maxLeft = window.innerWidth - tooltipWidth - VIEWPORT_PAD;
  let left =
    maxLeft < minLeft
      ? minLeft
      : Math.min(Math.max(triggerCenterX - tooltipWidth / 2, minLeft), maxLeft);

  const minArrow = ARROW_HALF + 6;
  const maxArrow = Math.max(minArrow, tooltipWidth - ARROW_HALF - 6);
  const arrowOffset = Math.min(
    Math.max(triggerCenterX - left, minArrow),
    maxArrow
  );

  return {
    top,
    left: left + window.scrollX,
    arrowOffset,
    placement,
  };
};
