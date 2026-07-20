import { ReactNode, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type ReactPortalProps = {
  children: ReactNode
  wrapperId?: string
}

const ReactPortal = ({
  children,
  wrapperId = 'modal-root',
}: ReactPortalProps) => {
  const [wrapper, setWrapper] = useState<Element | null>(null)

  useLayoutEffect(() => {
    let element = document.getElementById(wrapperId)
    let created = false
    if (!element) {
      created = true
      const wrapperEl = document.createElement('div')
      wrapperEl.setAttribute('id', wrapperId)
      document.body.appendChild(wrapperEl)
      element = wrapperEl
    }
    setWrapper(element)
    return () => {
      if (created && element?.parentNode) {
        element.parentNode.removeChild(element)
      }
    }
  }, [wrapperId])

  if (wrapper === null) return null
  return createPortal(children, wrapper)
}

export default ReactPortal
