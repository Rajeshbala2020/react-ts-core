import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

const ExpandableToolTip: React.FC<any> = ({ title, children, enabled }) => {
  const [dropdownPosition, setDropdownPosition] = useState('bottom-position');
  const dropRef = useRef(null);
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const [isTooltipMounted, setIsTooltipMounted] = useState(false);

  const [visible, setVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    if (isTooltipMounted) {
      setVisible(true);
    }
  };

  useEffect(() => {
    if (
      visible &&
      isTooltipMounted &&
      menuButtonRef.current &&
      dropRef.current
    ) {
      const inputBoxRect = menuButtonRef.current.getBoundingClientRect();
      const tooltipHeight = dropRef.current.offsetHeight;
      const tooltipWidth = dropRef.current.offsetWidth;
      const boxWidth = inputBoxRect.width;
      const viewportHeight = window.innerHeight;

      const spaceAbove = inputBoxRect.top;
      const spaceBelow = viewportHeight - inputBoxRect.bottom;

      let dropPosition: 'top-position' | 'bottom-position' = 'bottom-position';
      if (spaceBelow >= tooltipHeight + 20) {
        dropPosition = 'bottom-position';
      } else if (spaceAbove >= tooltipHeight + 20) {
        dropPosition = 'top-position';
      } else {
        dropPosition =
          spaceBelow > spaceAbove ? 'bottom-position' : 'top-position';
      }
      setDropdownPosition(dropPosition);

      let top =
        dropPosition === 'bottom-position'
          ? inputBoxRect.bottom + 8 + window.scrollY
          : inputBoxRect.top - tooltipHeight - 8 + window.scrollY;

      const left = inputBoxRect.left + boxWidth / 2 - 200 / 2 + window.scrollX;

      setTooltipStyle({
        top,
        left: Math.max(left, 8),
        width: 200,
      });

      // ✨ Recalculate again after a small delay
      setTimeout(() => {
        if (dropRef.current) {
          const correctedHeight = dropRef.current.offsetHeight;
          const correctedTop =
            dropPosition === 'bottom-position'
              ? inputBoxRect.bottom + 8 + window.scrollY
              : inputBoxRect.top - correctedHeight - 8 + window.scrollY;

          setTooltipStyle((prev) => ({
            ...prev,
            top: correctedTop,
          }));
        }
      }, 0);
    }
  }, [visible]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!menuButtonRef.current || !dropRef.current) return;

      const target = event.target as Node;
      const menuContains = menuButtonRef.current.contains(target);
      const tooltipContains = dropRef.current.contains(target);

      if (!menuContains && !tooltipContains) {
        if (!hideTimeoutRef.current) {
          hideTimeoutRef.current = setTimeout(() => {
            setVisible(false);
            hideTimeoutRef.current = null;
          }, 200); // small delay (200ms) to avoid flicker
        }
      } else {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
      }
    };

    if (visible) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, [visible]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(event.target as Node)) {
        setVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <div
      onMouseEnter={handleMouseEnter}
      ref={menuButtonRef}
      style={{ display: 'flex', pointerEvents: 'auto' }}
    >
      {children}

      {enabled &&
        tooltipStyle &&
        ReactDOM.createPortal(
          <div
            ref={(node) => {
              dropRef.current = node;
              if (node) {
                setIsTooltipMounted(true);
              }
            }}
            className={`tooltiptext custom_tooltip_style_class ${
              dropdownPosition == 'bottom-position' ? 'down' : 'up'
            }`}
            style={{
              top: tooltipStyle.top,
              left: tooltipStyle.left,
              opacity: visible ? 1 : 0,
              visibility: visible ? 'visible' : 'hidden',
              width: tooltipStyle.width,
              minWidth: '60px',
              maxWidth: '200px',
              pointerEvents: 'auto',
              maxHeight: '210px',
            }}
          >
            <div
              className=""
              style={{
                maxHeight: '200px',
                overflowY: 'auto', // ✅ Scroll only inside content
                overflowX: 'hidden',
                padding: '4px',
              }}
            >
              {title}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default ExpandableToolTip;
