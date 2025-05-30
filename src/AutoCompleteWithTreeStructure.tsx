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
import TreeNode from './components/TreeNode';
import { useSuggestions } from './utilities/autosuggestions';
import { buildTree } from './utilities/convertFlatArraytoTreeStructure';
import { deepEqual } from './utilities/deepEqual';
import { default as Tooltip } from './utilities/expandableTootltip';
import { Search, Spinner } from './utilities/icons';
import useDynamicHeight from './utilities/useDynamicHeight';

type ValueProps = {
  [key: string]: string;
};
const AutoCompleteWithTreeStructure = forwardRef<
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
      isTreeDropdown = true,
      flatArray = false,
      parentField = 'parentId',
      errorFlag,
      handleUpdateParent,
      isSeachable = true,
      customDropOffset = 300,
      showIcon,
      handleShowIcon,
      hasDisableSelection,
      inputType = 'text',
      onFocusTreeDropdown,
      filterCondition,
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
    const [dropDownData, setDropDownData] = useState<ValueProps[]>(data);
    const inputRef = useRef(null);
    const dropRef = useRef(null);
    const dropLevelRef = useRef<string>('bottom');
    useEffect(() => {
      if (data) {
        if (flatArray) {
          setDropDownData(buildTree(data, descId, parentField));
        } else {
          setDropDownData(data);
        }
      }
    }, [data, dropOpen]);
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

        const dropdownHeight = 275; // Assume a fixed height or calculate based on content
        if (spaceBelow >= dropdownHeight) {
          dropdownPosition.top =
            inputRect.top + window.scrollY + inputRect.height;
          dropLevelRef.current = 'bottom';
        } else {
          dropdownPosition.top =
            inputRect.top + window.scrollY - dropdownHeight + 73;
          dropLevelRef.current = 'top';
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
    }, [dropOpen, selectedItems]);

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

    const isSelected = (
      item: ValueProps,
      selectedItems: ValueProps[] | string
    ): boolean => {
      if (Array.isArray(selectedItems)) {
        return selectedItems.some(
          (selectedItem) =>
            selectedItem[desc] === item[desc] ||
            selectedItem[descId] === item[descId]
        );
      } else {
        return item[desc] === selectedItems;
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
      // handleChangeWithDebounce(value);
      if (!value) {
        setInputValue('');
        // onChange({ [descId]: '', [desc]: '' });
      }
    };
    const handleSuggestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setDropOpen(true);
      setSearchValue(value);
      searchPortsFlat(value);
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
    useEffect(() => {
      handleUpdateParent?.(dropOpen, dropLevelRef.current);
    }, [dropOpen, dropLevelRef.current]);
    const generateClassName = useCallback(() => {
      return `qbs-textfield-default ${className} ${
        errors && errors?.message ? 'textfield-error' : 'tree-textfield'
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
          event.target?.id !== 'drop-arrow-tree-list-icon'
        ) {
          setTimeout(() => {
            setDropOpen(false);
            setSearchValue('');
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
    };

    const handleDropClose = (e: any) => {
      if (dropOpen) setDropOpen(false);
    };
    const toggleExpand = (id: string) => {
      const newTreeData = updateTreeNode(dropDownData, id, (node) => {
        node.expanded = !node.expanded;
      });
      setDropDownData(newTreeData);
    };

    const handleNodeExpandCheck = (node: any): boolean => {
      const handleCheck = (node: any): boolean => {
        if (node.children && node.children.length > 0) {
          return node.children.some(
            (child: any) =>
              isSelected(child, isMultiple ? selectedItems : inputValue) ||
              handleCheck(child)
          );
        }
        return false;
      };
      return handleCheck(node);
    };

    const treeData = () => {
      const processNode = (node: any) => ({
        ...node,
        expanded: handleNodeExpandCheck(node),
        children: node.children ? node.children.map(processNode) : [],
      });

      return dropDownData.map(processNode);
    };
    useEffect(() => {
      setDropDownData(treeData());
    }, [dropOpen]);

    const clearAllNodes = (nodes: any[]): any[] => {
      return nodes.map((node) => ({
        ...node,
        checked: false,
        children: node.children ? clearAllNodes(node.children) : undefined,
      }));
    };
    // Function to handle checkbox change (single or multi-select)
    const updateNode = (id: string, checked: boolean, dataItem: any) => {
      let newTreeData;
      let checkedNodes: any[] = []; // Array to store the entire checked node objects
      if (isMultiple) {
        let selectedData = [...selectedItems];
        if (checked) {
          selectedData.push(dataItem);
        } else {
          selectedData = selectedData.filter(
            (selectedItem) => selectedItem[descId] !== dataItem[descId]
          );
        }
        setSelectedItems(selectedData);
        onChange(selectedData);
      } else {
        if (!checked) {
          setInputValue('');
          onChange({ id: '', name: '' });
        }
        // Single-select logic: uncheck all other nodes and check only the clicked one
        newTreeData = dropDownData.map((node) =>
          updateAllNodes(node, id, checked)
        );
      }
    };
    const handleSelect = (selctedNode: any) => {
      setInputValue(selctedNode[desc]);
      onChange(selctedNode);
      setDropOpen(false);

      // if (!checked) {
      //   setInputValue('');
      //   onChange({ id: '', name: '' });
      // }
      // TreeData = dropDownData.map((node) =>
      //   updateAllNodes(node, selctedNode[descId], checked)
      // );
      // setDropDownData(TreeData);
    };

    const getCheckedNodes = (node: any, checkedNodes: any[]) => {
      if (node.checked) {
        checkedNodes.push(node); // Push the entire node object
      }
      if (node.children && node.children.length > 0) {
        node.children.forEach((child: any) =>
          getCheckedNodes(child, checkedNodes)
        );
      }
    };

    // Recursive function to update a specific node by ID
    const updateTreeNode = (
      nodes: any[],
      id: string,
      updateFn: (node: any) => void
    ): any[] => {
      return nodes.map((node) => {
        if (node[descId] === id) {
          updateFn(node);
        }

        if (node.children) {
          node.children = updateTreeNode(node.children, id, updateFn);
        }

        return node;
      });
    };

    // Recursive function to uncheck all other nodes in single-select mode
    const updateAllNodes = (node: any, id: string, checked: boolean): any => {
      // Reset all checked states to false, except for the selected node
      node.checked = node[descId] === id ? checked : false;
      if (node.checked) {
        setInputValue(node[desc]);
        onChange(node);
        setDropOpen(false);
      }
      if (node.children) {
        node.children = node.children.map((child: any) =>
          updateAllNodes(child, id, checked)
        );
      }

      return node;
    };

    const renderTree = (node: any, index: number) => {
      return (
        <div className="qbs-tree-list-container-child">
          <TreeNode
            key={node[descId]}
            node={node}
            // handleMultiSelect={handleMultiSelect}
            selected={selected}
            isSelected={isSelected}
            isMultiple={isMultiple}
            singleSelect={singleSelect}
            handleSelect={handleSelect}
            showIcon={handleShowIcon?.(node) ?? showIcon}
            hasDisableSelection={hasDisableSelection?.(node)}
            idx={node[descId]}
            updateNode={updateNode}
            desc={desc}
            descId={descId}
            toggleExpand={toggleExpand}
          >
            {node.expanded &&
              node.children?.map((childNode: any, index: number) =>
                renderTree(childNode, index)
              )}
          </TreeNode>
        </div>
      );
    };
    const [filteredData, setFilteredData] = useState([]);

    const searchPortsFlat = (query: string) => {
      const lowerQuery = query.toLowerCase();
      const result: any[] = [];

      const searchRecursive = (port: any) => {
        if (port[desc]?.toLowerCase().includes(lowerQuery)) {
          const filteredItem = {
            ...port,
            [descId]: port[descId],
            [desc]: port[desc],
            parentId: port.parentId,
            ...(filterCondition?.filterKey && {
              [filterCondition.filterKey]: port[filterCondition.filterKey],
            }),
          };
          result.push(filteredItem);
        }
        port.children?.forEach(searchRecursive);
      };

      dropDownData?.forEach(searchRecursive);

      setFilteredData(
        filterCondition?.filterKey && filterCondition?.filterValue
          ? result.filter(
              (item) =>
                item[filterCondition.filterKey] === filterCondition.filterValue
            )
          : result
      );
    };

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
    useDynamicHeight(
      '.qbs-autocomplete-suggestions-sub',
      customDropOffset ?? 200,
      dropOpen
    );
    return (
      <div
        id={id ? `tree-container-${id}` : `tree-container-${name}`}
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
            expandable ? 'qbs-expandable-container !pt-[10px]' : 'qbs-container'
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
                          type="button"
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
            style={{ width: inputType === 'text' ? '100%' : 'auto' }}
            data-value={
              selectedItems?.length > 0 || searchValue
                ? searchValue
                : placeholder ?? ''
            }
            onClick={() => onInputFocus()}
          >
            {inputType === 'text' ? (
              <input
                ref={inputRef}
                type="text"
                autoComplete="off"
                value={
                  type === 'auto_suggestion' && !expandable
                    ? inputValue
                    : inputValue
                }
                id={id ? `input-tree-${id}` : `input-tree-${name}`}
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
            ) : (
              <textarea
                id={id}
                ref={inputRef}
                value={inputValue}
                // onChange={handleChange}
                onFocus={onFocusTreeDropdown}
                onClick={() => handleOnClick()}
                className={`${generateClassName()} resize-none overflow-y-auto`}
                placeholder={selectedItems?.length > 0 ? '' : placeholder ?? ''}
                readOnly={
                  readOnly ||
                  type === 'custom_select' ||
                  (type == 'auto_suggestion' && !expandable)
                }
                disabled={disabled}
                data-testid="custom-autocomplete"
                rows={4} // Set initial rows to 4
                style={{
                  height: 'auto', // Allow it to expand
                  minHeight: '80px', // Approx. 4 lines of text
                  maxHeight: '160px', // Restrict max height to prevent large expansion
                  overflowY: 'auto', // Add scrollbar when exceeding 4 lines
                  wordWrap: 'break-word', // Ensure long words wrap correctly
                  whiteSpace: 'pre-wrap', // Preserve line breaks & spacing
                  paddingRight: '43px !important',
                }}
              />
            )}
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
            error={errorFlag}
            expandable={expandable}
            handleClear={handleClear}
            uniqueDropArrowId="drop-arrow-tree-list-icon"
          />
          {/* Displaying Loading Spinner */}

          {/* Suggestions Dropdown */}

          {dropOpen &&
            ReactDOM.createPortal(
              <ul
                ref={dropRef}
                style={{ ...dropdownStyle, minHeight: 192 }}
                className={`qbs-autocomplete-suggestions `}
              >
                {isSeachable && (
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
                      autoComplete="off"
                      value={searchValue}
                      placeholder="Type to search"
                    />
                  </div>
                )}

                <div
                  style={{
                    gap: isTreeDropdown ? '8px' : '0',
                    minHeight: isTreeDropdown ? '184px' : '0',
                  }}
                  className={`qbs-autocomplete-suggestions-sub padding-class `}
                >
                  {searchValue ? (
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
                        hideCheckbox={singleSelect}
                        key={suggestion[descId]}
                      />
                    ))
                  ) : dropDownData?.length > 0 ? (
                    dropDownData.map((suggestion: any, idx: number) => (
                      <TreeNode
                        key={suggestion[descId]}
                        node={suggestion}
                        isSelected={isSelected}
                        // handleMultiSelect={handleMultiSelect}
                        selected={selected}
                        isMultiple={isMultiple}
                        singleSelect={singleSelect}
                        idx={suggestion[descId]}
                        handleSelect={handleSelect}
                        showIcon={handleShowIcon?.(suggestion) ?? showIcon}
                        hasDisableSelection={hasDisableSelection?.(suggestion)}
                        updateNode={updateNode}
                        desc={desc}
                        descId={descId}
                        toggleExpand={toggleExpand}
                      >
                        {suggestion.expanded &&
                          suggestion.children?.map(
                            (childNode: any, index: number) =>
                              renderTree(childNode, index)
                          )}
                      </TreeNode>
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
                </div>
              </ul>,
              document.body
            )}
        </div>

        {/* Displaying Validation Error */}
        {/* {errors && (
          // 
          <div
            className="text-error text-error-label mt-[1px]"
            data-testid="autocomplete-error"
          >
            {handleerror(errors)}
          </div>
        )} */}
      </div>
    );
  }
);

export default React.memo(AutoCompleteWithTreeStructure);
