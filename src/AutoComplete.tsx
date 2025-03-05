import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { AutoSuggestionInputProps } from './commontypes';
import { useSuggestions } from './utilities/autosuggestions';
import { debounce } from './utilities/debounce';
import { deepEqual } from './utilities/deepEqual';
import { filterSuggestions } from './utilities/filterSuggestions';
import { Close, DropArrow, Search, Spinner } from './utilities/icons';
import Tooltip from './utilities/tooltip';

type ValueProps = {
  [key: string]: string;
};
const AutoComplete = forwardRef<HTMLInputElement, AutoSuggestionInputProps>(
  (
    {
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
      selectedItems: propsSeelctedItems = [],
      readOnly = false,
      disabled = false,
      value,
      isMultiple = false,
      desc = 'name',
      descId = 'id',
      singleSelect,
      className,
      async = false,
      paginationEnabled,
      initialLoad,
      actionLabel,
      handleAction,
      nextBlock,
      notDataMessage,
      onFocus,
    },
    ref
  ) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    // State Hooks Section
    const [isInitialRender, setIsInitialRender] = useState(true);

    const [inputValue, setInputValue] = useState<string>(value);
    const [searchValue, setSearchValue] = useState<string>('');
    const [nextPage, setNextPage] = useState<number | undefined>(1);
    const [dropOpen, setDropOpen] = useState<boolean>(false);
    const [selectedItems, setSelectedItems] = useState<ValueProps[]>([]);
    // API call for suggestions through a custom hook
    const [dropdownPosition, setDropdownPosition] = useState('bottom');
    const inputRef = useRef(null);
    const dropRef = useRef(null);
    useImperativeHandle(ref, () => inputRef.current);

    const adjustDropdownPosition = () => {
      if (inputRef.current && dropRef.current) {
        const inputBoxRect = inputRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        const spaceAbove = inputBoxRect.top;
        const spaceBelow = viewportHeight - inputBoxRect.bottom;
        if (spaceAbove > spaceBelow) {
          setDropdownPosition('top');
        } else {
          setDropdownPosition('bottom');
        }
      }
    };

    useEffect(() => {
      window.addEventListener('resize', adjustDropdownPosition);
      adjustDropdownPosition();

      return () => {
        window.removeEventListener('resize', adjustDropdownPosition);
      };
    }, [dropOpen]);

    const { suggestions, isLoading, handlePickSuggestions } = useSuggestions(
      getData,
      data,
      dropOpen,
      async,
      paginationEnabled,
      initialLoad,
      inputValue,
      isMultiple,
      setNextPage,
      selectedItems
      // nextBlock
    );

    // Handling the selection of a suggestion
    const handleSuggestionClick = useCallback((suggestion: ValueProps) => {
      if (isMultiple) {
        setSelectedItems((prev) => {
          const isAdded = prev.some(
            (item) => item[descId] === suggestion[descId]
          );
          if (isAdded) {
            return prev.filter((item) => item[descId] !== suggestion[descId]);
          } else {
            return [...prev, suggestion];
          }
        });
      } else {
        setInputValue(suggestion[desc]);
        setSearchValue('');
        onChange(suggestion);
        setDropOpen(false);
      }
    }, []);

    // Adding debounce to avoid making API calls on every keystroke
    const handleChangeWithDebounce = debounce((value) => {
      if ((type === 'auto_complete' || type === 'auto_suggestion') && async) {
        handlePickSuggestions(value, 1);
      }
    }, 1000);

    const handleMultiSelect = (e: any, suggestion: ValueProps) => {
      const { checked } = e.target;
      if (isMultiple) {
        if (checked) {
          setSelectedItems((prev) => [...prev, suggestion]);
        } else {
          setSelectedItems((prev) => {
            return prev.filter(
              (item, i) => item[descId] !== suggestion[descId]
            );
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
    useEffect(() => {
      if (!deepEqual(selectedItems, propsSeelctedItems))
        setSelectedItems(propsSeelctedItems);
    }, [propsSeelctedItems]);
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
        onChange({ [descId]: '', [desc]: '' });
      }
    };
    const handleSuggestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (searchValue) {
        setSearchValue('');
        setDropOpen(false);
      } else {
        setInputValue('');
        onChange({ [descId]: '', [desc]: '' });
        setDropOpen(false);
      }
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

    useEffect(() => {
      if (isInitialRender) {
        setIsInitialRender(false);
      } else {
        onChange(selectedItems);
      }
    }, [selectedItems]);

    useEffect(() => {
      const handleClickOutside = (event: React.MouseEvent) => {
        if (
          dropdownRef.current &&
          event.target instanceof Node &&
          !dropdownRef.current.contains(event.target)
        ) {
          setDropOpen(false);
          setSearchValue('');
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
      if (paginationEnabled) {
        handlePickSuggestions(searchValue, nextPage + 1, true);
        setNextPage(nextPage + 1);
      }
    };

    const handleOnClick = () => {
      !disabled && !readOnly ? setDropOpen(true) : '';
    };
    const tooltipContent =
      selectedItems?.length > 1
        ? selectedItems
            ?.slice(1)
            .map((item) => item[desc])
            .join(', ')
        : '';

    return (
      <div className={fullWidth ? 'fullWidth' : 'autoWidth'} ref={dropdownRef}>
        {label && (
          <div
            style={{
              marginBottom: 5,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <label className={`labels label-text`}>
              {label}
              {required && <span className="text-error"> *</span>}
            </label>
            <span onClick={() => handleAction?.()} className={`action_label`}>
              {actionLabel}
            </span>
          </div>
        )}
        {/* Displaying selected items for multi-select */}

        <div style={{ position: 'relative' }}>
          <div className="selected-items-container ">
            {selectedItems?.length > 0 && (
              <>
                <div key={selectedItems[0].id} className="selected-item">
                  <Tooltip title={selectedItems[0]?.[desc]}>
                    {selectedItems[0]?.[desc]?.length > 8
                      ? `${selectedItems[0]?.[desc].substring(0, 8)}...`
                      : selectedItems[0]?.[desc]}
                  </Tooltip>
                  <button
                    onClick={() => handleRemoveSelectedItem(0)}
                    className="remove-item-btn"
                    aria-label={`Remove ${selectedItems[0]?.[desc]}`}
                  >
                    X
                  </button>
                </div>
                <Tooltip title={tooltipContent}>
                  {selectedItems?.length > 1 && (
                    <div className="selected-item-more">
                      +{selectedItems?.length - 1} more
                    </div>
                  )}
                </Tooltip>
              </>
            )}
          </div>
          <input
            id={id}
            ref={inputRef}
            type="text"
            value={
              type === 'auto_suggestion'
                ? inputValue
                : searchValue || inputValue
            }
            onChange={handleChange}
            // onBlur={handleBlur}
            onFocus={onFocus}
            onClick={() => handleOnClick()}
            className={generateClassName()}
            placeholder={selectedItems?.length > 0 ? '' : placeholder ?? ''}
            readOnly={
              readOnly || type === 'custom_select' || type == 'auto_suggestion'
            }
            disabled={disabled}
            data-testid="custom-autocomplete"
          />

          {/* Icons for Clearing Input or Toggling Dropdown */}
          <div className="qbs-autocomplete-close-icon">
            {(inputValue || searchValue) && !disabled && !readOnly && (
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
              type="button"
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
            <ul
              ref={dropRef}
              className={`qbs-autocomplete-suggestions ${dropdownPosition}`}
            >
              {type == 'auto_suggestion' && (
                <div
                  style={{ position: 'relative' }}
                  className="react-core-ts-search-container"
                >
                  <span className="dropdown-search-icon">
                    <Search />
                  </span>
                  <input
                    className="dropdown-search-input"
                    onChange={handleSuggestionChange}
                    value={searchValue}
                    placeholder="Search"
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

                {filteredData?.length > 0 ? (
                  filteredData.map((suggestion: ValueProps, idx: number) => (
                    <div
                      key={idx.toString()}
                      className={`qbs-autocomplete-listitem-container ${
                        (isMultiple || singleSelect) &&
                        'qbs-autocomplete-checkbox-container'
                      } ${
                        isSelected(suggestion, selected) ? 'is-selected' : ''
                      }`}
                    >
                      {(isMultiple || singleSelect) && (
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
                      <div
                        style={{ display: 'flex', justifyContent: 'center' }}
                      >
                        <span>
                          <Spinner />
                        </span>
                      </div>
                    ) : (
                      <li
                        className="qbs-autocomplete-notfound"
                        onClick={handleBlur}
                      >
                        {notDataMessage ?? 'No Results Found'}
                      </li>
                    )}
                  </>
                )}
                {paginationEnabled &&
                  nextBlock !== 0 &&
                  nextBlock !== undefined &&
                  filteredData?.length > 0 && (
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
  }
);

export default React.memo(AutoComplete);
