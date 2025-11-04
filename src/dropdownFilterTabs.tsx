import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom';

import { AutoSuggestionInputProps, TabPops, ValueProps } from './commontypes';
import DropdownList from './components/DropdownList';
import { useSuggestions } from './utilities/autosuggestions';
import { debounce } from './utilities/debounce';
import { deepEqual } from './utilities/deepEqual';
import { filterSuggestions } from './utilities/filterSuggestions';
import { AllDropArrow, DropArrow, Search, Spinner } from './utilities/icons';
import { default as Tooltip } from './utilities/NewTooltip';
import { getKeyValue, safeToLowerString } from './utilities/getKeyValue';

const DropdownFilterTabs = forwardRef<
  HTMLInputElement,
  AutoSuggestionInputProps & {
    dropdownRef?: React.RefObject<HTMLDivElement>;
    open?: boolean;
    applyTabFilter?: () => void;
    onToolClose?: () => void;

  }
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
      searchValue: propsSearchValue = '',
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
      onSearchValueChange,
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
      dropdownRef,
      open = false,
      applyTabFilter,
      onToolClose
    },
    ref
  ) => {
    const selItemRef = useRef<HTMLDivElement>(null);
    const itemsRef = useRef<HTMLDivElement>(null);
    const dropdownSelectedRef = useRef<HTMLDivElement>(null);
    const tabRef = useRef<HTMLUListElement>(null);
    const dropLevelRef = useRef<string>('bottom');
    // State Hooks Section
    const [isInitialRender, setIsInitialRender] = useState(true);
    const [inputValue, setInputValue] = useState<string>(value);
    const [searchValue, setSearchValue] = useState<string>(propsSearchValue);
    const [searchOldValue, setSearchOldValue] = useState<string>('');
    const [nextPage, setNextPage] = useState<number | undefined>(1);
    const [dropOpen, setDropOpen] = useState<boolean>(open);
    const [selectedItems, setSelectedItems] = useState<ValueProps[]>([]);
    const [showAllSelected, setShowAllSelected] = useState<boolean>(false);
    const [selHeight, setSelHeight] = useState<number>(184);
    const [expandArrowClick, setExpandArrowClick] = useState<
      number | undefined
    >(1);
    const [visible, setVisible] = useState<boolean>(true);
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
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    // Filter selected items based on current active tab
    const currentTabId = tab.length > 0 ? tab[activeTab].id : undefined;
    const filteredSelectedItems = useMemo(() => {
      return selectedItems.filter(item => item.tabId === currentTabId);
    }, [selectedItems, currentTabId]);


    useEffect(() => {
      setDropOpen(open);
    }, [open]);

    const adjustDropdownPosition = () => {
      if (dropdownRef?.current) {
        const inputRect = dropdownRef?.current?.getBoundingClientRect();
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
              // Include tab ID when adding suggestion
              const suggestionWithTabId = {
                ...suggestion,
                tabId: tab.length > 0 ? tab[activeTab].id : undefined
              };
              return [...prev, suggestionWithTabId];
            }
          });
        } else {
          setFocusedIndex(idx);
          setInputValue(String(suggestion[desc]));
          setSearchValue('');
          onChange(suggestion);
          setDropOpen(false);
        }
      },
      [activeTab, tab, descId, desc, onChange, isMultiple]
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
          // Include tab ID when adding suggestion
          const suggestionWithTabId = {
            ...suggestion,
            tabId: tab.length > 0 ? tab[activeTab].id : undefined
          };
          setSelectedItems((prev) => [...prev, suggestionWithTabId]);
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
          setInputValue(String(suggestion[desc]));
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

    const handleSuggestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      //setVisibleDrop();
      const trimStart = value.trimStart();
      setSearchValue(trimStart);
      handleChangeWithDebounce(trimStart);
      setAllDataLoaded(false);
    };


    const handleClearSelected = () => {
      // Only clear items from current tab
      setSelectedItems((prev) => {
        const remainingItems = prev.filter(item => item.tabId !== currentTabId);
        return remainingItems;
      });
      setShowAllSelected(false);
      if (searchValue && type === 'auto_suggestion' && tabInlineSearch) {
        setSearchValue('');
      }
      if (async && type === 'auto_suggestion' && tabInlineSearch) resetSuggections?.();
    };

    const handleRemoveSelectedItem = useCallback((index: number) => {
      const itemToRemove = filteredSelectedItems[index];
      setSelectedItems((prev) => {
        return prev.filter((item) => 
          getKeyValue(item, descId, 'id') !== getKeyValue(itemToRemove, descId, 'id')
        );
      });
    }, [filteredSelectedItems, descId]);

    const uniqueDropArrowId = `${name}-drop-arrow-selected-list-icon`;
    const isKeyboardOpenRef = useRef(false);

    // Keep ref in sync with state for use in event handlers
    useEffect(() => {
      isKeyboardOpenRef.current = isKeyboardOpen;
    }, [isKeyboardOpen]);

    // Detect keyboard open on mobile using Visual Viewport API
    useEffect(() => {
      const vv = (window as any).visualViewport;
      if (!vv) return;
      const onResize = () => {
        // Heuristic: if visual viewport height shrinks a lot, keyboard is likely open
        const open = vv.height < window.innerHeight - 100;
        setIsKeyboardOpen(open);
      };
      vv.addEventListener("resize", onResize);
      vv.addEventListener("scroll", onResize); // iOS sometimes fires scroll instead
      onResize();
      return () => {
        vv.removeEventListener("resize", onResize);
        vv.removeEventListener("scroll", onResize);
      };
    }, []);

    useEffect(() => {
      const handleScroll = (event: any) => {
        // On mobile: Don't close dropdown on scroll when keyboard is open
        // On desktop: Always allow closing on scroll
        if (isKeyboardOpenRef.current) {
          // Only prevent closing if keyboard is actually open (mobile scenario)
          // Also check if input is focused to avoid closing while typing
          const activeElement = document.activeElement;
          if (activeElement && (
            activeElement === inputRef.current ||
            activeElement === inputSearchRef.current ||
            (dropRef.current && dropRef.current.contains(activeElement))
          )) {
            return;
          }
        }

        // Check if scroll is happening within the dropdown itself - if so, don't close
        const scrollTarget = event.target;
        if (dropRef.current && scrollTarget instanceof Node && dropRef.current.contains(scrollTarget)) {
          return;
        }

        // On desktop (keyboard not open), close on scroll
        if (dropRef.current && dropOpen) {
          setTimeout(() => {
            setDropOpen(false);
            onToolClose?.();
            if (!typeOnlyFetch) setSearchValue('');
          }, 200);
        }
      };

      const handleClickOutside = (event: any) => {
        const target = event.target as HTMLElement;

        // When keyboard is open, be more lenient - only close on clear outside clicks
        if (isKeyboardOpenRef.current) {
          // Only close if it's a clear click outside, not on input/textarea elements
          if (
            dropRef.current &&
            target instanceof Node &&
            !dropRef.current.contains(target) &&
            target?.id !== uniqueDropArrowId &&
            event.type === 'mousedown' &&
            target.closest &&
            !target.closest('input') &&
            !target.closest('textarea')
          ) {
            setTimeout(() => {
              setDropOpen(false);
              onToolClose?.();
              if (!typeOnlyFetch) setSearchValue('');
            }, 200);
          }
          return;
        }

        // Normal behavior when keyboard is not open
        if (
          dropRef.current &&
          target instanceof Node &&
          !dropRef.current.contains(target) &&
          target?.id !== uniqueDropArrowId
        ) {
          setTimeout(() => {
            setDropOpen(false);
            onToolClose?.();
            if (!typeOnlyFetch) setSearchValue('');
          }, 200);
        }
      };

      document.addEventListener('mousedown', handleClickOutside as any);
      window.addEventListener('scroll', handleScroll as any);

      const scrollableDivs = document.querySelectorAll(
        'div[style*="overflow"], .overflow-auto, .overflow-y-auto, .overflow-x-auto'
      );
      scrollableDivs.forEach((div) =>
        div.addEventListener('scroll', handleScroll as any)
      );
      if (scrollRef && scrollRef.current && scrollRef.current !== null) {
        scrollRef.current.addEventListener('scroll', handleScroll as any);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside as any);
        window.removeEventListener('scroll', handleScroll as any);
        scrollableDivs.forEach((div) =>
          div.removeEventListener('scroll', handleScroll as any)
        );
        if (scrollRef && scrollRef.current && scrollRef.current !== null) {
          scrollRef.current.removeEventListener(
            'scroll',
            handleScroll as any
          );
        }
      };
    }, [dropOpen, typeOnlyFetch, uniqueDropArrowId, onToolClose]);

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

    const prevSelectedItemsRef = useRef<ValueProps[]>([]);
    
    useEffect(() => {
      if (isInitialRender) {
        setIsInitialRender(false);
      } else {
        // Only call onChange if selectedItems actually changed
        if (!deepEqual(selectedItems, prevSelectedItemsRef.current)) {
          onChange(selectedItems);
          prevSelectedItemsRef.current = selectedItems;
        }
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

    const handleShowAllSelected = useCallback((enabled: boolean) => {
      setExpandArrowClick(expandArrowClick + 1);
      if (enabled) {
        setShowAllSelected(true);
      } else {
        setShowAllSelected(false);
      }
    }, [expandArrowClick]);

    const handleCollapseArrowClick = useCallback(() => {
      setExpandArrowClick(expandArrowClick + 1);
      setShowAllSelected(false);
    }, [expandArrowClick]);

    const tooltipContent =
      filteredSelectedItems?.length > itemCount
        ? filteredSelectedItems
          ?.slice(itemCount)
          .map((item) => item[desc])
          .join(', ')
        : '';

    const handleTabClick = useCallback((index: number) => {
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
              tab.length > 0 ? tab?.[index].id : undefined;
            handlePickSuggestions(searchValue, 1, false, activeTabVal);
          }
          setAllDataLoaded(false);
        } else {
          resetSuggections?.();
          const activeTabVal = tab.length > 0 ? tab?.[index].id : undefined;
          handlePickSuggestions(searchValue, 1, false, activeTabVal);
        }
        setActiveTab(index);
      }
    }, [activeTab, clearTabSwitch, handleClearSelected, tabInlineSearch, tab, searchValue, handlePickSuggestions, resetSuggections]);

    const getSelectedRowLimit = useCallback(() => {
      let maxHeight = 36;
      if (selItemRef?.current && selItemRef?.current.clientWidth < 300) {
        maxHeight = 24;
      }

      return selectedRowLimit * maxHeight + 5;
    }, [selectedRowLimit]);
    const getSelectedItems = useCallback((dropdown: boolean) => {
      return (
        <div
          ref={selItemRef}
          className="selected-items-outer-container"
          style={{ maxHeight: `${getSelectedRowLimit()}px` }}
        >
          {filteredSelectedItems
            .slice(
              0,
              filteredSelectedItems?.length > itemCount
                ? showAllSelected
                  ? filteredSelectedItems?.length
                  : itemCount
                : filteredSelectedItems?.length
            )
            .map((item, index) => (
              <div key={index} className="selected-items-container">
                <Tooltip
                  title={item?.[desc]}
                  enabled={String(item?.[desc])?.length > textCount}
                >
                  <div key={item.id} className="selected-item">
                    {String(item?.[desc])?.length > textCount
                      ? `${String(item?.[desc]).substring(0, textCount)}...`
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
          {filteredSelectedItems?.length > itemCount && !showAllSelected && (
            <div className="selected-items-container">
              <Tooltip title={tooltipContent} enabled={true}>
                <div
                  className={`selected-item-more qbs-rounded-full qbs-min-h-6 qbs-min-w-6 qbs-p-1 ${dropdown ? 'qbs-cursor-pointer' : ''
                    }`}
                  onClick={() => {
                    handleShowAllSelected(dropdown);
                  }}
                >
                  +{filteredSelectedItems?.length - itemCount}{' '}
                  <span className="qbs-hidden">more</span>
                </div>
              </Tooltip>
            </div>
          )}
        </div>
      );
    }, [filteredSelectedItems, getSelectedRowLimit, itemCount, showAllSelected, desc, textCount, viewMode, handleRemoveSelectedItem, tooltipContent, handleShowAllSelected]);

    // Check if any items are selected under a specific tab
    const hasSelectedItemsInTab = useCallback((tabIndex: number) => {
      const tabId = tab.length > 0 ? tab[tabIndex].id : undefined;
      return selectedItems.some(item => item.tabId === tabId);
    }, [selectedItems, tab]);

    const getTabItems = useCallback(() => {
      return (
        <ul
          className="qbs-flex qbs-flex-wrap qbs-w-full qbs-tab qbs-mb-2 -qbs-mt-2"
          ref={tabRef}
        >
          {tab.map((item: TabPops, idx: number) => {
            const hasSelectedItems = hasSelectedItemsInTab(idx);
            return (
              <li 
                className={`qbs-flex-1 qbs-tab-items ${hasSelectedItems ? 'qbs-tab-has-selected-items' : ''}`} 
                key={`tab-${idx}`}
              >
                <span
                  className={`qbs-inline-block qbs-tab-item qbs-text-sm qbs-cursor-pointer qbs-w-full qbs-text-center qbs-p-1 qbs-border-b-2 ${activeTab === idx ? 'qbs-tab-active-item' : ''
                    }`}
                  onClick={() => {
                    handleTabClick(idx);
                  }}
                >
                  {item.label}
                </span>
              </li>
            );
          })}
        </ul>
      );
    }, [tab, hasSelectedItemsInTab, activeTab, handleTabClick]);

    const handleSelectAll = useCallback(() => {
      if (isMultiple) {
        if (selectAll) {
          // Remove only items from current tab
          setSelectedItems((prev) =>
            prev.filter(
              (item) =>
                item.tabId !== currentTabId || 
                !filteredData.some(
                  (f) =>
                    getKeyValue(f, descId, 'id') === getKeyValue(item, descId, 'id')
                )
            )
          );
        } else {
          // Add only items from current tab - batch all updates in single setState
          setSelectedItems((prev) => {
            const newItems: ValueProps[] = [];
            const currentTabId = tab.length > 0 ? tab[activeTab].id : undefined;
            
            filteredData.forEach((suggestion: ValueProps) => {
              const isAdded = prev.some(
                (item) =>
                  getKeyValue(item, descId, 'id') ===
                  getKeyValue(suggestion, descId, 'id')
              );
              if (!isAdded) {
                // Include tab ID when adding suggestion
                const suggestionWithTabId = {
                  ...suggestion,
                  tabId: currentTabId
                };
                newItems.push(suggestionWithTabId);
              }
            });
            
            return [...prev, ...newItems];
          });
        }
      }
    }, [isMultiple, selectAll, currentTabId, filteredData, descId, tab, activeTab]);

    const handleOpenDropdown = (e: any) => {
      if (!suggestions || suggestions?.length === 0 || refetchData) {
        if (autoDropdown && (inputValue === '' || inputValue.trim() === '')) {
          if (tabInlineSearch && tab.length > 0) {
            const activeTabVal =
              tab.length > 0 ? tab?.[activeTab].id : undefined;
            handlePickSuggestions('*', 1, false, activeTabVal);
          } else {
            handlePickSuggestions('*', 1);
          }
          setRefetchData(false);
          setAllDataLoaded(true);
        } else if (!refetchData && inputValue !== '') {
          if (tabInlineSearch && tab.length > 0) {
            const activeTabVal =
              tab.length > 0 ? tab?.[activeTab].id : undefined;
            handlePickSuggestions(inputValue, 1, false, activeTabVal);
          } else {
            handlePickSuggestions(inputValue, 1);
          }
          setRefetchData(true);
          setAllDataLoaded(false);
        }
      }
    };

    const handleApplySelected = () => {
      setDropOpen(false);
      applyTabFilter?.();
    };

    useEffect(() => {
      const allSelected =
        filteredData?.length > 0 && filteredSelectedItems?.length > 0 &&
        filteredData.every((item) =>
          filteredSelectedItems?.some(
            (s) =>
              getKeyValue(s, descId, 'id') === getKeyValue(item, descId, 'id')
          )
        );

      setSelectAll(allSelected);
    }, [filteredData, filteredSelectedItems, descId]);

    useEffect(() => {
      handleUpdateParent?.(dropOpen, dropLevelRef.current);
    }, [dropOpen, dropLevelRef.current]);

    // Auto-focus search input when dropdown opens with tabInlineSearch
    useEffect(() => {
      if (dropOpen && visible && tabInlineSearch && type === 'auto_suggestion' && !expandable) {
        // Small delay to ensure the dropdown is fully rendered
        setTimeout(() => {
          if (inputSearchRef.current) {
            inputSearchRef.current.focus();
          }
        }, 50);
      }
    }, [dropOpen, visible, tabInlineSearch, type, expandable]);

    return (
      <>
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
              className={`qbs-autocomplete-suggestions qbs-autocomplete-selected-suggestions ${viewMode ? 'qbs-dropdown-selected-preview' : ''
                } ${viewMode && filteredSelectedItems?.length === 0 ? 'hidden' : ''}`}
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
                className={`qbs-autocomplete-suggestions-sub qbs-autocomplete-selected-suggestions-outer ${viewMode ? 'hidden' : ''
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
                {countOnly && filteredSelectedItems?.length > 0 && (
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
                          className={`qbs-clear-link qbs-text-right qbs-cursor-pointer ${viewMode ? 'hidden' : ''
                            }`}
                          onClick={handleClearSelected}
                        >
                          Clear all
                        </div>
                        <div
                          className={`qbs-done-link qbs-text-right qbs-cursor-pointer ${viewMode ? 'hidden' : ''
                            }`}
                          onClick={() => {
                            handleApplySelected();
                          }}
                        >
                          Apply
                        </div>
                      </div>

                      {getSelectedItems(true)}

                      <>
                        {filteredSelectedItems?.length > itemCount &&
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
      </>

    );
  }
);

export default React.memo(DropdownFilterTabs);
