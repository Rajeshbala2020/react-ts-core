import React from 'react';

import { Close, DropArrow } from '../utilities/icons';

type ValueProps = {
  inputValue: string;
  searchValue: string;
  dropOpen: boolean;
  countOnly?: boolean;
  handleDropOpen: (e: any) => void;
  handleDropClose: (e: any) => void;
  disabled: boolean;
  readOnly: boolean;
  expandable: boolean;
  handleClear: () => void;
  error?: boolean;
};
const InputActions: React.FC<ValueProps> = ({
  inputValue,
  searchValue,
  dropOpen,
  handleDropOpen,
  handleDropClose,
  disabled,
  readOnly,
  expandable,
  handleClear,
  countOnly,
  error,
  
}) => {
  return (
    <div
      className={`${
        error
          ? 'qbs-autocomplete-witherror-close-icon'
          : 'qbs-autocomplete-close-icon'
      } `}
    >
      {(inputValue || searchValue) &&
        !disabled &&
        !readOnly &&
        !expandable &&
        !countOnly && (
          <button
            onClick={handleClear}
            className="icon-button text-[#667085] "
            type="button"
            aria-label="clear"
          >
            <Close />
          </button>
        )}
      {dropOpen ? (
        <button
          type="button"
          onClick={(e) => handleDropClose(e)}
          className="icon-button text-[#667085] "
          aria-label="toggle"
          name="toggle"
        >
          <DropArrow className={`icon-button-rotate`} />
        </button>
      ) : (
        <button
          disabled={disabled || readOnly}
          type="button"
          className="icon-button text-[#667085] "
          onClick={(e) => handleDropOpen(e)}
          aria-label="toggle"
          name="toggle"
        >
          <DropArrow />
        </button>
      )}
    </div>
  );
};

export default InputActions;
