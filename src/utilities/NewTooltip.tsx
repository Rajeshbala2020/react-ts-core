import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { getPortalTooltipCoords } from './getPosition';

const ExpandableToolTip: React.FC<any> = ({ title, children, enabled }) => {
  const [dropdownPosition, setDropdownPosition] = useState('bottom-position');
  const dropRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const [isTooltipMounted, setIsTooltipMounted] = useState(false);

  const [visible, setVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({
    top: 0,
    left: 0,
    arrowOffset: 50,
  });
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    if (isTooltipMounted) {
      setVisible(true);
    }
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
    if (!visible || !isTooltipMounted) return;

    updatePosition();
    const frame = window.requestAnimationFrame(updatePosition);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [visible, isTooltipMounted, updatePosition]);

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
            style={
              {
                top: tooltipStyle.top,
                left: tooltipStyle.left,
                opacity: visible ? 1 : 0,
                visibility: visible ? 'visible' : 'hidden',
                minWidth: '60px',
                maxWidth: '200px',
                pointerEvents: 'auto',
                maxHeight: '210px',
                '--tooltip-arrow-left': `${tooltipStyle.arrowOffset}px`,
              } as React.CSSProperties
            }
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
