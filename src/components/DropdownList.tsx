import React from 'react';

type ValueProps = {
  idx: number;
  suggestion: any;
  isSelected: (item: any, selectedItems: any[] | string) => boolean;
  handleSuggestionClick: (suggestion: any) => void;
  handleMultiSelect: (e: any, suggestion: any) => void;
  selected: any;
  isMultiple?: boolean;
  singleSelect?: boolean;
  desc: string;
  hideCheckbox?: boolean;
};
const DropdownList: React.FC<ValueProps> = ({
  idx,
  suggestion,
  isSelected,
  handleSuggestionClick,
  handleMultiSelect,
  selected,
  isMultiple,
  singleSelect,
  desc,
  hideCheckbox = false,
}) => {
  return (
    <div
      key={idx.toString()}
      className={`qbs-autocomplete-listitem-container ${
        (isMultiple || singleSelect) && 'qbs-autocomplete-checkbox-container'
      } ${isSelected(suggestion, selected) ? 'is-selected' : ''}`}
    >
      {(isMultiple || singleSelect) && !hideCheckbox && (
        <div className="qbs-autocomplete-checkbox">
          <input
            onChange={(e) => handleMultiSelect(e, suggestion)}
            type="checkbox"
            checked={isSelected(suggestion, selected)}
            id={`qbs-checkbox-${idx.toString()}`}
          />
          <label htmlFor={`qbs-checkbox-${idx.toString()}`}>
            <svg
              width="8"
              height="6"
              viewBox="0 0 8 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 3.21739L2.89883 6L8 1.06994L6.89494 0L2.89883 3.86768L1.09728 2.14745L0 3.21739Z"
                fill="white"
              />
            </svg>
          </label>
        </div>
      )}
      <div
        key={idx}
        className={`qbs-autocomplete-suggestions-item ${
          isSelected(suggestion, selected) ? 'is-selected' : ''
        }`}
        onClick={() => handleSuggestionClick(suggestion)}
        data-testid={suggestion[desc]}
      >
        {suggestion[desc]}
      </div>
    </div>
  );
};

export default DropdownList;
