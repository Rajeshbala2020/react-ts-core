import React from 'react';
import { Close, DropArrow } from '../utilities/icons';

type ValueProps = {
  inputValue: string;
  searchValue: string;
  dropOpen: boolean;
  handleDropOpen: (e: any) => void;
  handleDropClose: (e: any) => void;
  disabled: boolean;
  readOnly: boolean;
  expandable: boolean;
  handleClear: () => void;
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
}) => {
  return (
    <div className="qbs-autocomplete-close-icon">
      {(inputValue || searchValue) && !disabled && !readOnly && !expandable && (
        <button
          onClick={handleClear}
          className="icon-button"
          aria-label="clear"
        >
          <Close />
        </button>
      )}
      {dropOpen ? (
        <button
          type="button"
          onClick={(e) => handleDropClose(e)}
          className="icon-button"
          aria-label="toggle"
          name="toggle"
        >
          <DropArrow className={`icon-button-rotate`} />
        </button>
      ) : (
        <button
          disabled={disabled || readOnly}
          type="button"
          className="icon-button"
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
