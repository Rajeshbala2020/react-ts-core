import React from 'react'

// const getPosition = (textFieldElement: HTMLElement) => {
//   const textFieldRect = textFieldElement.getBoundingClientRect()

//   const spaceBelow = window.innerHeight - textFieldRect.bottom
//   return spaceBelow < 180 ? 'top' : 'bottom'
// }
const getScrollableParent = (element: HTMLElement): HTMLElement | Window => {
  let parent = element.parentElement
  while (parent) {
    const overflowY = window.getComputedStyle(parent).overflowY
    if (overflowY === 'scroll' || overflowY === 'auto') {
      return parent
    }
    parent = parent.parentElement
  }
  return window // Fallback to window if no scrollable parent is found
}

const getPosition = (textFieldElement: HTMLElement, formFieldView?: boolean) => {
  const textFieldRect = textFieldElement.getBoundingClientRect()
  const scrollableParent = getScrollableParent(textFieldElement) as HTMLElement
  const parentRect = scrollableParent.getBoundingClientRect()

  const spaceBelow = parentRect.bottom - textFieldRect.bottom
  const spaceAbove = parentRect.top - textFieldRect.top
  if (formFieldView) {
    return spaceBelow < 50 ? 'top-tool' : 'bottom-tool'
  } else {
    return spaceAbove > 50 ? 'top' : 'bottom'
  }
}
export const applyPositionClass = (textFieldRef: React.RefObject<HTMLDivElement>) => {
  if (textFieldRef.current) {
    const textFieldElement = textFieldRef.current
    const positionClass = getPosition(textFieldElement) // Get either 'top' or 'bottom'

    textFieldElement.classList.remove('top', 'bottom')
    textFieldElement.classList.add(positionClass)
  }
}
export const applyToolTipPositionClass = (
  textFieldRef: React.RefObject<HTMLDivElement>
) => {
  if (textFieldRef.current) {
    const textFieldElement = textFieldRef.current
    const positionClass = getPosition(textFieldElement, true) // Get either 'top' or 'bottom'

    textFieldElement.classList.remove('top-tool', 'bottom-tool')
    textFieldElement.classList.add(positionClass)
  }
}
