import React from 'react'

const ExpandIcon: React.FC<{ type?: string }> = ({ type }) => {
  return (
    <path
      d="M12 8L19 1M19 1H13M19 1V7M8 12L1 19M1 19H7M1 19L1 13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}
export default ExpandIcon
