import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom';

import { AutoSuggestionInputProps } from './commontypes';
import { useSuggestions } from './utilities/autosuggestions';
import { debounce } from './utilities/debounce';
import { deepEqual } from './utilities/deepEqual';
import { default as Tooltip } from './utilities/expandableTootltip';
import { filterSuggestions } from './utilities/filterSuggestions';
import { Close, DropArrow, Search, Spinner } from './utilities/icons';

type ValueProps = {
  [key: string]: string;
};
const ExpandableAutoComplete = forwardRef<
  HTMLInputElement,
  AutoSuggestionInputProps
>(
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
      expandable = false,
      textCount = 10,
      itemCount = 1,
      scrollRef,
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
    const inputRef = useRef(null);
    const dropRef = useRef(null);
    useImperativeHandle(ref, () => inputRef.current);
    const [dropdownStyle, setDropdownStyle] = useState({
      top: 0,
      left: 0,
      width: 200,
    });

    const adjustDropdownPosition = () => {
      if (dropdownRef.current) {
        const inputRect = dropdownRef.current.getBoundingClientRect();
        const dropdownPosition = {
          left: inputRect.left + window.scrollX,
          width: inputRect.width,
          top: 0,
        };
        // Check if there's enough space below the input for the dropdown
        const spaceBelow = window.innerHeight - inputRect.bottom;
        const dropdownHeight = 275; // Assume a fixed height or calculate based on content

        if (spaceBelow >= dropdownHeight) {
          dropdownPosition.top = inputRect.bottom + window.scrollY;
        } else {
          dropdownPosition.top =
            inputRect.top +
            window.scrollY -
            dropdownHeight +
            inputRect.height +
            20;
        }

        setDropdownStyle({
          ...dropdownPosition,
        });
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
        // onChange({ [descId]: '', [desc]: '' });
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
      } ${expandable ? 'expandable' : ''}`;
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
          dropRef.current &&
          event.target instanceof Node &&
          !dropRef.current.contains(event.target)
        ) {
          setDropOpen(false);
          setSearchValue('');
        }
      };
      document.addEventListener('mousedown', handleClickOutside as any);
      window.addEventListener('scroll', handleClickOutside as any);

      const scrollableDivs = document.querySelectorAll('div[style*="overflow"]');
      scrollableDivs.forEach(div => div.addEventListener('scroll', handleClickOutside as any))
      if (scrollRef && scrollRef.current && scrollRef.current !== null) {
        scrollRef.current.addEventListener('scroll', handleClickOutside as any);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside as any);
        window.removeEventListener('scroll', handleClickOutside as any);
        scrollableDivs.forEach(div => div.removeEventListener('scroll', handleClickOutside as any))
        if (scrollRef && scrollRef.current && scrollRef.current !== null) {
          scrollRef.current.removeEventListener(
            'scroll',
            handleClickOutside as any
          );
        }
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
    const onInputFocus = () => {
      if (inputRef.current) inputRef.current.focus();
      handleOnClick();
    };

    const tooltipContent =
      selectedItems?.length > itemCount
        ? selectedItems
            ?.slice(itemCount)
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

        <div
          className={`${
            expandable ? 'qbs-expandable-container' : 'qbs-container'
          }`}
          style={{ position: 'relative' }}
        >
          {selectedItems?.length > 0 && (
            <>
              {selectedItems
                .slice(
                  0,
                  selectedItems?.length > itemCount
                    ? itemCount
                    : selectedItems?.length
                )
                .map((item, index) => (
                  <div className="selected-items-container">
                    <Tooltip
                      title={item?.[desc]}
                      enabled={item?.[desc]?.length > textCount}
                    >
                      <div key={item.id} className="selected-item">
                        {item?.[desc]?.length > textCount
                          ? `${item?.[desc].substring(0, textCount)}...`
                          : item?.[desc]}

                        <button
                          onClick={() => handleRemoveSelectedItem(index)}
                          className="remove-item-btn"
                          aria-label={`Remove ${item?.[desc]}`}
                        >
                          X
                        </button>
                      </div>
                    </Tooltip>
                  </div>
                ))}
              {selectedItems?.length > itemCount && (
                <div className="selected-items-container">
                  <Tooltip title={tooltipContent} enabled={true}>
                    <div className="selected-item-more">
                      +{selectedItems?.length - itemCount} more
                    </div>
                  </Tooltip>
                </div>
              )}
            </>
          )}

          <div
            className={`qbs-textfield-expandable ${
              !expandable ? 'qbs-normal' : ''
            }`}
            data-value={
              selectedItems?.length > 0 || searchValue
                ? searchValue
                : placeholder ?? ''
            }
            onClick={() => onInputFocus()}
          >
            <input
              id={id}
              ref={inputRef}
              type="text"
              value={
                type === 'auto_suggestion' && !expandable
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
                readOnly ||
                type === 'custom_select' ||
                (type == 'auto_suggestion' && !expandable)
              }
              disabled={disabled}
              data-testid="custom-autocomplete"
            />
          </div>

          {/* Icons for Clearing Input or Toggling Dropdown */}
          {!expandable && (
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
          )}

          {/* Displaying Loading Spinner */}

          {/* Suggestions Dropdown */}

          {dropOpen &&
            ReactDOM.createPortal(
              <ul
                ref={dropRef}
                style={{ ...dropdownStyle, minHeight: 192 }}
                className={`qbs-autocomplete-suggestions`}
              >
                {type == 'auto_suggestion' && !expandable && (
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
                            isSelected(suggestion, selected)
                              ? 'is-selected'
                              : ''
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
              </ul>,
              document.body
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

export default React.memo(ExpandableAutoComplete);
