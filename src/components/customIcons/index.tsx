import React from 'react'

import { IconsProps } from '../../commontypes'
import { iconMapping } from './IconList'

const handleGetDimension = (type: string) => {
  switch (type) {
    case 'small':
      return 12
    case 'medium':
      return 16
    case 'common':
      return 14
    case 'large':
      return 18
    case 'large-m':
      return 20
    case 'large-xl':
      return 22
    default:
      return 24
  }
}
const CustomIcons: React.FC<IconsProps> = ({
  name,
  type = '',
  onClick,
  className,
  isWrapper = true,
  viewBox,
  svgClassName,
  custDimension,
  hasCustomSize = false,
  style,
  onMouseDown,
  onMouseUp,
  onMouseLeave
}) => {
  const IconComponent = iconMapping[name]

  if (!IconComponent) {
    return null
  }
  const dimension = custDimension ?? handleGetDimension(type)
  const viewBoxBlock = viewBox ? `0 0 ${dimension} ${dimension}` : `0 0 24 24`
  return (
    <>
      {isWrapper ? (
        <span
          data-testid={name}
          onClick={onClick}
          onMouseUp={onMouseUp}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          style={style}
          className={`text-center  ${className}`}
        >
          <svg
            width={hasCustomSize ? handleGetDimension(type) : dimension}
            height={hasCustomSize ? handleGetDimension(type) : dimension}
            viewBox={viewBoxBlock}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={svgClassName}
          >
            <IconComponent type={type} />
          </svg>
        </span>
      ) : (
        <IconComponent />
      )}
    </>
  )
}

export default CustomIcons
