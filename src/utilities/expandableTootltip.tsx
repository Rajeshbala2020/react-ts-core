import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

const ExpandableToolTip: React.FC<any> = ({ title, children, enabled }) => {
  const [dropdownPosition, setDropdownPosition] = useState('bottom-position');
  const dropRef = useRef(null);
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const adjustDropdownPosition = (): string => {
    if (menuButtonRef.current) {
      const inputBoxRect = menuButtonRef.current?.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const spaceAbove = inputBoxRect.top;
      const spaceBelow = viewportHeight - inputBoxRect.bottom;
      if (spaceAbove > spaceBelow) {
        if (spaceAbove > 90 && spaceBelow < 120) {
          return 'top-position';
        } else {
          return 'bottom-position';
        }
      } else {
        const diff: number = spaceBelow - spaceAbove;
        if (spaceAbove > 90 && spaceBelow > 90 && diff < 90) {
          return 'top-position';
        } else {
          return 'bottom-position';
        }
      }
    }
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (menuButtonRef.current) {
      const dropPosition = adjustDropdownPosition();
      setDropdownPosition(dropPosition);
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      let top = rect.bottom + window.scrollY;
      let left = rect.left + window.scrollX;
      const height = rect.height;
      const width = dropRef?.current?.offsetWidth;
      if (dropPosition === 'bottom-position') {
        top = top + height / 2 - 5;
      } else {
        top = top - height * 2 + 15;
      }

      setTooltipStyle({
        top: top,
        left: left,
        width: width,
      });
      setVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  useLayoutEffect(() => {
    const updateTooltipPosition = () => {
      if (dropRef.current && visible && tooltipStyle) {
        const tooltipHeight = dropRef.current.offsetHeight;
        const tooltipWidth = dropRef.current.offsetWidth;
        const boxWidth = menuButtonRef.current.offsetWidth;
        setTooltipStyle((prevStyle) => ({
          ...prevStyle,
          left:
            prevStyle.left + boxWidth / 2 - tooltipWidth / 2 < 0
              ? 20
              : prevStyle.left + boxWidth / 2 - tooltipWidth / 2,
          width: tooltipWidth,
          top:
            dropdownPosition === 'bottom-position'
              ? prevStyle.top
              : prevStyle.top - tooltipHeight,
        }));
      }
    };

    if (visible) {
      updateTooltipPosition();
    }

    window.addEventListener('resize', updateTooltipPosition);

    return () => {
      window.removeEventListener('resize', updateTooltipPosition);
    };
  }, [visible, dropdownPosition]);

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
      onMouseLeave={handleMouseLeave}
      ref={menuButtonRef}
      style={{ display: 'flex' }}
      
    >
      {children}

      {visible &&
        enabled &&
        tooltipStyle &&
        ReactDOM.createPortal(
          <span
            ref={(node) => (dropRef.current = node)}
            className={`tooltiptext  ${
              dropdownPosition == 'bottom-position' ? 'down' : 'up'
            }`}
            style={{
              top: tooltipStyle.top,
              left: tooltipStyle.left,
              opacity: 1,
              width: tooltipStyle.width,
              minWidth: '60px',
              maxWidth: '200px',
              visibility: 'visible',
            }}
          >
            {title}
          </span>,
          document.body
        )}
    </div>
  );
};

export default ExpandableToolTip;
