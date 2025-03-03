import React from 'react';

import QuestionIcon from './customIcons/QuestionIcon';
import { DropSideIcon } from './Icons';

const TreeNode: React.FC<any> = ({
  node,
  isMultiple,
  singleSelect,
  idx,
  desc,
  toggleExpand,
  updateNode,
  children,
  descId,
  isSelected,
  selected,
  handleSelect,
  singleSelectIcon,
  showIcon,
  hasDisableSelection,
}) => {
  // Toggle the expanded state when clicking on the node
  const handleToggle = (node?: any) => {
    toggleExpand(node[descId]);
  };

  const handleCheckbox = (e: any, dataItem: any) => {
    const { checked } = e.target;
    updateNode(dataItem[descId], checked, dataItem);
  };

  return (
    <div>
      <li className="qbs-tree-list-container">
        <div
          className={`qbs-tree-list-container-sub ${
            node?.children?.length > 0 ? '' : 'no-children'
          } `}
        >
          {/* Show an icon based on the expanded/collapsed state */}

          {node?.children && node?.children?.length > 0 && (
            <span
              onClick={() => handleToggle(node)}
              className={`qbs-tree-list-container-sub-icon ${
                node.expanded ? 'expanded' : ''
              }`}
            >
              <DropSideIcon />
            </span>
          )}
          <div
            className={`${
              isMultiple || (singleSelect && !showIcon)
                ? 'qbs-tree-list-container-sub-container'
                : 'qbs-tree-list-container-sub-container-hideicon'
            } ${isSelected(node, selected) ? 'checked' : ''} ${
              node.expanded ? 'qbs-expanded-child' : ''
            } ${node?.children?.length > 0 ? '' : 'lightmarginLeft'}`}
          >
            {(isMultiple || (singleSelect && showIcon)) && (
              <div
                style={{ alignItems: singleSelect ? 'flex-start' : 'center' }}
                className={`${'qbs-autocomplete-checkbox'}`}
              >
                {!singleSelect ? (
                  <>
                    <input
                      onChange={(e) => handleCheckbox(e, node)} // Pass correct node to the handler
                      type="checkbox"
                      checked={isSelected(node, selected)}
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
                  </>
                ) : (
                  showIcon && (
                    <span className="qbs-tree-single-select-icon">
                      {singleSelectIcon ?? <QuestionIcon />}
                    </span>
                  )
                )}
              </div>
            )}
            {singleSelect ? (
              hasDisableSelection ? (
                <span
                  className={`${
                    node.expanded ? 'qbs-expanded-child' : ''
                  } qbs-tree-list-container-sub-text `}
                >
                  {node[desc]}
                </span>
              ) : (
                <span
                  onClick={() => handleSelect(node)}
                  className={`${
                    node.expanded ? 'qbs-expanded-child' : ''
                  } qbs-tree-list-container-sub-text cursor-pointer`}
                >
                  {node[desc]}
                </span>
              )
            ) : (
              <span
                className={`${
                  node.expanded ? 'qbs-expanded-child' : ''
                } qbs-tree-list-container-sub-text`}
              >
                {node[desc]}
              </span>
            )}
          </div>
        </div>
      </li>

      {children}
    </div>
  );
};

export default TreeNode;
