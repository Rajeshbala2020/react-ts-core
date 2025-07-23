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
import DropdownList from './components/DropdownList';
import InputActions from './components/InputActions';
import { useSuggestions } from './utilities/autosuggestions';
import { debounce } from './utilities/debounce';
import { deepEqual } from './utilities/deepEqual';
import { default as Tooltip } from './utilities/NewTooltip';
import { filterSuggestions } from './utilities/filterSuggestions';
import { AllDropArrow, Search, Spinner } from './utilities/icons';
import { getKeyValue, safeToLowerString } from './utilities/getKeyValue';


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
      isTreeDropdown = false,
      shortCode = '',
      labelCode = '',
      typeOnlyFetch = false,
      autoDropdown = false,
      enableSelectAll = false,
      matchFromStart = false,
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
    const [focusedIndex, setFocusedIndex] = useState(0);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const itemsRef = useRef<HTMLDivElement>(null);
    const dropBtnRef = useRef<HTMLButtonElement>(null);
    const [refetchData, setRefetchData] = useState(false);
    const [selectAll, setSelectAll] = useState(false);

    // API call for suggestions through a custom hook
    const inputRef = useRef(null);
    const dropRef = useRef(null);
    const typeRef = useRef(0);
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
        const spaceAbove = inputRect.top + window.scrollY;

        let dropdownHeight = 275; // Assume a fixed height or calculate based on content
        if (spaceBelow >= dropdownHeight) {
          dropdownPosition.top =
            inputRect.top + window.scrollY + inputRect.height;
        } else {
          dropdownHeight =
            dropdownHeight +
            (filteredData?.length > 0 && enableSelectAll && isMultiple
              ? 32
              : 0);
          dropdownPosition.top =
            inputRect.top + window.scrollY - dropdownHeight + 73;
        }

        setDropdownStyle({
          ...dropdownPosition,
        });
      }
    };

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
      selectedItems,
      typeOnlyFetch
      // nextBlock
    );

    // Handling the selection of a suggestion
    const handleSuggestionClick = useCallback(
      (suggestion: ValueProps, idx: number) => {
        if (isMultiple) {
          setFocusedIndex(idx);
          setSelectedItems((prev) => {
            const isAdded = prev.some(
              (item) =>
                getKeyValue(item, descId, 'id') ===
                getKeyValue(suggestion, descId, 'id')
            );
            if (isAdded) {
              return prev.filter(
                (item) =>
                  getKeyValue(item, descId, 'id') !==
                  getKeyValue(suggestion, descId, 'id')
              );
            } else {
              return [...prev, suggestion];
            }
          });
        } else {
          setFocusedIndex(idx);
          setInputValue(suggestion[desc]);
          setSearchValue('');
          onChange(suggestion);
          setDropOpen(false);
        }
      },
      []
    );

    // Adding debounce to avoid making API calls on every keystroke
    const debouncedUpdate = useCallback(
      debounce((value: string) => {
        handlePickSuggestions(value, 1, false);
        typeRef.current = 0;
      }, 500),
      []
    );

    const handleChangeWithDebounce = (value: string) => {
      if ((type === 'auto_complete' || type === 'auto_suggestion') && async) {
        debouncedUpdate(value);
      } else typeRef.current = 0;
    };

    const handleMultiSelect = (e: any, suggestion: ValueProps) => {
      const { checked } = e.target;
      if (isMultiple) {
        if (checked) {
          setSelectedItems((prev) => [...prev, suggestion]);
        } else {
          setSelectedItems((prev) => {
            return prev.filter(
              (item, i) =>
                getKeyValue(item, descId, 'id') !==
                getKeyValue(suggestion, descId, 'id')
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
      typeRef.current = 1;
      handleChangeWithDebounce(value);
      if (!value) {
        if (!typeOnlyFetch) setInputValue('');
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
      const handleClickOutside = (event: any) => {
        if (
          dropRef.current &&
          event.target instanceof Node &&
          !dropRef.current.contains(event.target) &&
          event.target?.id !== 'drop-arrow-expanded-list-icon'
        ) {
          setTimeout(() => {
            setDropOpen(false);
            if (!typeOnlyFetch) setSearchValue('');
          }, 200);
        }
      };
      document.addEventListener('mousedown', handleClickOutside as any);
      window.addEventListener('scroll', handleClickOutside as any);

      const scrollableDivs = document.querySelectorAll(
        'div[style*="overflow"], .overflow-auto, .overflow-y-auto, .overflow-x-auto'
      );
      scrollableDivs.forEach((div) =>
        div.addEventListener('scroll', handleClickOutside as any)
      );
      if (scrollRef && scrollRef.current && scrollRef.current !== null) {
        scrollRef.current.addEventListener('scroll', handleClickOutside as any);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside as any);
        window.removeEventListener('scroll', handleClickOutside as any);
        scrollableDivs.forEach((div) =>
          div.removeEventListener('scroll', handleClickOutside as any)
        );
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
      async,
      isTreeDropdown,
      true,
      matchFromStart
    );

    useEffect(() => {
      window.addEventListener('resize', adjustDropdownPosition);
      adjustDropdownPosition();

      return () => {
        window.removeEventListener('resize', adjustDropdownPosition);
      };
    }, [dropOpen, selectedItems, filteredData]);

    useEffect(() => {
      // Handle keyboard navigation
      const handleKeyDown = (e: any) => {
        if (!dropOpen) return;

        const atBottom = focusedIndex === filteredData.length - 1;
        const atTop = focusedIndex === 0;
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            if (itemsRef.current) {
              if (!atBottom) {
                itemsRef.current.scrollTop +=
                  itemRefs.current[focusedIndex]?.offsetHeight || 50;
              } else {
                itemsRef.current.scrollTop = 0;
              }
            }
            setFocusedIndex((prev) => (prev + 1) % filteredData?.length);
            break;

          case 'ArrowUp':
            e.preventDefault();
            if (itemsRef.current) {
              if (!atTop) {
                itemsRef.current.scrollTop -=
                  itemRefs.current[focusedIndex]?.offsetHeight || 50;
              } else {
                itemsRef.current.scrollTop = 0;
              }
            }
            setFocusedIndex(
              (prev) => (prev - 1 + filteredData?.length) % filteredData?.length
            );
            break;

          case 'Enter':
            e.preventDefault();
            handleSuggestionClick(filteredData[focusedIndex], focusedIndex);
            break;

          case 'Escape':
            e.preventDefault();
            setDropOpen(false);
            break;

          default:
            break;
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [filteredData, dropOpen, isLoading, focusedIndex]);

    const isSelected = (
      item: ValueProps,
      selectedItems: ValueProps[] | string
    ): boolean => {
      if (Array.isArray(selectedItems)) {
        return selectedItems.some(
          (selectedItem) =>
            getKeyValue(selectedItem, desc, 'name') === getKeyValue(item, desc, 'name') ||
            getKeyValue(selectedItem, descId, 'id') === getKeyValue(item, descId, 'id')
        );
      } else {
        return (
          getKeyValue(item, desc, 'name') === safeToLowerString(selectedItems) ||
          getKeyValue(item, descId, 'id') === safeToLowerString(selectedItems)
        );
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

    const handleDropOpen = (e: any) => {
      if (!dropOpen) setDropOpen(true);
      setFocusedIndex(0);
    };

    const handleDropClose = (e: any) => {
      if (dropOpen) setDropOpen(false);
    };

    const handleClearSelected = () => {
      setSelectedItems([]);
      if (isMultiple) onChange([]);
      else onChange({ [descId]: '', [desc]: '' });
    };

    const handleSelectAll = () => {
      if (isMultiple) {
        if (selectAll) {
          setSelectedItems((prev) =>
            prev.filter(
              (item) =>
                !filteredData.some(
                  (f) =>
                    getKeyValue(f, descId, 'id') === getKeyValue(item, descId, 'id')
                )
            )
          );
        } else {
          filteredData.map((suggestion: ValueProps) =>
            setSelectedItems((prev) => {
              const isAdded = prev.some(
                (item) =>
                  getKeyValue(item, descId, 'id') ===
                  getKeyValue(suggestion, descId, 'id')
              );
              if (isAdded) {
                return prev;
              } else {
                return [...prev, suggestion];
              }
            })
          );
        }
      }
    };

    const handleOpenDropdown = (e: any) => {
      if (!suggestions || suggestions?.length === 0 || refetchData) {
        if (autoDropdown && (inputValue === '' || inputValue.trim() === '')) {
          handlePickSuggestions('*', 1);
          setRefetchData(false);
        } else if (!refetchData && inputValue !== '') {
          handlePickSuggestions(inputValue, 1);
          setRefetchData(true);
        }
      }
      if (!isLoading) {
        setDropOpen(!dropOpen);
      }
    };

    useEffect(() => {
      const allSelected =
        filteredData.length > 0 &&
        filteredData.every((item) =>
          selectedItems.some(
            (s) =>
              getKeyValue(s, descId, 'id') === getKeyValue(item, descId, 'id')
          )
        );

      setSelectAll(allSelected);
    }, [filteredData, selectedItems, descId]);

    return (
      <div
        id={id ? `expandable-container-${id}` : `expandable-container-${name}`}
        className={fullWidth ? 'fullWidth' : 'autoWidth'}
        ref={dropdownRef}
      >
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
                  <div key={index} className="selected-items-container">
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
              id={id ? `input-expandable-${id}` : `input-expandable-${name}`}
              ref={inputRef}
              type="text"
              autoComplete="off"
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

          <>
            {autoDropdown && !disabled && !readOnly && (
              <button
                disabled={disabled ?? readOnly}
                onClick={(e) => handleOpenDropdown(e)}
                className="text-[#667085] focus-visible:outline-slate-100 absolute right-2 qbs-all-dropdown-btn"
                data-testid="drop-arrow"
                type="button"
                id="autocomplete-drop-icon"
                ref={dropBtnRef}
              >
                <AllDropArrow
                  type={!dropOpen ? 'down' : 'up'}
                  uniqueId="all-dropdow-arrow-icon"
                  className="all-dropdow-arrow-icon"
                />
              </button>
            )}
          </>

          {selectedItems?.length > 1 && (
            <div
              id="expandable-clear-all"
              className={`qbs-clear-link qbs-text-right qbs-cursor-pointer qbs-text-xs absolute right-2 qbs-bottom-0`}
              onClick={handleClearSelected}
            >
              Clear all
            </div>
          )}

          {/* Icons for Clearing Input or Toggling Dropdown */}

          <InputActions
            inputValue={inputValue}
            searchValue={searchValue}
            dropOpen={dropOpen}
            handleDropOpen={handleDropOpen}
            handleDropClose={handleDropClose}
            disabled={disabled}
            readOnly={readOnly}
            expandable={expandable}
            handleClear={handleClear}
            uniqueDropArrowId="drop-arrow-expanded-list-icon"
            autoDropdown={autoDropdown}
          />
          {/* Displaying Loading Spinner */}

          {/* Suggestions Dropdown */}

          {dropOpen &&
            ReactDOM.createPortal(
              <ul
                ref={dropRef}
                style={{ ...dropdownStyle, minHeight: 192 }}
                className={`qbs-autocomplete-suggestions qbs-autocomplete-suggestions-expandable`}
                id={
                  id
                    ? `autocomplete-dropdown-${id}`
                    : `autocomplete-dropdown-${name}`
                }
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
                      placeholder="Type to search"
                      autoComplete="off"
                    />
                  </div>
                )}

                {filteredData?.length > 0 && enableSelectAll && isMultiple && (
                  <div
                    id="select-all"
                    className={`qbs-select-all-link qbs-cursor-pointer qbs-text-xs`}
                    onClick={handleSelectAll}
                  >
                    <div
                      className={`qbs-autocomplete-listitem-container qbs-autocomplete-checkbox-container`}
                    >
                      <div className="qbs-autocomplete-checkbox">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          id={`qbs-checkbox-all`}
                        />
                        <label htmlFor={`qbs-checkbox-all`}>
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
                      <div className={`qbs-autocomplete-suggestions-item`}>
                        Select All
                      </div>
                    </div>
                  </div>
                )}

                <div className="qbs-autocomplete-suggestions-expandable-container">
                  <div
                    className={`qbs-autocomplete-suggestions-sub qbs-autocomplete-suggestions-outer`}
                    ref={itemsRef}
                  >
                    {filteredData?.length > 0 ? (
                      filteredData.map(
                        (suggestion: ValueProps, idx: number) => (
                          <DropdownList
                            idx={idx}
                            suggestion={suggestion}
                            isSelected={isSelected}
                            handleSuggestionClick={() =>
                              handleSuggestionClick(suggestion, idx)
                            }
                            handleMultiSelect={handleMultiSelect}
                            selected={selected}
                            isMultiple={isMultiple}
                            singleSelect={singleSelect}
                            desc={desc}
                            shortCode={shortCode}
                            labelCode={labelCode}
                            focusedIndex={focusedIndex}
                            setItemRef={(index, ref) => {
                              itemRefs.current[index] = ref; // Store each ref properly
                            }}
                          />
                        )
                      )
                    ) : (
                      <>
                        {isLoading ? (
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                            }}
                            className="qbs-autocomplete-loader"
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
                            {notDataMessage ??
                            (searchValue === '' || typeRef.current === 1)
                              ? 'Start typing to see suggestions'
                              : 'No Results Found'}
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
