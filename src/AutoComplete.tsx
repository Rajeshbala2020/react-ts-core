import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

import { AutoSuggestionInputProps } from './commontypes';
import { useSuggestions } from './utilities/autosuggestions';
import { debounce } from './utilities/debounce';
import { filterSuggestions } from './utilities/filterSuggestions';
import { Close, DropArrow, Spinner } from './utilities/icons';

type ValueProps = {
  [key: string]: string;
};

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
  desc = 'name',
  descId = 'id',
  singleSelect,
  className,
  async = false,
  nextBlock,
  paginationEnabled,
  initialLoad,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  // State Hooks Section

  const [inputValue, setInputValue] = useState<string>(value);
  const [searchValue, setSearchValue] = useState<string>('');
  const [dropOpen, setDropOpen] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<ValueProps[]>([]);
  // API call for suggestions through a custom hook
  const { suggestions, isLoading, handlePickSuggestions } = useSuggestions(
    getData,
    data,
    dropOpen,
    async,
    paginationEnabled,
    initialLoad
    // nextBlock
  );

  // Handling the selection of a suggestion
  const handleSuggestionClick = useCallback((suggestion: ValueProps) => {
    if (isMultiple) {
      setSelectedItems((prev) => [...prev, suggestion]);
    } else {
      setInputValue(suggestion[desc]);
    }
    setSearchValue('');
    setInputValue(suggestion[desc]);
    onChange(suggestion);
    setDropOpen(false);
  }, []);

  // Adding debounce to avoid making API calls on every keystroke
  const handleChangeWithDebounce = debounce((value) => {
    if ((type === 'auto_complete' || type === 'auto_suggestion') && async) {
      handlePickSuggestions(value, 1);
    }
  }, 300);

  const handleMultiSelect = (e: any, suggestion: ValueProps) => {
    const { checked } = e.target;
    if (isMultiple) {
      if (checked) {
        setSelectedItems((prev) => [...prev, suggestion]);
      } else {
        setSelectedItems((prev) => {
          return prev.filter((item, i) => item[descId] !== suggestion[descId]);
        });
      }
    } else {
      if (checked) {
        setInputValue(suggestion[desc]);
        onChange(suggestion);
      } else {
        setInputValue('');
      }
    }
  };

  // Effect to set the input value whenever `value` prop changes
  useEffect(() => {
    setInputValue(value ?? '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setDropOpen(true);
    setSearchValue(value);
    handleChangeWithDebounce(value);
    if (!value) {
      setInputValue('');
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setDropOpen(false);
    }, 200);
  };

  const handleClear = () => {
    setInputValue('');
    onChange({ [descId]: '', [desc]: '' });
    setDropOpen(false);
  };

  const generateClassName = useCallback(() => {
    return `qbs-textfield-default ${className} ${
      errors && errors?.message ? 'textfield-error' : 'textfield'
    }`;
  }, [errors, name]);
  const handleRemoveSelectedItem = (index: number) => {
    setSelectedItems((prev) => {
      return prev.filter((_, i) => i !== index);
    });
  };
  //TO DO
  // useEffect(() => {
  //   onChange(selectedItems);
  // }, [selectedItems]);

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
  const selected: any = isMultiple ? selectedItems : inputValue;
  const filteredData: ValueProps[] = filterSuggestions(
    suggestions,
    searchValue,
    type,
    desc,
    selected,
    async
  );
  const isSelected = (
    item: ValueProps,
    selectedItems: ValueProps[] | string
  ): boolean => {
    if (Array.isArray(selectedItems)) {
      return selectedItems.some(
        (selectedItem) => selectedItem[desc] === item[desc]
      );
    } else {
      return item[desc] === selectedItems;
    }
  };
  const handleLoadMore = () => {
    handlePickSuggestions(searchValue, nextBlock, true);
  };
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

      <div style={{ position: 'relative' }}>
        <div className="selected-items-container">
          {selectedItems.length > 0 && (
            <>
              <div key={selectedItems[0].id} className="selected-item">
                {selectedItems[0].name.length > 8
                  ? `${selectedItems[0].name.substring(0, 8)}...`
                  : selectedItems[0].name}
                <button
                  onClick={() => handleRemoveSelectedItem(0)}
                  className="remove-item-btn"
                  aria-label={`Remove ${selectedItems[0].name}`}
                >
                  X
                </button>
              </div>

              {selectedItems.length > 1 && (
                <div className="selected-item-more">
                  +{selectedItems.length - 1} more
                </div>
              )}
            </>
          )}
        </div>
        <input
          id={id}
          type="text"
          value={
            type === 'auto_suggestion' ? inputValue : searchValue || inputValue
          }
          onChange={handleChange}
          onBlur={handleBlur}
          // onClick={() => (!disabled && !readOnly ? setDropOpen(!dropOpen) : '')}
          className={generateClassName()}
          placeholder={selectedItems?.length > 0 ? '' : placeholder ?? ''}
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

        {/* Suggestions Dropdown */}
        {dropOpen && (
          <ul className="qbs-autocomplete-suggestions">
            {type == 'auto_suggestion' && (
              <div
                style={{ position: 'relative' }}
                className="qbs-core-search-container"
              >
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
              {/* {isLoading && ( 
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <span>
                  <Spinner />
                </span>
              </div>

              {/* )} */}

              {filteredData.length > 0 ? (
                filteredData.map((suggestion: ValueProps, idx: number) => (
                  <div
                    key={idx.toString()}
                    className="qbs-autocomplete-listitem-container"
                  >
                    {(isMultiple || singleSelect) && (
                      <div>
                        <input
                          onChange={(e) => handleMultiSelect(e, suggestion)}
                          type="checkbox"
                          checked={isSelected(suggestion, selected)}
                        />
                      </div>
                    )}
                    <li
                      key={idx}
                      className={`qbs-autocomplete-suggestions-item ${
                        isSelected(suggestion, selected) ? 'is-selected' : ''
                      }`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      data-testid={suggestion[desc]}
                    >
                      {suggestion[desc]}
                    </li>
                  </div>
                ))
              ) : (
                <>
                  {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <span>
                        <Spinner />
                      </span>
                    </div>
                  ) : (
                    <li
                      className="qbs-autocomplete-notfound"
                      onClick={handleBlur}
                    >
                      No Results Found
                    </li>
                  )}
                </>
              )}
              {paginationEnabled &&
                nextBlock !== 0 &&
                nextBlock !== undefined &&
                filteredData.length > 0 && (
                  <div
                    className="loadMoreSection"
                    onClick={() => handleLoadMore()}
                  >
                    <p style={{ margin: 2 }}>Load More</p>
                  </div>
                )}
            </div>
          </ul>
        )}
      </div>

      {/* Displaying Validation Error */}
      {errors && (
        <div
          className="text-error text-error-label mt-[1px]"
          data-testid="autocomplete-error"
        >
          {errors.message}
        </div>
      )}
    </div>
  );
};

export default React.memo(AutoComplete);
