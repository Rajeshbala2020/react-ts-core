import React from 'react'

import { IconProps } from '../../../commontypes'

const SignOffIcon: React.FC<IconProps> = ({ className = '', stroke = 1.5 }) => {
  return (
    <>
      <path
        d="M5 21C4.45 21 3.97933 20.8043 3.588 20.413C3.19667 20.0217 3.00067 19.5507 3 19V5C3 4.45 3.196 3.97933 3.588 3.588C3.98 3.19667 4.45067 3.00067 5 3H12V5H5V19H12V21H5ZM16 17L14.625 15.55L17.175 13H9V11H17.175L14.625 8.45L16 7L21 12L16 17Z"
        fill="currentColor"
      />
    </>
  )
}

export default SignOffIcon
