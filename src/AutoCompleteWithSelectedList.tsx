import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom';

import { AutoSuggestionInputProps, TabPops, ValueProps } from './commontypes';
import DropdownList from './components/DropdownList';
import InputActions from './components/InputActions';
import { useSuggestions } from './utilities/autosuggestions';
import { debounce } from './utilities/debounce';
import { deepEqual } from './utilities/deepEqual';
import { filterSuggestions } from './utilities/filterSuggestions';
import { AllDropArrow, DropArrow, Search, Spinner } from './utilities/icons';
import { default as Tooltip } from './utilities/NewTooltip';
import { getKeyValue, safeToLowerString } from './utilities/getKeyValue';

const AutoCompleteWithSelectedList = forwardRef<
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
      initialLoad = false,
      actionLabel,
      handleAction,
      nextBlock,
      notDataMessage,
      initialDataMessage,
      onFocus,
      expandable = false,
      textCount = 10,
      itemCount = 1,
      scrollRef,
      countOnly = true,
      typeOnlyFetch = false,
      tab = [],
      clearTabSwitch = false,
      selectedRowLimit = 2,
      topMargin = 0,
      currentTab = 0,
      selectedLabel = '',
      viewMode = false,
      handleUpdateParent,
      shortCode = '',
      labelCode = '',
      tabInlineSearch = true,
      matchFromStart = false,
      autoDropdown = false,
      enableSelectAll = false,
    },
    ref
  ) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selItemRef = useRef<HTMLDivElement>(null);
    const itemsRef = useRef<HTMLDivElement>(null);
    const dropdownSelectedRef = useRef<HTMLDivElement>(null);
    const tabRef = useRef<HTMLUListElement>(null);
    const dropLevelRef = useRef<string>('bottom');
    // State Hooks Section
    const [isInitialRender, setIsInitialRender] = useState(true);
    const [inputValue, setInputValue] = useState<string>(value);
    const [searchValue, setSearchValue] = useState<string>('');
    const [searchOldValue, setSearchOldValue] = useState<string>('');
    const [nextPage, setNextPage] = useState<number | undefined>(1);
    const [dropOpen, setDropOpen] = useState<boolean>(false);
    const [selectedItems, setSelectedItems] = useState<ValueProps[]>([]);
    const [showAllSelected, setShowAllSelected] = useState<boolean>(false);
    const [selHeight, setSelHeight] = useState<number>(184);
    const [expandArrowClick, setExpandArrowClick] = useState<
      number | undefined
    >(1);
    const [visible, setVisible] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<number>(currentTab);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    // API call for suggestions through a custom hook
    const inputRef = useRef(null);
    const dropRef = useRef(null);
    const inputSearchRef = useRef(null);
    const dropBtnRef = useRef<HTMLButtonElement>(null);
    useImperativeHandle(ref, () => inputRef.current);
    const [dropdownStyle, setDropdownStyle] = useState({
      top: 0,
      left: 0,
      width: 200,
    });

    const [selectAll, setSelectAll] = useState(false);
    const [refetchData, setRefetchData] = useState(false);
    const [allDataLoaded, setAllDataLoaded] = useState(false);

    let originalOverflow = '';
    let hasScrollbar = false;

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

        let dropdownHeight = viewMode ? 160 : 300; // Assume a fixed height or calculate based on content
        const defaultHeight = 184;

        if (countOnly) {
          if (dropdownSelectedRef?.current)
            dropdownHeight += dropdownSelectedRef?.current?.clientHeight;
        }
        if (tab.length > 0) {
          if (tabRef?.current) dropdownHeight += tabRef?.current?.clientHeight;
        }
        if (spaceBelow >= dropdownHeight) {
          dropLevelRef.current = 'bottom';
          dropdownPosition.top =
            inputRect.top + window.scrollY + inputRect.height;

          setSelHeight(defaultHeight);
        } else if (spaceAbove >= dropdownHeight) {
          let sHeight = tabInlineSearch ? 73 : 113;
          sHeight =
            sHeight -
            (filteredData?.length > 0 && enableSelectAll && isMultiple
              ? 32
              : 0);
          dropLevelRef.current = 'top';
          dropdownPosition.top =
            inputRect.top +
            window.scrollY -
            dropdownHeight +
            sHeight +
            topMargin;

          setSelHeight(defaultHeight);
        } else {
          dropLevelRef.current = 'bottom';
          dropdownPosition.top =
            inputRect.top + window.scrollY + inputRect.height;

          if (itemsRef?.current) {
            const totalH = showAllSelected ? 148 : defaultHeight;
            const selH = totalH - (dropdownHeight - spaceBelow);
            setSelHeight(selH < 50 ? 50 : selH);
          }
        }
        // setDropdownStyle({
        //   ...dropdownPosition,
        // });
        setDropdownStyle((prevStyle) => ({
          ...prevStyle,
          transform: `translateY(${dropdownPosition.top}px)`,
          left: inputRect.left + window.scrollX,
          width: inputRect.width,
        }));
      }
    };

    useEffect(() => {
      window.addEventListener('resize', adjustDropdownPosition);
      adjustDropdownPosition();

      return () => {
        window.removeEventListener('resize', adjustDropdownPosition);
      };
    }, [dropOpen, expandArrowClick]);

    const { suggestions, isLoading, handlePickSuggestions, resetSuggections } =
      useSuggestions(
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
            const isAdded =
              prev && prev.length > 0
                ? prev.some(
                    (item) =>
                      getKeyValue(item, descId, 'id') ===
                      getKeyValue(suggestion, descId, 'id')
                  )
                : false;
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
      debounce((value: string, tabVal?: number | string) => {
        setSearchOldValue(value);
        handlePickSuggestions(value, 1, false, tabVal);
      }, 500),
      []
    );

    const handleChangeWithDebounce = (value: string) => {
      if ((type === 'auto_complete' || type === 'auto_suggestion') && async) {
        const activeTabVal = tab.length > 0 ? tab?.[activeTab].id : undefined;
        debouncedUpdate(value, activeTabVal);
      }
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
      // Only update if different
      if (!deepEqual(selectedItems, propsSeelctedItems)) {
        setSelectedItems(propsSeelctedItems);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propsSeelctedItems]);
    // Effect to set the input value whenever `value` prop changes
    useEffect(() => {
      setInputValue(value ?? '');
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      //setVisibleDrop();
      setSearchValue(value);
      handleChangeWithDebounce(value);
      if (!value) {
        setInputValue('');
        // onChange({ [descId]: '', [desc]: '' });
      }

      if (!tabInlineSearch) {
        setDropOpen(true);
      }
    };
    const handleSuggestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      //setVisibleDrop();
      const trimStart = value.trimStart();
      setSearchValue(trimStart);
      handleChangeWithDebounce(trimStart);
      setAllDataLoaded(false);
    };

    const handleClear = () => {
      if (searchValue) {
        setSearchValue('');
        setDropOpen(false);
      } else {
        setInputValue('');
        if (isMultiple) onChange([]);
        else onChange({ [descId]: '', [desc]: '' });
        setDropOpen(false);
      }
    };

    const handleClearSelected = () => {
      setSelectedItems([]);
      setShowAllSelected(false);
      if (searchValue && type === 'auto_suggestion' && tabInlineSearch) {
        setSearchValue('');
      }
      if (isMultiple) onChange([]);
      else onChange({ [descId]: '', [desc]: '' });
      if (async && type === 'auto_suggestion' && tabInlineSearch) resetSuggections?.();
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

    const uniqueDropArrowId = `${name}-drop-arrow-selected-list-icon`;
    useEffect(() => {
      const handleClickOutside = (event: any) => {
        if (
          dropRef.current &&
          event.target instanceof Node &&
          !dropRef.current.contains(event.target) &&
          event.target?.id !== uniqueDropArrowId
        ) {
          setTimeout(() => {
            setDropOpen(false);
          }, 200);
          //setSearchValue("");
        }
      };

      // const observer = new MutationObserver(() => {
      //   adjustDropdownPosition();
      // });

      // observer.observe(document.body, {
      //   childList: true,
      //   subtree: true,
      //   attributes: true,
      // });

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
      false,
      true,
      matchFromStart
    );

    useEffect(() => {
      if (isInitialRender) {
        setIsInitialRender(false);
      } else {
        onChange(selectedItems);
      }
      adjustDropdownPosition();
      setTimeout(() => {
        adjustDropdownPosition();
      }, 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedItems]);

    useEffect(() => {
      adjustDropdownPosition();
      setTimeout(() => {
        adjustDropdownPosition();
      }, 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredData]);

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
            if (filteredData && filteredData.length > 0)
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
      (!disabled && !readOnly && !expandable && !dropOpen) || viewMode
        ? setVisibleDrop()
        : '';
    };
    const onInputFocus = () => {
      if (!dropOpen) {
        if (countOnly) {
          setTimeout(() => {
            if (inputSearchRef.current) inputSearchRef.current.focus();
          }, 10);
        } else {
          if (inputRef.current) inputRef.current.focus();
        }
        // handleOnClick();
      }
    };

    const handleShowAllSelected = (enabled: boolean) => {
      setExpandArrowClick(expandArrowClick + 1);
      if (enabled) {
        setShowAllSelected(true);
      } else {
        setShowAllSelected(false);
      }
    };

    const handleCollapseArrowClick = () => {
      setExpandArrowClick(expandArrowClick + 1);
      setShowAllSelected(false);
    };

    const tooltipContent =
      selectedItems?.length > itemCount
        ? selectedItems
            ?.slice(itemCount)
            .map((item) => item[desc])
            .join(', ')
        : '';

    const handleDropOpen = (e: any) => {
      setVisibleDrop();
    };

    const setVisibleDrop = () => {
      hasScrollbar = document.body.scrollHeight > window.innerHeight;
      if (!originalOverflow && !hasScrollbar) {
        originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      }

      setVisible(false);
      if (!dropOpen) setDropOpen(true);
      setFocusedIndex(0);

      setTimeout(() => {
        setVisible(true);

        if (!hasScrollbar) {
          document.body.style.overflow = originalOverflow || '';
        }
        originalOverflow = '';
      }, 200);
    };

    const handleDropClose = (e: any) => {
      if (dropOpen) setDropOpen(false);
    };

    const handleTabClick = (index: number) => {
      if (activeTab !== index) {
        if (clearTabSwitch) {
          handleClearSelected();
          if (tabInlineSearch) {
            setSearchValue('');
            setInputValue('');
            handlePickSuggestions('', 1);
          } else {
            resetSuggections?.();
            const activeTabVal =
              tab.length > 0 ? tab?.[activeTab].id : undefined;
            handlePickSuggestions(searchValue, 1, false, activeTabVal);
          }
        } else if (!tabInlineSearch) {
          resetSuggections?.();
          const activeTabVal = tab.length > 0 ? tab?.[activeTab].id : undefined;
          handlePickSuggestions(searchValue, 1, false, activeTabVal);
        }
        setActiveTab(index);
      }
    };

    const getSelectedRowLimit = () => {
      let maxHeight = 36;
      if (selItemRef?.current && selItemRef?.current.clientWidth < 300) {
        maxHeight = 24;
      }

      return selectedRowLimit * maxHeight + 5;
    };
    const getSelectedItems = (dropdown: boolean) => {
      return (
        <div
          ref={selItemRef}
          className="selected-items-outer-container"
          style={{ maxHeight: `${getSelectedRowLimit()}px` }}
        >
          {selectedItems
            .slice(
              0,
              selectedItems?.length > itemCount
                ? showAllSelected
                  ? selectedItems?.length
                  : itemCount
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
                    {!viewMode && (
                      <button
                        onClick={() => handleRemoveSelectedItem(index)}
                        className="remove-item-btn"
                        aria-label={`Remove ${item?.[desc]}`}
                      >
                        X
                      </button>
                    )}
                  </div>
                </Tooltip>
              </div>
            ))}
          {selectedItems?.length > itemCount && !showAllSelected && (
            <div className="selected-items-container">
              <Tooltip title={tooltipContent} enabled={true}>
                <div
                  className={`selected-item-more qbs-rounded-full qbs-min-h-6 qbs-min-w-6 qbs-p-1 ${
                    dropdown ? 'qbs-cursor-pointer' : ''
                  }`}
                  onClick={() => {
                    handleShowAllSelected(dropdown);
                  }}
                >
                  +{selectedItems?.length - itemCount}{' '}
                  <span className="qbs-hidden">more</span>
                </div>
              </Tooltip>
            </div>
          )}
        </div>
      );
    };

    const getTabItems = () => {
      return (
        <ul
          className="qbs-flex qbs-flex-wrap qbs-w-full qbs-tab qbs-mb-2 -qbs-mt-2"
          ref={tabRef}
        >
          {tab.map((item: TabPops, idx: number) => (
            <li className="qbs-flex-1 qbs-tab-items" key={`tab-${idx}`}>
              <span
                className={`qbs-inline-block qbs-tab-item qbs-text-sm qbs-cursor-pointer qbs-w-full qbs-text-center qbs-p-1 qbs-border-b-2 ${
                  activeTab === idx ? 'qbs-tab-active-item' : ''
                }`}
                onClick={() => {
                  handleTabClick(idx);
                }}
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      );
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
          setAllDataLoaded(true);
        } else if (!refetchData && inputValue !== '') {
          handlePickSuggestions(inputValue, 1);
          setRefetchData(true);
          setAllDataLoaded(false);
        }
      }
    };

    useEffect(() => {
      const allSelected =
        filteredData?.length > 0 && selectedItems?.length > 0 &&
        filteredData.every((item) =>
          selectedItems?.some(
            (s) =>
              getKeyValue(s, descId, 'id') === getKeyValue(item, descId, 'id')
          )
        );

      setSelectAll(allSelected);
    }, [filteredData, selectedItems, descId]);

    useEffect(() => {
      handleUpdateParent?.(dropOpen, dropLevelRef.current);
    }, [dropOpen, dropLevelRef.current]);
    return (
      <div
        id={id ? `selected-list-${id}` : `selected-list-${name}`}
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
          className={`qbs-relative  qbs-autocomplete-selected-comp ${
            expandable ? 'qbs-expandable-container' : 'qbs-container'
          }`}
        >
          {(selectedItems?.length > 0 || !tabInlineSearch) && (
            <>
              {!countOnly ? (
                getSelectedItems(false)
              ) : !tabInlineSearch ? (
                <div className="selected-items-counter-container qbs-text-sm qbs-gap-1">
                  <span className="badge qbs-rounded-full qbs-text-xs qbs-inline-flex qbs-items-center qbs-justify-center qbs-px-2 qbs-py-1 qbs-leading-none qbs-min-w-6 qbs-min-h-6">
                    {selectedItems?.length}
                  </span>
                </div>
              ) : (
                <div
                  className="selected-items-container qbs-text-sm qbs-gap-1"
                  onClick={() => onInputFocus()}
                >
                  <span
                    className={`badge qbs-rounded-full qbs-text-xs qbs-inline-flex qbs-items-center qbs-justify-center qbs-px-2 qbs-py-1 qbs-leading-none qbs-min-w-6 qbs-min-h-6 ${
                      selectedItems?.length > 99 ? 'qbs-text-hundred-plus' : ''
                    }`}
                  >
                    {selectedItems?.length > 99 ? '99+' : selectedItems?.length}
                  </span>
                  <span className="selected-label-text">
                    {selectedLabel && selectedLabel !== '' ? (
                      selectedLabel
                    ) : (
                      <>Item{selectedItems?.length > 1 && 's'} Selected</>
                    )}
                  </span>
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
                ? !tabInlineSearch && searchValue
                  ? searchValue
                  : placeholder ?? ''
                : placeholder ?? ''
            }
            onClick={() => onInputFocus()}
          >
            <input
              id={id}
              ref={inputRef}
              autoComplete="off"
              type="text"
              value={
                type === 'auto_suggestion' && !expandable && tabInlineSearch
                  ? inputValue
                  : searchValue || inputValue
              }
              onChange={handleChange}
              // onBlur={handleBlur}
              onFocus={onFocus}
              onClick={() => handleOnClick()}
              className={generateClassName()}
              placeholder={
                selectedItems?.length > 0 || searchValue
                  ? !tabInlineSearch && searchValue
                    ? searchValue
                    : !tabInlineSearch
                    ? placeholder ?? ''
                    : ''
                  : placeholder ?? ''
              }
              readOnly={
                readOnly ||
                type === 'custom_select' ||
                (type === 'auto_suggestion' && !expandable && tabInlineSearch)
              }
              disabled={disabled}
              data-testid="custom-autocomplete"
            />
          </div>

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
            countOnly={countOnly}
            uniqueDropArrowId={uniqueDropArrowId}
            viewMode={viewMode}
          />
          {/* Displaying Loading Spinner */}

          {/* Suggestions Dropdown */}

          {dropOpen &&
            ReactDOM.createPortal(
              <div
                ref={dropRef}
                style={{
                  ...dropdownStyle,
                  minHeight: viewMode ? 100 : 192,
                  visibility: visible ? 'visible' : 'hidden',
                  opacity: visible ? 1 : 0,
                  transition: 'opacity 0.2s ease-in-out',
                }}
                className={`qbs-autocomplete-suggestions qbs-autocomplete-selected-suggestions ${
                  viewMode ? 'qbs-dropdown-selected-preview' : ''
                } ${viewMode && selectedItems?.length === 0 ? 'hidden' : ''}`}
              >
                {!viewMode && (
                  <>
                    <>{tab.length > 0 && getTabItems()}</>
                    {type === 'auto_suggestion' &&
                      !expandable &&
                      tabInlineSearch && (
                        <div
                          style={{ position: 'relative' }}
                          className="react-core-ts-search-container qbs-autocomplete-selected-suggestions-outer"
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
                            ref={inputSearchRef}
                          />

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
                                  type={!allDataLoaded ? 'down' : 'up'}
                                  uniqueId="all-dropdow-arrow-icon"
                                  className="all-dropdow-arrow-icon"
                                />
                              </button>
                            )}
                          </>
                        </div>
                      )}
                  </>
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

                <div
                  className={`qbs-autocomplete-suggestions-sub qbs-autocomplete-selected-suggestions-outer ${
                    viewMode ? 'hidden' : ''
                  }`}
                  ref={itemsRef}
                  style={{
                    maxHeight: `${selHeight}px`,
                    minHeight: `${selHeight}px`,
                  }}
                >
                  {filteredData?.length > 0 ? (
                    filteredData.map((suggestion: ValueProps, idx: number) => (
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
                        key={suggestion[descId]}
                        shortCode={shortCode}
                        labelCode={labelCode}
                        focusedIndex={focusedIndex}
                        setItemRef={(index, ref) => {
                          itemRefs.current[index] = ref; // Store each ref properly
                        }}
                      />
                    ))
                  ) : (
                    <>
                      {isLoading ||
                      (searchValue !== searchOldValue &&
                        searchValue !== '' &&
                        async) ? (
                        <div className="qbs-flex qbs-align-middle qbs-justify-center qbs-min-emp-h">
                          <div className="qbs-pt-16 qbs-autocomplete-loader">
                            <Spinner />
                          </div>
                        </div>
                      ) : (
                        <div className="qbs-autocomplete-notfound qbs-text-center qbs-justify-center qbs-align-middle qbs-min-emp-h">
                          {searchValue !== ''
                            ? notDataMessage ?? 'No Results Found'
                            : initialDataMessage ?? 'Type to search'}
                        </div>
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
                <>
                  {countOnly && selectedItems?.length > 0 && (
                    <>
                      <div
                        className={`qbs-expandable-container qbs-dropdown-selected-container`}
                        ref={dropdownSelectedRef}
                      >
                        <div className={`qbs-flex qbs-w-full qbs-text-xs`}>
                          <div className="qbs-selected-lbs qbs-flex-grow">
                            Selected Items
                          </div>
                          <div
                            className={`qbs-clear-link qbs-text-right qbs-cursor-pointer ${
                              viewMode ? 'hidden' : ''
                            }`}
                            onClick={handleClearSelected}
                          >
                            Clear all
                          </div>
                          <div
                            className={`qbs-done-link qbs-text-right qbs-cursor-pointer ${
                              viewMode ? 'hidden' : ''
                            }`}
                            onClick={() => {
                              setDropOpen(false);
                            }}
                          >
                            Done
                          </div>
                        </div>

                        {getSelectedItems(true)}

                        <>
                          {selectedItems?.length > itemCount &&
                            showAllSelected && (
                              <div className="qbs-readmore-collapse">
                                <div
                                  className="qbs-more-collapse"
                                  onClick={() => {
                                    handleCollapseArrowClick();
                                  }}
                                >
                                  <DropArrow
                                    className={`icon-button-rotate`}
                                    uniqueDropArrowId={uniqueDropArrowId}
                                  />
                                </div>
                              </div>
                            )}
                        </>
                      </div>
                    </>
                  )}
                </>
              </div>,
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

export default React.memo(AutoCompleteWithSelectedList);
