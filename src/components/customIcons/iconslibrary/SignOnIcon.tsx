import React from 'react'

import { IconProps } from '../../../commontypes'

const SignOnIcon: React.FC<IconProps> = ({ className = '', stroke = 1.5 }) => {
  return (
    <>
      <path
        d="M11.9998 21V19H4.99976V5H11.9998V3H4.99976C4.44975 3 3.97876 3.196 3.58676 3.588C3.19476 3.98 2.99909 4.45067 2.99976 5V19C2.99976 19.55 3.19542 20.021 3.58676 20.413C3.97809 20.805 4.44909 21.0007 4.99976 21H11.9998ZM13.9998 17L15.3748 15.55L12.8248 13H20.9998V11H12.8248L15.3748 8.45L13.9998 7L8.99976 12L13.9998 17Z"
        fill="currentColor"
      />
    </>
  )
}

export default SignOnIcon
