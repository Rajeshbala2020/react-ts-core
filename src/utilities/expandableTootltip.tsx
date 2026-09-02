import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { getPortalTooltipCoords } from './getPosition';

const ExpandableToolTip: React.FC<any> = ({ title, children, enabled }) => {
  const [dropdownPosition, setDropdownPosition] = useState('bottom-position');
  const dropRef = useRef<HTMLSpanElement | null>(null);
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({
    top: 0,
    left: 0,
    arrowOffset: 50,
  });

  const handleMouseEnter = () => {
    setVisible(true);
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  const updatePosition = useCallback(() => {
    if (!menuButtonRef.current || !dropRef.current) return;

    const coords = getPortalTooltipCoords(
      menuButtonRef.current,
      dropRef.current
    );
    setDropdownPosition(coords.placement);
    setTooltipStyle((prev) => {
      if (
        prev.top === coords.top &&
        prev.left === coords.left &&
        prev.arrowOffset === coords.arrowOffset
      ) {
        return prev;
      }
      return {
        top: coords.top,
        left: coords.left,
        arrowOffset: coords.arrowOffset,
      };
    });
  }, []);

  useLayoutEffect(() => {
    if (!visible) return;

    updatePosition();
    const frame = window.requestAnimationFrame(updatePosition);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [visible, updatePosition]);

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
            ref={(node) => {
              dropRef.current = node;
            }}
            className={`tooltiptext custom_tooltip_style_class  ${
              dropdownPosition == 'bottom-position' ? 'down' : 'up'
            }`}
            style={
              {
                top: tooltipStyle.top,
                left: tooltipStyle.left,
                opacity: 1,
                minWidth: '60px',
                maxWidth: '200px',
                visibility: 'visible',
                '--tooltip-arrow-left': `${tooltipStyle.arrowOffset}px`,
              } as React.CSSProperties
            }
          >
            <span className="tooltip-text-container">{title}</span>
          </span>,
          document.body
        )}
    </div>
  );
};

export default ExpandableToolTip;
