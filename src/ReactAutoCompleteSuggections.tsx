// NOTE: This file was renamed from ReactAutoCompleteNameCount.tsx
// The implementation is unchanged; only the filename and exported component name differ.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FieldErrors } from 'react-hook-form';
import Spinner from './components/loader/Spinner';
import Portal from './components/portal';
import CustomIcons from './components/customIcons';
import { applyPositionClass } from './utilities/getPosition';

type SuggestionItem = {
  name: string;
  [key: string]: any;
};

type ModernAutoCompleteSuggectionsProps = {
  name: string;
  label?: string;
  id?: string;
  placeholder?: string;
  /** Controlled value for the input (optional). */
  value?: string;
  /** Called whenever the user types (only the raw text, no selection). */
  onChange?: (value: string) => void;
  /**
   * Optional static list of items. Each item should have at least `name`.
   */
  data?: SuggestionItem[];
  /**
   * Async/source function that returns items for a search text.
   */
  getData?: (key?: string) => Promise<SuggestionItem[]> | SuggestionItem[];
  /**
   * Field that holds an explicit count per item (fallback: duplicates count).
   * Similar to desc, this allows customizing which field contains the count.
   * e.g. "count", "total", "quantity".
   */
  countField?: string;
  /**
   * Whether the API provides count in the data. If true, uses countField value directly.
   * If false, groups items and counts duplicates.
   */
  countProvided?: boolean;
  /** Use modern label styling (floating label). */
  isModern?: boolean;
  /** Mark field as required. */
  required?: boolean;
  /** Input size. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xxs';
  /** Disable the input. */
  disabled?: boolean;
  /** Custom className. */
  className?: string;
  /** Render dropdown inside component container (false = use Portal). */
  insideOpen?: boolean;
  /** Form validation errors. */
  errors?: FieldErrors;
  /** Label title for error messages. */
  labelTitle?: string;
  /** Field name that contains the display text (default: 'name'). */
  desc?: string;
  /** Field name that contains the unique identifier (default: 'id'). */
  descId?: string;
  showWarningIcon?: boolean;
};

/**
 * Simple suggestion item:
 * - No tooltip
 * - No truncation
 * - Text wraps to next line when long
 */
const SuggestionItem: React.FC<{ name: string; count: number; showCount: boolean }> = ({
  name,
  count,
  showCount,
}) => {
  return (
    <div className="qbs-py-0.5 qbs-flex qbs-items-center qbs-justify-between qbs-gap-2 qbs-group qbs-relative">
      <span className="qbs-flex-1 qbs-whitespace-normal qbs-break-words qbs-suggection-label">
        {name}
      </span>
      {showCount && (
        <span className="qbs-ml-2 qbs-suggection-count qbs-flex qbs-items-center qbs-justify-center qbs-min-w-[20px] qbs-h-5 qbs-px-1.5 qbs-rounded-full qbs-bg-orange-500 qbs-text-white qbs-text-[10px] qbs-font-medium qbs-flex-shrink-0">
          {count}
        </span>
      )}
    </div>
  );
};

/**
 * Read‑only suggestion helper:
 * - User types freely in the input (no item click / selection)
 * - Below the field we show unique names
 * - If a name is duplicated, show: "Name (count)"
 */
const ModernAutoCompleteSuggections: React.FC<
  ModernAutoCompleteSuggectionsProps
