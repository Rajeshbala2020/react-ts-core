import React from "react";

export const DropArrow: React.FC<any> = ({
  className = "",
  stroke = 1.5,
  uniqueId = "drop-arrow-icon",
}) => {
  return (
    <svg
      id={uniqueId}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      style={{ width: 20, height: 20 }}
      className={className}
      name="toggle"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
      />
    </svg>
  );
};

export const Close: React.FC<any> = ({ className = "", stroke = 1.5 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      style={{ width: 20, height: 20 }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
};

export const Spinner: React.FC<any> = ({ className = "", stroke = 1.5 }) => {
  return (
    <div role="status">
      <svg
        aria-hidden="true"
        className="custom-spinner "
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
    </div>
  );
};

export const Search: React.FC<any> = ({ className = "", stroke = 1.5 }) => {
  return (
    <div role="status">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14 14.0027L10 10.0027M11.3333 6.66935C11.3333 9.24668 9.244 11.336 6.66667 11.336C4.08934 11.336 2 9.24668 2 6.66935C2 4.09202 4.08934 2.00269 6.66667 2.00269C9.244 2.00269 11.3333 4.09202 11.3333 6.66935Z"
          stroke="#999696"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export const AllDropArrow: React.FC<any> = ({
  className = "",
  uniqueId = "all-drop-up-arrow-icon",
  type = "up",
}) => {
  return (
    <svg
      id={uniqueId}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {type === "up" ? (
        <>
          <path
            d="M17.5 15L14.5833 11.6667L11.6666 15"
            stroke="currentColor"
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2.5 4.16669H17.5"
            stroke="currentColor"
            strokeWidth="1.66667"
            strokeLinecap="round"
          />
          <path
            d="M2.5 7.91669H17.5"
            stroke="currentColor"
            strokeWidth="1.66667"
            strokeLinecap="round"
          />
          <path
            d="M2.5 11.6667H9.16667"
            stroke="currentColor"
            strokeWidth="1.66667"
            strokeLinecap="round"
          />
          <path
            d="M2.5 15.4167H9.16667"
            stroke="currentColor"
            strokeWidth="1.66667"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path
            d="M11.6667 11.6667L14.5833 15L17.5 11.6667"
            stroke="currentColor"
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2.5 4.16669H17.5"
            stroke="currentColor"
            strokeWidth="1.66667"
            strokeLinecap="round"
          />
          <path
            d="M2.5 7.91669H17.5"
            stroke="currentColor"
            strokeWidth="1.66667"
            strokeLinecap="round"
          />
          <path
            d="M2.5 11.6667H9.16667"
            stroke="currentColor"
            strokeWidth="1.66667"
            strokeLinecap="round"
          />
          <path
            d="M2.5 15.4167H9.16667"
            stroke="currentColor"
            strokeWidth="1.66667"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
};

export const Tools: React.FC<any> = ({ className = "", stroke = 1.5 }) => {
  return (
    <div role="status">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M18.3334 2.5H1.66675L8.33341 10.3833V15.8333L11.6667 17.5V10.3833L18.3334 2.5Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
};