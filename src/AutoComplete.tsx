import React, { FC, useEffect, useState, useCallback, useRef } from 'react';

import { useSuggestions } from './utilities/autosuggestions';
import { Close, DropArrow, Spinner } from './utilities/icons';
import { debounce } from './utilities/debounce';
import { filterSuggestions } from './utilities/filterSuggestions';
type ValueProps = {
  id: string;
  name: string;
};

interface AutoSuggestionInputProps {
  id?: string;
  label: string;
  fullWidth?: boolean;
  required?: boolean;
  value?: ValueProps;
  onChange: (value?: ValueProps) => void;
  data?: ValueProps[];
  type?:
    | 'custom_select'
    | 'auto_complete'
    | 'custom_search_select'
    | 'auto_suggestion';
  placeholder?: string;
  getData?: (key?: string) => any;
  errors?: any;
  name: string;
  readOnly?: boolean;
  disabled?: boolean;
  isMultiple?: boolean;
}

const AutoComplete: FC<AutoSuggestionInputProps> = ({
  label,
  onChange,
  getData = async () => [],
  data = [],
  errors,
  required = false,
  name,
  fullWidth = false,
  placeholder,
  id,
  type = 'custom_select',
  readOnly = false,
  disabled = false,
  value,
  isMultiple = false,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  // State Hooks Section

  const [inputValue, setInputValue] = useState<string>(value?.name ?? '');
  const [searchValue, setSearchValue] = useState<string>('');
  const [dropOpen, setDropOpen] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<ValueProps[]>([]);

  // API call for suggestions through a custom hook
  const { suggestions, isLoading, handlePickSuggestions } = useSuggestions(
    getData,
    data,
    type,
    dropOpen
  );

  // Handling the selection of a suggestion
  const handleSuggestionClick = useCallback((suggestion: ValueProps) => {
    if (isMultiple) {
      setSelectedItems((prev) => [...prev, suggestion]);
    } else {
      setInputValue(suggestion.name);
    }
    setSearchValue('');
    onChange(suggestion);
    setDropOpen(false);
  }, []);

  // Adding debounce to avoid making API calls on every keystroke
  const handleChangeWithDebounce = debounce((value) => {
    if (type === 'auto_complete' || type === 'auto_suggestion') {
      handlePickSuggestions(value);
    }
  }, 300);

  const handleMultiSelect = (e: any, suggestion: ValueProps) => {
    const { checked } = e.target;
    if (checked) {
      setSelectedItems((prev) => [...prev, suggestion]);
    } else {
      setSelectedItems((prev) => {
        return prev.filter((item, i) => item.id !== suggestion?.id);
      });
    }
  };

  // Effect to set the input value whenever `value` prop changes
  useEffect(() => {
    setInputValue(value?.name ?? '');
  }, [value?.name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setDropOpen(true);
    setSearchValue(value);
    handleChangeWithDebounce(value);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setDropOpen(false);
    }, 200);
  };

  const handleClear = () => {
    setInputValue('');
    onChange({ id: '', name: '' });
    setDropOpen(false);
  };

  const generateClassName = useCallback(() => {
    return `qbs-textfield-default ${
      errors && errors[name] ? 'textfield-error' : 'textfield'
    }`;
  }, [errors, name]);
  const handleRemoveSelectedItem = (index: number) => {
    setSelectedItems((prev) => {
      return prev.filter((_, i) => i !== index);
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: React.MouseEvent) => {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside as any);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside as any);
    };
  }, []);

  // Filtering suggestions based on type and search value
  const filteredData: ValueProps[] = filterSuggestions(
    suggestions,
    searchValue,
    type
  );

  return (
    <div className={fullWidth ? 'fullWidth' : 'autoWidth'} ref={dropdownRef}>
      {label && (
        <div style={{ marginBottom: 5 }}>
          <label className={`labels label-text`}>
            {label}
            {required && <span className="text-error"> *</span>}
          </label>
        </div>
      )}
      {/* Displaying selected items for multi-select */}
      <div className="selected-items-container">
        {selectedItems.map((item, index) => (
          <div key={index} className="selected-item">
            {item.name}
            <button
              onClick={() => handleRemoveSelectedItem(index)}
              className="remove-item-btn"
            >
              X
            </button>
          </div>
        ))}
      </div>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type="text"
          value={
            type === 'auto_suggestion' ? inputValue : searchValue || inputValue
          }
          onChange={handleChange}
          onBlur={handleBlur}
          className={generateClassName()}
          placeholder={placeholder ?? ''}
          readOnly={
            readOnly || type === 'custom_select' || type == 'auto_suggestion'
              ? true
              : false
          }
          disabled={disabled}
          data-testid="custom-autocomplete"
        />

        {/* Icons for Clearing Input or Toggling Dropdown */}
        <div className="qbs-autocomplete-close-icon">
          {inputValue && !disabled && !readOnly && (
            <button
              onClick={handleClear}
              className="icon-button"
              aria-label="clear"
            >
              <Close />
            </button>
          )}

          <button
            disabled={disabled || readOnly}
            onClick={() => setDropOpen(!dropOpen)}
            className="icon-button"
            aria-label="toggle"
          >
            <DropArrow />
          </button>
        </div>

        {/* Displaying Loading Spinner */}
        {isLoading && (
          <span style={{ position: 'absolute', top: 5, right: 2 }}>
            <Spinner />
          </span>
        )}

        {/* Suggestions Dropdown */}
        {dropOpen && (
          <ul className="qbs-autocomplete-suggestions">
            {type == 'auto_suggestion' && (
              <div style={{ position: 'relative' }}>
                <input
                  className="dropdown-search-input"
                  onChange={handleChange}
                  value={searchValue}
                  placeholder="Type to search..."
                />
              </div>
            )}

            <div className="qbs-autocomplete-suggestions-sub">
              {/* Displaying Suggestions or Not Found Message */}
              {filteredData.length > 0 ? (
                filteredData.map((suggestion: ValueProps, idx: number) => (
                  <div
                    key={idx.toString()}
                    className="qbs-autocomplete-listitem-container"
                  >
                    {isMultiple && (
                      <div>
                        <input
                          onChange={(e) => handleMultiSelect(e, suggestion)}
                          type="checkbox"
                        />
                      </div>
                    )}
                    <li
                      key={idx}
                      className="qbs-autocomplete-suggestions-item"
                      onClick={() => handleSuggestionClick(suggestion)}
                      data-testid={suggestion.name}
                    >
                      {suggestion.name}
                    </li>
                  </div>
                ))
              ) : (
                <li className="qbs-autocomplete-notfound" onClick={handleBlur}>
                  No Results Found
                </li>
              )}
            </div>
          </ul>
        )}
      </div>

      {/* Displaying Validation Error */}
      {errors && errors[name] && (
        <div
          className="text-error text-error-label mt-[1px]"
          data-testid="autocomplete-error"
        >
          {errors[name].message}
        </div>
      )}
    </div>
  );
};

export default React.memo(AutoComplete);
