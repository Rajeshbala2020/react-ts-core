import React from 'react'

import { IconProps } from '../../../commontypes'

const SeaServiceIcon: React.FC<IconProps> = ({ className = '', stroke = 1.5 }) => {
  return (
    <>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.3941 11.9999H4.70743C4.58528 11.9998 4.46567 11.965 4.3626 11.8994C4.25954 11.8339 4.17729 11.7403 4.12549 11.6297C4.07368 11.519 4.05447 11.396 4.07009 11.2748C4.08572 11.1537 4.13554 11.0395 4.21371 10.9456L10.6423 3.23132C10.7142 3.14501 10.8075 3.07906 10.9128 3.04003C11.0182 3.00101 11.1319 2.99027 11.2427 3.00889C11.3782 2.99252 11.5156 3.00508 11.6458 3.04574C11.7761 3.08641 11.8962 3.15425 11.9983 3.24478C12.1003 3.33532 12.1821 3.44649 12.238 3.57094C12.2939 3.6954 12.3228 3.83031 12.3227 3.96675L12.3214 14.5713H20.3571C20.4611 14.5713 20.5634 14.5965 20.6555 14.6447C20.7476 14.693 20.8265 14.7628 20.8857 14.8483C20.9448 14.9337 20.9824 15.0322 20.9951 15.1354C21.0079 15.2385 20.9954 15.3432 20.9589 15.4405L19.6564 18.9145C19.4267 19.5269 19.0156 20.0547 18.478 20.4273C17.9404 20.7999 17.302 20.9997 16.6479 20.9999H7.35471C6.70061 20.9997 6.06213 20.7999 5.52455 20.4273C4.98697 20.0547 4.57586 19.5269 4.34614 18.9145L3.04114 15.4405C3.00452 15.3431 2.99208 15.2383 3.00489 15.135C3.0177 15.0318 3.05537 14.9332 3.11467 14.8477C3.17397 14.7623 3.25313 14.6924 3.34536 14.6443C3.43758 14.5962 3.54011 14.5711 3.64414 14.5713H10.3941V11.9999ZM15.0626 5.82332C14.9807 5.71715 14.8677 5.63921 14.7394 5.60043C14.6111 5.56165 14.4738 5.56395 14.3469 5.60703C14.2199 5.6501 14.1096 5.73178 14.0314 5.84065C13.9531 5.94952 13.9109 6.08012 13.9106 6.21418V11.357C13.9106 11.5275 13.9783 11.691 14.0989 11.8116C14.2194 11.9322 14.3829 11.9999 14.5534 11.9999H18.5006C18.6204 11.9997 18.7378 11.9659 18.8395 11.9025C18.9411 11.8391 19.0231 11.7486 19.076 11.6411C19.129 11.5336 19.1508 11.4134 19.1391 11.2942C19.1274 11.1749 19.0826 11.0613 19.0097 10.9662L15.0626 5.82332Z"
        fill="currentColor"
      />
    </>
  )
}

export default SeaServiceIcon