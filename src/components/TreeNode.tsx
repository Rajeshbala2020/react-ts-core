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
}) => {
  // Toggle the expanded state when clicking on the node
  const handleToggle = (node?: any) => {
    console.log(node, 'node');
    toggleExpand(node[descId]);
  };

  const handleCheckbox = (e: any, dataItem: any) => {
    const { checked } = e.target;
    updateNode(dataItem[descId], checked);
  };
  return (
    <div>
      <li className=" qbs-flex qbs-flex-col">
        <div
          style={{ display: 'flex' }}
          className={`qbs-items-start qbs-gap-4 qbs-flex-row ${
            node?.children?.length > 0 ? '' : 'ml-5'
          }`}
        >
          {/* Show an icon based on the expanded/collapsed state */}

          {node?.children && node?.children?.length > 0 && (
            <span
              onClick={() => handleToggle(node)}
              className={`qbs-mt-1 qbs-cursor-pointer ${
                node.expanded ? ' qbs-rotate-90' : ''
              }`}
            >
              <DropSideIcon />
            </span>
          )}
          {(isMultiple || singleSelect) && (
            <div className="qbs-autocomplete-checkbox">
              <input
                onChange={(e) => handleCheckbox(e, node)} // Pass correct node to the handler
                type="checkbox"
                checked={node.checked}
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
          <span className=" qbs-leading-[18px]">{node[desc]}</span>
        </div>
      </li>

      {children}
    </div>
  );
};

export default TreeNode;
