import React, { useState } from 'react';

const TreeNode: React.FC<any> = ({
  node,
  isSelected,
  handleMultiSelect,
  selected,
  isMultiple,
  singleSelect,
  idx,
  desc,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle the expanded state when clicking on the node
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <li>
      <div
        style={{ display: 'flex', cursor: 'pointer' }}
        className="items-start gap-4 flex-row"
        onClick={handleToggle}
      >
        {/* Show an icon based on the expanded/collapsed state */}
        {/* {node.children && ( */}
        <span>{isExpanded ? '▼' : '►'}</span>
        {/* )} */}
        {(isMultiple || singleSelect) && (
          <div className="qbs-autocomplete-checkbox">
            <input
              onChange={(e) => handleMultiSelect(e, node)}
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
        <span>{node[desc]}</span>
      </div>

      {/* Render children if the node is expanded */}
      {isExpanded && node.children && (
        <ul>
          {node.children.map((childNode: any) => (
            <TreeNode key={childNode.id} node={childNode} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default TreeNode;
