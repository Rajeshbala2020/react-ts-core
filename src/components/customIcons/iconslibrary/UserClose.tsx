import React from 'react'

const UserCloseIcon: React.FC<{ type?: string }> = ({ type }) => {
  const getPath = () => {
    switch (type) {
      case 'large':
        return (
          <path
            d="M16.5 16L21.5 21M21.5 16L16.5 21M12 15.5H7.5C6.10444 15.5 5.40665 15.5 4.83886 15.6722C3.56045 16.06 2.56004 17.0605 2.17224 18.3389C2 18.9067 2 19.6044 2 21M14.5 7.5C14.5 9.98528 12.4853 12 10 12C7.51472 12 5.5 9.98528 5.5 7.5C5.5 5.01472 7.51472 3 10 3C12.4853 3 14.5 5.01472 14.5 7.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )

      case 'large-m':
        return (
          <path
            d="M16.5 4L21.5 9M21.5 4L16.5 9M16 21V19.8C16 18.1198 16 17.2798 15.673 16.638C15.3854 16.0735 14.9265 15.6146 14.362 15.327C13.7202 15 12.8802 15 11.2 15H6.8C5.11984 15 4.27976 15 3.63803 15.327C3.07354 15.6146 2.6146 16.0735 2.32698 16.638C2 17.2798 2 18.1198 2 19.8V21M12.5 7.5C12.5 9.433 10.933 11 9 11C7.067 11 5.5 9.433 5.5 7.5C5.5 5.567 7.067 4 9 4C10.933 4 12.5 5.567 12.5 7.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )
      default:
        return (
          <path
            d="M12.375 3L16.125 6.75M16.125 3L12.375 6.75M12 15.75V14.85C12 13.5899 12 12.9598 11.7548 12.4785C11.539 12.0552 11.1948 11.711 10.7715 11.4952C10.2902 11.25 9.66012 11.25 8.4 11.25H5.1C3.83988 11.25 3.20982 11.25 2.72852 11.4952C2.30516 11.711 1.96095 12.0552 1.74524 12.4785C1.5 12.9598 1.5 13.5899 1.5 14.85V15.75M9.375 5.625C9.375 7.07475 8.19975 8.25 6.75 8.25C5.30025 8.25 4.125 7.07475 4.125 5.625C4.125 4.17525 5.30025 3 6.75 3C8.19975 3 9.375 4.17525 9.375 5.625Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )
    }
  }
  return <>{getPath()}</>
}
export default UserCloseIcon