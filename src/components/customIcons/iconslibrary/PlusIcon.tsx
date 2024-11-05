import React from 'react'

const PlusIcon: React.FC<{ type?: string }> = ({ type }) => {
  const getPath = () => {
    switch (type) {
      case 'large':
        return (
          <path
            d="M12 5V19M5 12H19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )

      case 'large-m':
        return (
          <path
            d="M10.0001 4.16663V15.8333M4.16675 9.99996H15.8334"
            stroke="currentColor"
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )
      default:
        return (
          <path
            d="M12 5V19M5 12H19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )
    }
  }
  return <>{getPath()}</>
}
export default PlusIcon
