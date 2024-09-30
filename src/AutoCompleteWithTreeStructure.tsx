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
import InputActions from './components/InputActions';
import TreeNode from './components/TreeNode';
import { useSuggestions } from './utilities/autosuggestions';
import { buildTree } from './utilities/convertFlatArraytoTreeStructure';
import { debounce } from './utilities/debounce';
import { deepEqual } from './utilities/deepEqual';
import { default as Tooltip } from './utilities/expandableTootltip';
import { Search, Spinner } from './utilities/icons';

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

    useEffect(() => {
      if (data) {
        if (flatArray) {
          setDropDownData(buildTree(data, descId, parentField));
        } else {
          setDropDownData(data);
        }
      }
    }, [data]);
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
        } else {
          dropdownPosition.top =
            inputRect.top + window.scrollY - dropdownHeight + 73;
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

    // Adding debounce to avoid making API calls on every keystroke
    const handleChangeWithDebounce = debounce((value) => {
      if ((type === 'auto_complete' || type === 'auto_suggestion') && async) {
        handlePickSuggestions(value, 1);
      }
    }, 1000);

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
      const handleClickOutside = (event: any) => {
        if (
          dropRef.current &&
          event.target instanceof Node &&
          !dropRef.current.contains(event.target) &&
          event.target.nodeName !== 'svg'
        ) {
          setDropOpen(false);
          setSearchValue('');
        }
      };
      document.addEventListener('mousedown', handleClickOutside as any);
      window.addEventListener('scroll', handleClickOutside as any);

      const scrollableDivs = document.querySelectorAll(
        'div[style*="overflow"]'
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

    // Function to handle checkbox change (single or multi-select)
    const updateNode = (id: string, checked: boolean) => {
      let newTreeData;
      let checkedNodes: any[] = []; // Array to store the entire checked node objects

      if (isMultiple) {
        // Multi-select logic: update only the clicked node
        newTreeData = updateTreeNode(dropDownData, id, (node) => {
          node.checked = checked;

          // Update the checked nodes array
          if (checked) {
            checkedNodes.push(node); // Add the entire node if checked
          } else {
            // Remove the node from the array if unchecked
            checkedNodes = checkedNodes.filter(
              (checkedNode) => checkedNode[descId] !== node[descId]
            );
          }
        });

        // Find all checked nodes in the newTreeData (in case you need all checked nodes at any point)
        checkedNodes = [];
        newTreeData.forEach((node) => {
          getCheckedNodes(node, checkedNodes); // Recursively collect checked nodes
        });
        setSelectedItems(checkedNodes);
        onChange(checkedNodes);
      } else {
        // Single-select logic: uncheck all other nodes and check only the clicked one
        newTreeData = dropDownData.map((node) =>
          updateAllNodes(node, id, checked)
        );
      }
      setDropDownData(newTreeData);
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
        <div className=" ml-4 mt-4 flex flex-col gap-4">
          <TreeNode
            key={node[descId]}
            node={node}
            // handleMultiSelect={handleMultiSelect}
            selected={selected}
            isMultiple={isMultiple}
            singleSelect={singleSelect}
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
          />
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

                <div
                  className={`qbs-autocomplete-suggestions-sub ${
                    isTreeDropdown ? ' gap-4 min-h-[184px]' : ''
                  }`}
                >
                  {dropDownData?.length > 0 ? (
                    dropDownData.map((suggestion: any, idx: number) => (
                      <TreeNode
                        key={suggestion[descId]}
                        node={suggestion}
                        // isSelected={isSelected}
                        // handleMultiSelect={handleMultiSelect}
                        selected={selected}
                        isMultiple={isMultiple}
                        singleSelect={singleSelect}
                        idx={suggestion[descId]}
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

export default React.memo(AutoCompleteWithTreeStructure);
