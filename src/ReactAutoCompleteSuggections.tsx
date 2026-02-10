// NOTE: This file was renamed from ReactAutoCompleteNameCount.tsx
// The implementation is unchanged; only the filename and exported component name differ.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FieldErrors } from 'react-hook-form';
import Spinner from './components/loader/Spinner';
import Portal from './components/portal';
import CustomIcons from './components/customIcons';

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
    <div className="py-0.5 flex items-center justify-between gap-2 group relative">
      <span className="flex-1 whitespace-normal break-words suggection-label">
        {name}
      </span>
      {showCount && (
        <span className="ml-2 suggection-count flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-orange-500 text-white text-[10px] font-medium flex-shrink-0">
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
    if (!getDataRef.current || query === '') {
      // Clear items when input is cleared so dropdown also clears
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

  // Handle scroll to close dropdown
  const handleScroll = () => {
    setShowDropdown(false);
  };

  // Attach event listeners for click outside and scroll
  useEffect(() => {
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      window.addEventListener('scroll', handleScroll);

      const mainElement = document.querySelector('main');
      mainElement?.addEventListener('scroll', handleScroll);

      const gridElements = document.querySelectorAll(
        '.k-grid-content, .overflow-auto, .overflow-y-auto, .overflow-x-auto'
      );
      gridElements.forEach((gridElement: any) => {
        gridElement.addEventListener('scroll', handleScroll);
      });

      return () => {
        document.removeEventListener('click', handleClickOutside);
        window.removeEventListener('scroll', handleScroll);
        mainElement?.removeEventListener('scroll', handleScroll);
        gridElements.forEach((gridElement: any) => {
          gridElement.removeEventListener('scroll', handleScroll);
        });
      };
    }
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
      case 'input':
        className += ` block text-common text-input-text font-normal px-3.5 w-full text-sm text-gray-900 bg-transparent  border  appearance-none    peer h-10 rounded-[4px] disabled:text-input-disabled bg-white disabled:bg-disabled ${
          label && isModern
            ? 'placeholder-transparent'
            : 'focus:placeholder-grey-secondary placeholder-input-label'
        } focus:placeholder-grey-secondary`;

        if (errors && errors[name]) {
          className +=
            ' border-[#FDA29B] focus:border-error-[#FDA29B] focus:ring-[#FDA29B] focus:ring-3 focus:outline-[#FDA29B] input-outline';
        } else {
          className +=
            ' text-grey-dark border-input-light focus:border-blue-navy  focus:outline-none  focus:ring-0';
        }

        className += getHeight();

        break;
      case 'label':
        className += ` flex modern-input-label-truncate  peer-focus:modern-input-peer-focus-label-size 
          ${
            disabled
              ? 'cursor-pointer'
              : 'cursor-text peer-focus:cursor-pointer'
          } ${
          disabled && !checkIsEmptyField()
            ? 'disabled-input-label-bg'
            : !disabled || !checkIsEmptyField()
            ? 'active-input-label-bg'
            : ''
        } absolute   duration-300 transform -translate-y-4  top-2 z-1 origin-[0]  px-0 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2  peer-focus:-translate-y-4 start-[14px] rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto ${
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
          className += ' text-error-light ';
        } else {
          className += ' text-grey-dark peer-focus:text-blue-navy';
        }
        break;
      case 'message':
        className = ' text-error-icon ';
        break;
      case 'warning':
          className = ' text-warning-icon ';
          break;
      case 'adorement':
        className += '  absolute right-0 adorement gap-1 flex items-center ';
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

  return (
    <div
      ref={containerRef}
      className={`flex flex-col gap-1 autocomplete-with-suggection ${propsClassName || ''} ${effectiveVisible.length > 0 ? 'suggection-warning-container' : ''}`}
    >
      {label && !isModern && (
        <div className="mb-3">
          <label className={`text-xs font-medium`}>
            {label}
            {required ? <span className="text-error"> *</span> : <></>}
          </label>
        </div>
      )}
      <div className="tooltip-container">
        {isHovered && errors && errors[name] && (
          <span className="tooltip">{handleError(errors)} </span>
        )}
        <div className="flex relative w-full">
        <div
          className="relative w-full"
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
              setHasTyped(true);
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
              {label ? <span className="truncate">{label}</span> : ''}
              {required ? <span className="text-error"> *</span> : <></>}
            </label>
          )}
        </div>
        <div className="flex items-center justify-center">
          <div
            ref={adorementRef}
            className={`${generateClassName('adorement')} qbs-autocomplete-adorement custom-dorpdown-adorement mr-[1px] ${
              isLoading ? 'bg-white' : ''
            }`}
          >
            {isLoading && <Spinner />}
            {errors && errors[name] && (
              <div
                className={` text-error-label relative cursor-pointer ${generateClassName(
                  'message'
                )}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <CustomIcons name="alert" type="medium" />
              </div>
            )}

            {showWarningIcon && effectiveVisible.length > 0 && (
              <div
                className={`text-warning-label relative  mr-1 ${generateClassName(
                  'warning'
                )}`}
              >
                <CustomIcons name="alert" type="medium" />
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
      {showDropdown && effectiveVisible.length > 0 && (
        <>
          {insideOpen ? (
            <div className="suggection-list">
              <div className="bg-white border border-grey-light shadow-gray-300 shadow-md rounded-sm max-h-40 overflow-auto text-[11px] text-gray-700 px-3.5 py-1.5">
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
                className="autocomplete-suggections autosuggection-list suggection-list bg-white shadow-gray-300 shadow-md border border-grey-light z-50"
                style={dropPosition}
              >
                <div className="h-auto max-h-40 overflow-auto w-full py-1.5">
                  {effectiveVisible.map((g) => (
                    <div key={g.name} className="px-3.5 text-gray-700 suggection-item">
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