> = ({
  name,
  label,
  id,
  placeholder,
  data,
  getData,
  value,
  onChange,
  countField = 'count',
  countProvided = false,
  isModern = true,
  required = false,
  size = 'md',
  disabled = false,
  className: propsClassName,
  insideOpen = false,
  errors,
  labelTitle,
  desc = 'name',
  descId = 'id',
  showWarningIcon = true,
}) => {
  const [inputValue, setInputValue] = useState(value ?? '');
  const [debouncedInputValue, setDebouncedInputValue] = useState('');
  const [items, setItems] = useState<SuggestionItem[]>(data ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [dropPosition, setDropPosition] = useState<any>({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  });
  const getDataRef = useRef(getData);
  const [hasTyped, setHasTyped] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const adorementRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownContentRef = useRef<HTMLDivElement | null>(null);
  const isExternalUpdateRef = useRef(false);
  const previousDebouncedValueRef = useRef<string>('');

  // keep latest getData in a ref so we don't re-trigger effects on every render
  useEffect(() => {
    getDataRef.current = getData;
  }, [getData]);

  useEffect(() => {
    if (value !== undefined) {
      const valueStr = String(value ?? '');
      const inputValueStr = String(inputValue ?? '');
      
      if (valueStr !== inputValueStr) {
        if (hasTyped) {
          
          const isExternalUpdate = !inputValueStr || 
                                   (!valueStr.startsWith(inputValueStr) && !inputValueStr.startsWith(valueStr));
          
          if (isExternalUpdate) {
            isExternalUpdateRef.current = true;
            setInputValue(valueStr);
            setDebouncedInputValue(valueStr);
            setHasTyped(false);
          }
        } else {
          // User hasn't typed yet, safe to sync from prop
          isExternalUpdateRef.current = true;
          setInputValue(valueStr);
          setDebouncedInputValue(valueStr);
        }
      }
    }
  }, [value]);

  // Sync external data prop
  useEffect(() => {
    if (data) {
      setItems(data);
    }
  }, [data]);

  // Debounce inputValue so we don't call API on every keystroke
  useEffect(() => {
    if (!hasTyped) return;
    const handle = window.setTimeout(() => {
      setDebouncedInputValue(inputValue);
    }, 500); // 500ms debounce

    return () => {
      window.clearTimeout(handle);
    };
  }, [inputValue, hasTyped]);

  // Load from getData only when user types some text (no initial preload),
  // and only after debounce delay.
  useEffect(() => {
    // Do not call API until the user has actually typed at least once
    if (!hasTyped) return;

    let cancelled = false;
    const query = debouncedInputValue.trim();
    // Only call API when there is a source function AND the user has typed at least 2 chars.
    // For shorter queries or no API, just fall back to local/static data.
    if (!getDataRef.current || query === '' || query.length < 2) {
      // Clear items when input is cleared or below threshold so dropdown also clears
      if (!cancelled) {
        setItems(data ?? []);
        setIsLoading(false);
      }
      return;
    }

    const run = async () => {
      setIsLoading(true);
      try {
        const res = await getDataRef.current?.(query);
        if (!cancelled && Array.isArray(res)) {
          setItems(res);
        }
      } catch (error) {
        // Optionally log error
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [debouncedInputValue, data]);

  // Notify parent via onChange when debounced value changes (only from user input)
  useEffect(() => {
    if (!hasTyped) return;
    if (!onChange) return;
    // Don't call onChange if the change came from external value prop update
    if (isExternalUpdateRef.current) {
      isExternalUpdateRef.current = false;
      previousDebouncedValueRef.current = debouncedInputValue;
      return;
    }
    
    const currentValue = debouncedInputValue.trim();
    const previousValue = previousDebouncedValueRef.current.trim();
    
    if (currentValue !== '' || previousValue !== '') {
      onChange(debouncedInputValue);
    }
    
    // Update previous value ref
    previousDebouncedValueRef.current = debouncedInputValue;
  }, [debouncedInputValue, onChange, hasTyped]);

  // Group by desc field and compute counts
  const grouped = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();

    items.forEach((item) => {
      const n = item?.[desc];
      if (!n) return;

      if (countProvided) {
        // API provides count - use it directly
        const apiCount = item?.[countField];
        const countValue = typeof apiCount === 'number' ? apiCount : typeof apiCount === 'string' ? Number(apiCount) : 0;
        
        const existing = map.get(n);
        if (existing) {
          // Sum counts for items with same name
          existing.count += countValue;
        } else {
          map.set(n, { name: n, count: countValue });
        }
      } else {
        // API doesn't provide count - group and count duplicates
        const existing = map.get(n);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(n, { name: n, count: 0 });
        }
      }
    });

    return Array.from(map.values());
  }, [items, countField, desc, countProvided]);

  const hasExactMatch = useMemo(() => {
    const term = inputValue.trim().toLowerCase();
    if (!term) return false;
    return grouped.some((g) => g.name.trim().toLowerCase() === term);
  }, [grouped, inputValue]);

  const showTick = useMemo(() => {
    return hasTyped && !isFocused && inputValue.trim() !== '' && !hasExactMatch;
  }, [hasTyped, isFocused, inputValue, hasExactMatch]);

  // Filter based on what user typed
  const visible = useMemo(() => {
    const term = inputValue.trim().toLowerCase();
    if (!term || !hasTyped) return [];
    return grouped.filter((g) => g.name.toLowerCase().includes(term));
  }, [grouped, inputValue, hasTyped]);

  const effectiveVisible = useMemo(() => {
    if (!hasTyped && items.length > 0) {
      return grouped;
    }
    return visible;
  }, [hasTyped, items.length, grouped, visible]);

  // Update dropdown visibility based on visible items from typing
  // Only auto-update when user has typed; otherwise let onFocus handle it
  useEffect(() => {
    if (hasTyped) {
      setShowDropdown(visible.length > 0);
    }
  }, [visible.length, hasTyped]);

  // Show dropdown when data loads and input is focused (prevents flicker)
  useEffect(() => {
    if (isFocused && !hasTyped && effectiveVisible.length > 0) {
      // Calculate position before showing dropdown to prevent flicker
      if (!insideOpen && inputRef?.current) {
        getDropPosition();
      }
      setShowDropdown(true);
    }
  }, [isFocused, hasTyped, effectiveVisible.length, insideOpen]);

  // Handle click outside to close dropdown
  const handleClickOutside = (event: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setShowDropdown(false);
    }
  };

  // Handle scroll to close dropdown (only for scrolls outside the component/dropdown)
  const handleScroll = (event: any) => {
    const scrollTarget = event.target as Node | null;

    if (
      scrollTarget &&
      ((containerRef.current &&
        containerRef.current.contains(scrollTarget)) ||
        (dropdownContentRef.current &&
          dropdownContentRef.current.contains(scrollTarget)))
    ) {
      // Ignore scrolls inside the autocomplete container or the dropdown content
      return;
    }

    setShowDropdown(false);
  };

  // Attach event listeners for click outside and scroll
  useEffect(() => {
    if (!showDropdown) {
      return;
    }

    document.addEventListener('click', handleClickOutside);

    const scrollableDivs = document.querySelectorAll(
      'div[style*="overflow"], .overflow-auto, .overflow-y-auto, .overflow-x-auto, .qbs-overflow-auto, .qbs-overflow-y-auto, .qbs-overflow-x-auto'
    );

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('scroll', handleScroll, true);

    scrollableDivs.forEach((div) => {
      div.addEventListener('scroll', handleScroll as any);
    });

    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll, true);

      scrollableDivs.forEach((div) => {
        div.removeEventListener('scroll', handleScroll as any);
      });
    };
  }, [showDropdown]);

  const checkIsEmptyField = (): boolean => {
    if (inputValue === undefined) return true;
    else return (inputValue?.toString().length ?? 0) <= 0 ? true : false;
  };

  const getHeight = () => {
    switch (size) {
      case 'sm':
        return ' h-[34px] ';
      default:
        return ' ';
    }
  };

  const getErrors = (err: any) => {
    let errMsg = '';
    if (err.message) {
      errMsg = err?.message;
    } else if (err?.id?.message) {
      errMsg = err?.id?.message;
    } else if (err?.name?.message) {
      errMsg = err?.name?.message;
    }
    return errMsg;
  };

  const handleError = (data: any) => {
    if (
      getErrors(data[name]) === 'required' ||
      getErrors(data[name]) === 'Required'
    ) {
      return `${label ?? labelTitle} is ${getErrors(data[name])}`;
    } else {
      return getErrors(data[name]) ?? '';
    }
  };

  const generateClassName = (
    type: 'input' | 'label' | 'message' | 'adorement' | 'warning'
  ): string => {
    let className = propsClassName || '';
    switch (type) {
      case 'input': className += ` qbs-block text-common qbs-text-input-text qbs-font-normal qbs-px-3.5 qbs-w-full qbs-text-sm qbs-text-gray-900 qbs-bg-transparent qbs-border qbs-appearance-none qbs-peer qbs-h-10 qbs-rounded-[4px] disabled:qbs-text-input-disabled qbs-bg-white disabled:qbs-bg-disabled ${ label && isModern ?'placeholder-transparent'
            : 'focus:placeholder-grey-secondary placeholder-input-label'
        } focus:placeholder-grey-secondary`;

        if (errors && errors[name]) {
          className +=
            ' qbs-input-error';
        } else {
          className +=
            ' qbs-text-grey-dark qbs-border-input-light focus:qbs-border-blue-navy focus:qbs-outline-none focus:qbs-ring-0';
        }

        className += ` ${getHeight()}`;

        break;
      case 'label': className += ` qbs-flex qbs-modern-input-label-truncate peer-focus:qbs-modern-input-peer-focus-label-size ${ disabled ?'cursor-pointer'
              : 'cursor-text peer-focus:cursor-pointer'
          } ${
          disabled && !checkIsEmptyField()
            ? 'disabled-input-label-bg'
            : !disabled || !checkIsEmptyField()
            ? 'active-input-label-bg'
            : ''
        } qbs-absolute qbs-duration-300 qbs-transform -qbs-translate-y-4 qbs-top-2 qbs-z-1 qbs-origin-[0] qbs-px-0 peer-placeholder-shown:-qbs-translate-y-1/2 peer-placeholder-shown:qbs-top-1/2 peer-focus:qbs-top-2 peer-focus:-qbs-translate-y-4 qbs-start-[14px] rtl:peer-focus:qbs-translate-x-1/4 rtl:peer-focus:qbs-left-auto ${
          disabled
            ? 'cursor-pointer'
            : 'cursor-text peer-focus:cursor-pointer'
        }
           ${
             checkIsEmptyField()
               ? 'modern-input-label-size'
               : 'modern-input-peer-focus-label-size'
           }`;
        if (errors && errors[name]) {
          className += ' qbs-text-error-light';
        } else {
          className += ' qbs-text-grey-dark peer-focus:qbs-text-blue-navy';
        }
        break;
      case 'message':
        className='qbs-text-error-icon';
        break;
      case 'warning':
          className='qbs-text-warning-icon';
          break;
      case 'adorement':
        className += ' qbs-absolute qbs-right-0 adorement qbs-gap-1 qbs-flex qbs-items-center';
        break;
      default:
        break;
    }
    return className;
  };

  const getInnerWidth = () => {
    const innerwidth = adorementRef.current
      ? adorementRef.current.offsetWidth
      : 0;
    return innerwidth;
  };

  const onLabelClick = () => {
    if (!disabled) {
      inputRef?.current?.focus();
    }
  };

  const getDropPosition = (): any => {
    if (!insideOpen && inputRef?.current) {
      const dropdownHeight = 200; // Assume the height of the dropdown is 200px, adjust as needed

      const inputRect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - inputRect.bottom;
      const spaceAbove = inputRect.top;

      let top: number | undefined;
      let bottom: number | undefined;
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        // Show above if not enough space below
        bottom = window.innerHeight - inputRect.top + 2;
      } else {
        // Show below (default)
        top = inputRect.bottom + 2;
      }
      setDropPosition({
        position: 'fixed',
        left: inputRect.left,
        top,
        bottom,
        width: inputRect.width,
      });
    }

    return undefined;
  };

  // Calculate dropdown position when it opens
  useEffect(() => {
    if (showDropdown && !insideOpen) {
      window.addEventListener('resize', getDropPosition);
      getDropPosition();
      return () => {
        window.removeEventListener('resize', getDropPosition);
      };
    }
  }, [showDropdown, insideOpen]);

  useEffect(() => {
    applyPositionClass(containerRef, isHovered);
    setShowDropdown(false); 
  }, [isHovered]);

  return (
    <div
      ref={containerRef}
      className={`qbs-flex qbs-flex-col qbs-gap-1 qbs-autocomplete-with-suggection ${propsClassName || ''} ${effectiveVisible.length > 0 ? 'suggection-warning-container' : ''} ${showTick && !isLoading ? 'suggection-okey-container' : ''}`}
    >
      {label && !isModern && (
        <div className="qbs-mb-3">
          <label className={`qbs-text-xs qbs-font-medium`}>
            {label}
            {required ? <span className="text-error"> *</span> : <></>}
          </label>
        </div>
      )}
      <div className="tooltip-container">
        {isHovered && errors && errors[name] && (
          <span className="tooltip">{handleError(errors)} </span>
        )}
        <div className="qbs-flex qbs-relative qbs-w-full">
        <div
          className="qbs-relative qbs-w-full"
          onMouseEnter={() => {}}
          onMouseLeave={() => {}}
        >
          <input
            type="text"
            id={
              id ? `custom-autocomplete-${id}` : `custom-autocomplete-${name}`
            }
            name={name}
            value={inputValue ? inputValue : ''}
            ref={inputRef}
            disabled={disabled}
            onFocus={() => {
              setIsFocused(true);
              // Calculate position before showing dropdown to prevent flicker
              if (!insideOpen && inputRef?.current) {
                getDropPosition();
              }
              // show suggestions when the field gains focus.
              if (!disabled && effectiveVisible.length > 0) {
                setShowDropdown(true);
              }
            }}
            onBlur={() => {
              setIsFocused(false);
            }}
            onChange={(e) => {
              const val = e.target.value;
              isExternalUpdateRef.current = false;
              setInputValue(val);
              const isEmpty = val.trim() === '';
              setHasTyped(!isEmpty);

              if (isEmpty) {
                // Handle "select all + backspace" consistently as a reset state.
                setDebouncedInputValue('');
                previousDebouncedValueRef.current = '';
                setItems(data ?? []);
                onChange?.('');
              }
            }}
            placeholder={placeholder}
            autoComplete="off"
            data-testid="custom-autocomplete-suggestions"
            aria-describedby={id}
            style={{
              paddingRight: getInnerWidth(),
            }}
            className={` ${generateClassName('input')}`}
          />
          {isModern && (
            <label
              htmlFor={id ?? name}
              onClick={() => onLabelClick()}
              className={generateClassName('label')}
            >
              {label ? <span className="qbs-truncate">{label}</span> : ''}
              {required ? <span className="text-error"> *</span> : <></>}
            </label>
          )}
          <div className="qbs-autocomplete-adorement-wrapper">
            <div
              ref={adorementRef}
              className={`${generateClassName('adorement')} qbs-autocomplete-adorement qbs-custom-dorpdown-adorement qbs-mr-[1px] ${ isLoading ?'bg-white' : ''
              }`}
            >
              {isLoading && <Spinner />}
              {errors && errors[name] && (
                <div
                  className={` qbs-text-error-label qbs-relative qbs-cursor-pointer ${generateClassName(
                    'message'
                  )}`}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <CustomIcons name="alert" type="medium" />
                </div>
              )}

              {showWarningIcon && effectiveVisible.length > 0 && !showTick && !isLoading && (
                <div
                  className={`qbs-text-warning-label qbs-relative qbs-mr-1 ${generateClassName(
                    'warning'
                  )}`}
                >
                  <CustomIcons name="alert" type="medium" />
                </div>
              )}

              {showTick && !isLoading && (
                <div className="qbs-text-tick-label qbs-relative qbs-mr-1">
                  <CustomIcons
                    name="check_mark"
                    type="medium"
                    className="qbs-text-green-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
      {showDropdown && effectiveVisible.length > 0 && (
        <>
          {insideOpen ? (
            <div className="qbs-suggection-list">
              <div
                ref={dropdownContentRef}
                className="qbs-bg-white qbs-border qbs-border-grey-light qbs-shadow-gray-300 qbs-shadow-md qbs-rounded-sm qbs-max-h-40 qbs-overflow-auto qbs-text-[11px] qbs-text-gray-700 qbs-px-3.5 qbs-py-1.5"
              >
                {effectiveVisible.map((g) => (
                  <SuggestionItem 
                    key={g.name} 
                    name={g.name} 
                    count={g.count} 
                    showCount={g.count > 0}
                  />
                ))}
              </div>
            </div>
          ) : (
            <Portal>
              <div
                ref={dropdownContentRef}
                className="autocomplete-suggections qbs-autosuggection-list qbs-suggection-list qbs-bg-white qbs-shadow-gray-300 qbs-shadow-md qbs-border qbs-border-grey-light qbs-z-50"
                style={dropPosition}
              >
                <div className="qbs-h-auto qbs-max-h-40 qbs-overflow-auto qbs-w-full qbs-py-1.5">
                  {effectiveVisible.map((g) => (
                    <div key={g.name} className="qbs-px-3.5 qbs-text-gray-700 qbs-suggection-item">
                      <SuggestionItem 
                        name={g.name} 
                        count={g.count} 
                        showCount={g.count > 0}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Portal>
          )}
        </>
      )}
    </div>
  );
};

export default ModernAutoCompleteSuggections;

