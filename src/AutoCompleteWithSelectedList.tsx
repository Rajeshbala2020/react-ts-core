import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom";

import { AutoSuggestionInputProps, TabPops, ValueProps } from "./commontypes";
import DropdownList from "./components/DropdownList";
import InputActions from "./components/InputActions";
import { useSuggestions } from "./utilities/autosuggestions";
import { debounce } from "./utilities/debounce";
import { deepEqual } from "./utilities/deepEqual";
import { default as Tooltip } from "./utilities/expandableTootltip";
import { filterSuggestions } from "./utilities/filterSuggestions";
import { DropArrow, Search, Spinner } from "./utilities/icons";

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
      type = "custom_select",
      selectedItems: propsSeelctedItems = [],
      readOnly = false,
      disabled = false,
      value,
      isMultiple = false,
      desc = "name",
      descId = "id",
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
      currentTab = 0
    },
    ref
  ) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const dropdownSelectedRef = useRef<HTMLDivElement>(null);
    const tabRef = useRef<HTMLUListElement>(null);
    // State Hooks Section
    const [isInitialRender, setIsInitialRender] = useState(true);

    const [inputValue, setInputValue] = useState<string>(value);
    const [searchValue, setSearchValue] = useState<string>("");
    const [searchOldValue, setSearchOldValue] = useState<string>("");
    const [nextPage, setNextPage] = useState<number | undefined>(1);
    const [dropOpen, setDropOpen] = useState<boolean>(false);
    const [selectedItems, setSelectedItems] = useState<ValueProps[]>([]);
    const [showAllSelected, setShowAllSelected] = useState<boolean>(false);
    const [expandArrowClick, setExpandArrowClick] = useState<
      number | undefined
    >(1);
    const [activeTab, setActiveTab] = useState<number>(currentTab);
    // API call for suggestions through a custom hook
    const inputRef = useRef(null);
    const dropRef = useRef(null);
    const inputSearchRef = useRef(null);
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

        let dropdownHeight = 300; // Assume a fixed height or calculate based on content
        if (countOnly) {
          if (dropdownSelectedRef?.current)
            dropdownHeight += dropdownSelectedRef?.current?.clientHeight;
        }

        if (tab.length > 0) {
          if (tabRef?.current) dropdownHeight += tabRef?.current?.clientHeight;
        }
        if (spaceBelow >= dropdownHeight) {
          dropdownPosition.top =
            inputRect.top + window.scrollY + inputRect.height;
        } else {
          dropdownPosition.top =
            inputRect.top + window.scrollY - dropdownHeight + 73 + topMargin;
        }

        setDropdownStyle({
          ...dropdownPosition,
        });
      }
    };

    useEffect(() => {
      window.addEventListener("resize", adjustDropdownPosition);
      adjustDropdownPosition();

      return () => {
        window.removeEventListener("resize", adjustDropdownPosition);
      };
    }, [dropOpen, selectedItems, expandArrowClick]);

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
    const handleSuggestionClick = useCallback((suggestion: ValueProps) => {
      if (isMultiple) {
        setSelectedItems((prev) => {
          const isAdded =
            prev && prev.length > 0
              ? prev.some((item) => item[descId] === suggestion[descId])
              : false;
          if (isAdded) {
            return prev.filter((item) => item[descId] !== suggestion[descId]);
          } else {
            return [...prev, suggestion];
          }
        });
      } else {
        setInputValue(suggestion[desc]);
        setSearchValue("");
        onChange(suggestion);
        setDropOpen(false);
      }
    }, []);

    // Adding debounce to avoid making API calls on every keystroke
    const debouncedUpdate = useCallback(
      debounce((value: string, tabVal?: number | string) => {
        setSearchOldValue(value);
        handlePickSuggestions(value, 1, false, tabVal);
      }, 500),
      []
    );

    const handleChangeWithDebounce = (value: string) => {
      if ((type === "auto_complete" || type === "auto_suggestion") && async) {
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
              (item, i) => item[descId] !== suggestion[descId]
            );
          });
        }
      } else {
        if (checked) {
          setInputValue(suggestion[desc]);
          onChange(suggestion);
        } else {
          setInputValue("");
        }
      }
    };
    useEffect(() => {
      if (!deepEqual(selectedItems, propsSeelctedItems))
        setSelectedItems(propsSeelctedItems);
    }, [propsSeelctedItems]);
    // Effect to set the input value whenever `value` prop changes
    useEffect(() => {
      setInputValue(value ?? "");
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setDropOpen(true);
      setSearchValue(value);
      handleChangeWithDebounce(value);
      if (!value) {
        setInputValue("");
        // onChange({ [descId]: '', [desc]: '' });
      }
    };
    const handleSuggestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setDropOpen(true);
      setSearchValue(value);
      handleChangeWithDebounce(value);
    };

    const handleClear = () => {
      if (searchValue) {
        setSearchValue("");
        setDropOpen(false);
      } else {
        setInputValue("");
        if (isMultiple) onChange([]);
        else onChange({ [descId]: "", [desc]: "" });
        setDropOpen(false);
      }
    };

    const handleClearSelected = () => {
      setSelectedItems([]);
      if (isMultiple) onChange([]);
      else onChange({ [descId]: "", [desc]: "" });
    };

    const generateClassName = useCallback(() => {
      return `qbs-textfield-default ${className} ${
        errors && errors?.message ? "textfield-error" : "textfield"
      } ${expandable ? "expandable" : ""}`;
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
          event.target.nodeName !== "svg"
        ) {
          setDropOpen(false);
          //setSearchValue("");
        }
      };
      document.addEventListener("mousedown", handleClickOutside as any);
      window.addEventListener("scroll", handleClickOutside as any);

      const scrollableDivs = document.querySelectorAll(
        'div[style*="overflow"]'
      );
      scrollableDivs.forEach((div) =>
        div.addEventListener("scroll", handleClickOutside as any)
      );
      if (scrollRef && scrollRef.current && scrollRef.current !== null) {
        scrollRef.current.addEventListener("scroll", handleClickOutside as any);
      }
      return () => {
        document.removeEventListener("mousedown", handleClickOutside as any);
        window.removeEventListener("scroll", handleClickOutside as any);
        scrollableDivs.forEach((div) =>
          div.removeEventListener("scroll", handleClickOutside as any)
        );
        if (scrollRef && scrollRef.current && scrollRef.current !== null) {
          scrollRef.current.removeEventListener(
            "scroll",
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
      true
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
      !disabled && !readOnly ? setDropOpen(true) : "";
    };
    const onInputFocus = () => {
      if (countOnly) {
        setTimeout(() => {
          if (inputSearchRef.current) inputSearchRef.current.focus();
        }, 10);
      } else {
        if (inputRef.current) inputRef.current.focus();
      }
      handleOnClick();
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
            .join(", ")
        : "";

    const handleDropOpen = (e: any) => {
      if (!dropOpen) setDropOpen(true);
    };

    const handleDropClose = (e: any) => {
      if (dropOpen) setDropOpen(false);
    };

    const handleTabClick = (index: number) => {
      if (activeTab !== index) {
        if (clearTabSwitch) {
          handleClearSelected();
          setSearchValue("");
          setInputValue("");
          handlePickSuggestions("", 1);
        }
        setActiveTab(index);
      }
    };

    const getSelectedRowLimit = () => {
      return selectedRowLimit * 33 + 5;
    };

    const getSelectedItems = (dropdown: boolean) => {
      return (
        <div
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
          {selectedItems?.length > itemCount && !showAllSelected && (
            <div className="selected-items-container">
              <Tooltip title={tooltipContent} enabled={true}>
                <div
                  className={`selected-item-more qbs-rounded-full qbs-min-h-6 qbs-min-w-6 qbs-p-1 ${
                    dropdown ? "qbs-cursor-pointer" : ""
                  }`}
                  onClick={() => {
                    handleShowAllSelected(dropdown);
                  }}
                >
                  +{selectedItems?.length - itemCount}{" "}
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
                  activeTab === idx ? "qbs-tab-active-item" : ""
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

    return (
      <div className={fullWidth ? "fullWidth" : "autoWidth"} ref={dropdownRef}>
        {label && (
          <div
            style={{
              marginBottom: 5,
              display: "flex",
              justifyContent: "space-between",
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
            expandable ? "qbs-expandable-container" : "qbs-container"
          }`}
        >
          {selectedItems?.length > 0 && (
            <>
              {!countOnly ? (
                getSelectedItems(false)
              ) : (
                <div
                  className="selected-items-container qbs-text-sm qbs-gap-1"
                  onClick={() => onInputFocus()}
                >
                  <span className="badge qbs-rounded-full qbs-text-xs qbs-inline-flex qbs-items-center qbs-justify-center qbs-px-2 qbs-py-1 qbs-leading-none qbs-min-w-6 qbs-min-h-6">
                    {selectedItems?.length}
                  </span>
                  Item{selectedItems?.length > 1 && "s"} Selected
                </div>
              )}
            </>
          )}

          <div
            className={`qbs-textfield-expandable ${
              !expandable ? "qbs-normal" : ""
            }`}
            data-value={
              selectedItems?.length > 0 || searchValue
                ? searchValue
                : placeholder ?? ""
            }
            onClick={() => onInputFocus()}
          >
            <input
              id={id}
              ref={inputRef}
              type="text"
              value={
                type === "auto_suggestion" && !expandable
                  ? inputValue
                  : searchValue || inputValue
              }
              onChange={handleChange}
              // onBlur={handleBlur}
              onFocus={onFocus}
              onClick={() => handleOnClick()}
              className={generateClassName()}
              placeholder={selectedItems?.length > 0 ? "" : placeholder ?? ""}
              readOnly={
                readOnly ||
                type === "custom_select" ||
                (type == "auto_suggestion" && !expandable)
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
          />
          {/* Displaying Loading Spinner */}

          {/* Suggestions Dropdown */}

          {dropOpen &&
            ReactDOM.createPortal(
              <div
                ref={dropRef}
                style={{ ...dropdownStyle, minHeight: 192 }}
                className={`qbs-autocomplete-suggestions qbs-autocomplete-selected-suggestions`}
              >
                <>{tab.length > 0 && getTabItems()}</>
                {type == "auto_suggestion" && !expandable && (
                  <div
                    style={{ position: "relative" }}
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
                      ref={inputSearchRef}
                    />
                  </div>
                )}

                <div className={`qbs-autocomplete-suggestions-sub `}>
                  {filteredData?.length > 0 ? (
                    filteredData.map((suggestion: ValueProps, idx: number) => (
                      <DropdownList
                        idx={idx}
                        suggestion={suggestion}
                        isSelected={isSelected}
                        handleSuggestionClick={handleSuggestionClick}
                        handleMultiSelect={handleMultiSelect}
                        selected={selected}
                        isMultiple={isMultiple}
                        singleSelect={singleSelect}
                        desc={desc}
                        key={suggestion[descId]}
                      />
                    ))
                  ) : (
                    <>
                      {isLoading ||
                      (searchValue !== searchOldValue &&
                        searchValue !== "" &&
                        async) ? (
                        <div className="qbs-flex qbs-align-middle qbs-justify-center qbs-min-emp-h">
                          <div className="qbs-pt-16">
                            <Spinner />
                          </div>
                        </div>
                      ) : (
                        <div className="qbs-autocomplete-notfound qbs-text-center qbs-justify-center qbs-align-middle qbs-min-emp-h">
                          {searchValue !== ""
                            ? notDataMessage ?? "No Results Found"
                            : initialDataMessage ?? "Type to search"}
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
                        <div className="qbs-flex qbs-w-full qbs-text-xs ">
                          <div className="qbs-selected-lbs qbs-flex-grow">
                            Selected Items
                          </div>
                          <div
                            className="qbs-clear-link qbs-text-right qbs-cursor-pointer"
                            onClick={handleClearSelected}
                          >
                            Clear all
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
                                  <DropArrow className={`icon-button-rotate`} />
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
