import React from 'react';

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
            className={`qbs-tree-list-container-sub-container ${
              isSelected(node, selected) ? 'checked' : ''
            } ${node?.children?.length > 0 ? '' : ' marginLeft'}`}
          >
            {(isMultiple || singleSelect) && (
              <div className="qbs-autocomplete-checkbox">
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
              </div>
            )}
            <span className="qbs-tree-list-container-sub-text">
              {node[desc]}
            </span>
          </div>
        </div>
      </li>

      {children}
    </div>
  );
};

export default TreeNode;
