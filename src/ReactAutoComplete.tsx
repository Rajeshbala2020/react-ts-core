import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FieldErrors } from 'react-hook-form';

import CustomIcons from './components/customIcons';
import Spinner from './components/loader/Spinner';
import Portal from './components/portal';
import { debounce } from './utilities/debounce';
import { applyPositionClass } from './utilities/getPosition';
import { DropArrow } from './utilities/icons';

type valueProps = {
  id?: string | number;
  name: string;
  label?: string;
  param1?: string | number | null;
  param2?: string | number | null;
  param3?: string | number | null;
  param4?: string | number | null;
  from?: number;
};
interface AutoSuggestionInputProps {
  id?: string;
  label?: string;
  fullWidth?: boolean;
  className?: string;
  autoFocus?: boolean;
  required?: boolean;

  hideClear?: boolean;
  value?: valueProps;
  onChange: (value?: valueProps) => void;
  data?: any[];
  type?: 'custom_select' | 'auto_complete' | 'custom_search_select';
  placeholder?: string;
  getData?: ((key?: string) => Promise<any>) | ((key?: string) => any);
  errors?: FieldErrors;
  name: string;
  readOnly?: boolean;
  disabled?: boolean;
  autoFilter?: boolean;

  insideOpen?: boolean;
  isClose?: boolean;
  noLocalFilter?: boolean;
  isStaticList?: boolean;
  isCustomPlaceholder?: boolean;
  checkParams?: string[];
  fromPrefix?: boolean;
  hasParentError?: boolean;
  width?: number;
  labelTitle?: string;
  isModern?: boolean;
}

const ModernAutoComplete: React.FC<AutoSuggestionInputProps> = ({
  label,
  onChange,

  getData,
  data,
  errors,
  required = false,
  autoFocus,
  name,
  fullWidth,
  placeholder,
  id,
  className: propsClassName,
  type = 'custom_select',
  readOnly,
  disabled = false,
  value,
  autoFilter = false,
  insideOpen = false,
  isClose = true,
  noLocalFilter = false,
  isStaticList = false,
  isCustomPlaceholder = false,
  checkParams,
  width,
  hasParentError,
  fromPrefix,
  labelTitle,
  isModern = true,
}) => {
  const [inputValue, setInputValue] = useState<any>(value?.name ?? '');
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dropOpen, setDropOpen] = useState<boolean>(false);

  const [isDisabled, setIsDisabled] = useState<boolean>(disabled);
  const [showClose, setShowClose] = useState(false);
  const [showToolTip, setShowTooltip] = useState(false);
  const [tooltipIsHovered, setTooltipIsHovered] = useState(false);
  const [suggestions, setSuggestions] = useState<any>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const adorementRef = useRef<HTMLDivElement>(null);
  const dropdownref = useRef<HTMLDivElement>(null);
  const dropBtnRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<number>(0); // To fix the no results found issue on second type
  const [dropPosition, setDropPosition] = useState<any>({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  });
  const checkIncludes = (
    mainString: string,
    subString: string,
    param1?: string | number,
    param2?: string | number,
    param3?: string | number,
    param4?: string | number
  ): boolean => {
    const checkIncludesIfExists = (
      mainString?: string | number,
      substring?: string
    ) => {
      return substring &&
        mainString &&
        typeof mainString === 'string' &&
        typeof subString === 'string'
        ? mainString
            .toString()
            .toLowerCase()
            .startsWith(substring.toString().toLowerCase())
        : false;
    };
    const checkArrayContains = (
      strArray: string[] | undefined,
      param: string
    ): boolean => strArray?.includes(param) ?? false;

    return (
      checkIncludesIfExists(mainString, subString) ||
      (!!checkParams &&
        ((checkArrayContains(checkParams, 'param1') &&
          checkIncludesIfExists(param1, subString)) ||
          (checkArrayContains(checkParams, 'param2') &&
            checkIncludesIfExists(param2, subString)) ||
          (checkArrayContains(checkParams, 'param3') &&
            checkIncludesIfExists(param3, subString)) ||
          (checkArrayContains(checkParams, 'param4') &&
            checkIncludesIfExists(param4, subString))))
    );
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    timerRef.current = 0;

    setInputValue(value);
    handleValChange(value);
    if (!value) {
      setInputValue('');
      onChange({ id: undefined, name: '', from: 2 });
    }
  };

  const handleValChange = useCallback(
    debounce(
      (value: string) => {
        setDropOpen(true);
        onChange({ id: undefined, name: '', from: 1 });
        if (value.trim() === '' && type === 'auto_complete') {
          setSuggestions([]);
          if (autoFilter) {
            handleDropData('*');
          } else {
            setDropOpen(false);
          }
        } else {
          handleDropData(value);
        }
        setTimeout(() => {
          timerRef.current = 1;
        }, 200);
      },
      isStaticList ? 0 : 1000
    ),
    []
  );
  const handleDropData = (value?: string) => {
    if (type === 'auto_complete') {
      if (isStaticList) {
        loadStaticData();
        const filteredData =
          value && value !== '*'
            ? data?.filter((item) =>
                checkIncludes(
                  item.name,
                  value,
                  item.param1,
                  item.param2,
                  item.param3
                )
              )
            : data;
        setSuggestions(filteredData);
      } else handlePickSuggestions(value);
    } else if (
      (type === 'custom_select' || type === 'custom_search_select') &&
      (!data || data?.length === 0)
    ) {
      handlePickSuggestions();
    } else if (type === 'custom_search_select' && data && data?.length > 0) {
      const filteredData =
        value && value !== '*'
          ? data.filter((item) =>
              checkIncludes(
                item.name,
                value,
                item.param1,
                item.param2,
                item.param3
              )
            )
          : data;
      setSuggestions(filteredData);
    }
  };
  const handlePickSuggestions = async (value?: string) => {
    if (getData) {
      setIsLoading(true);
      try {
        const fetchedSuggestions = await getData?.(value);
        setSuggestions(fetchedSuggestions);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    }
  };

  const onLabelClick = () => {
    if (!isDisabled) {
      inputRef?.current?.focus();
      if (autoFilter && inputValue === '') {
        handleValChange('*');
      } else if (
        (type === 'custom_select' || type === 'custom_search_select') &&
        data &&
        data?.length > 0
      ) {
        handleDropData();
        setDropOpen(true);
      }
    }
  };
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownref.current &&
      !dropdownref.current.contains(event.target as Node)
    ) {
      setDropOpen(false);
    }
  };
  const checkIsEmptyField = (): boolean => {
    if (inputValue === undefined) return true;
    else return (inputValue?.toString().length ?? 0) <= 0 ? true : false;
  };
  const loadStaticData = async () => {
    if (!data) {
      data = [];
      if (getData) {
        try {
          setIsLoading(true);
          handlePickSuggestions('*');
          const fetchedSuggestions = await getData?.('*');
          fetchedSuggestions?.forEach((element: any) => {
            data?.push(element);
          });
          setIsLoading(false);
        } catch (error) {
          setIsLoading(false);
        }
      }
    }
  };
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (autoFocus) {
      onLabelClick();
    }
  }, [autoFocus]);
  const onInputFocus = () => {
    if (!isDisabled) {
      if (autoFilter && inputValue === '') {
        handleValChange('*');
      } else if (
        (type === 'custom_select' || type === 'custom_search_select') &&
        data &&
        data?.length > 0
      ) {
        handleDropData();
        //if (insideOpen) setDropOpen(true) // commeted this code bcoz added onclick function inside
      }
    }
  };
  useEffect(() => {
    setIsDisabled(disabled);
  }, [disabled]);
  const handleSuggestionClick = (suggestion: valueProps) => {
    onChange({
      ...suggestion,
      id: suggestion?.id,
      name: suggestion.name,
      ...(suggestion?.label ? { label: suggestion?.label } : {}),
    });
    if (type !== 'custom_select') setInputValue(suggestion.name);
    setDropOpen(false);
  };
  const handleOpen = (e: any) => {
    if (!suggestions || suggestions?.length === 0) handleDropData();
    if (!isLoading) {
      setDropOpen(!dropOpen);
      if (type !== 'custom_select') setInputValue('');
    }
  };

  const handleScroll = () => {
    setDropOpen(false);
  };

  useEffect(() => {
    if (!insideOpen) {
      window.addEventListener('scroll', handleScroll);

      const mainElement = document.querySelector('main');
      mainElement?.addEventListener('scroll', handleScroll);

      const gridElements = document.querySelectorAll(
        '.k-grid-content, .overflow-auto, .overflow-y-auto, .overflow-x-auto'
      );
      gridElements.forEach((gridElement: any) => {
        gridElement.addEventListener('scroll', handleScroll);
      });

      window.addEventListener('resize', getDropPosition);
      getDropPosition();
      return () => {
        window.removeEventListener('scroll', handleScroll);
        const mainElement = document.querySelector('main');
        mainElement?.removeEventListener('scroll', handleScroll);
        window.addEventListener('resize', getDropPosition);
        const gridElements = document.querySelectorAll('.k-grid-content');
        gridElements.forEach((gridElement: any) => {
          gridElement.removeEventListener('scroll', handleScroll);
        });
      };
    }
  }, [dropOpen]);

  const handleClear = () => {
    setDropOpen(false);
    setInputValue('');
    onChange({ id: undefined, name: '', from: 3 });
    onLabelClick();
  };

  useEffect(() => {
    setInputValue(value?.name ?? '');
  }, [value?.name]);

  useEffect(() => {
    setSuggestions(data);
  }, [data]);

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
  const generateClassName = (
    type: 'input' | 'label' | 'message' | 'adorement'
  ): string => {
    let className = propsClassName;
    switch (type) {
      case 'input':
        className += `block text-common text-input-text font-normal px-3.5 w-full text-sm text-gray-900 bg-transparent  border  appearance-none    peer h-10 rounded-[4px] disabled:text-input-disabled bg-white disabled:bg-disabled ${
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

        break;
      case 'label':
        className += ` modern-input-label  peer-focus:modern-input-peer-focus-label-size 
          ${
            isDisabled
              ? 'cursor-pointer'
              : 'cursor-text peer-focus:cursor-pointer'
          } ${
          isDisabled && !checkIsEmptyField()
            ? 'disabled-input-label-bg'
            : !isDisabled || !checkIsEmptyField()
            ? 'active-input-label-bg'
            : ''
        } absolute   duration-300 transform -translate-y-4  top-2 z-1 origin-[0]  px-0 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2  peer-focus:-translate-y-4 start-[14px] rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto ${
          isDisabled
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
      case 'adorement':
        className += '  absolute right-0 adorement gap-1 flex items-center ';
        break;
      default:
        break;
    }
    return className;
  };
  const handleClose = () => {
    setTimeout(() => {
      setDropOpen(false);
    }, 500);
  };
  const handleClearInputValue = () => {
    // setInputValue(value?.name ?? '')
  };
  const getInnerWidth = () => {
    const innerwidth = adorementRef.current
      ? adorementRef.current.offsetWidth
      : 0;
    return innerwidth;
  };
  // const getPosition = () => {
  //   return 'bottom'
  // }
  const filteredData =
    inputValue !== '*' && inputValue !== '' && type !== 'custom_select' && !noLocalFilter
      ? suggestions?.filter((item: valueProps) =>
          checkIncludes(
            item.name,
            inputValue,
            item.param1 ?? '',
            item.param2 ?? '',
            item.param3 ?? '',
            item.param4 ?? ''
          )
        )
      : suggestions;

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

  const getDropPosition = (): any => {
    if (!insideOpen && inputRef?.current) {
      const dropdownHeight = 200; // Assume the height of the dropdown is 200px, adjust as needed

      const inputRect = inputRef.current.getBoundingClientRect();
      const spaceBelow =
        window.innerHeight - (inputRect.bottom + window.scrollY);
      const spaceAbove = inputRect.top + window.scrollY;

      let top;
      let bottom;
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        bottom = spaceBelow + 43;
      } else {
        top = inputRect.top + window.scrollY + inputRect.height + 2;
      }
      setDropPosition({
        left: inputRect.left + window.scrollX,
        top,
        bottom,
        width: inputRect.width,
      });
    }

    return undefined;
  };

  const [showNoResults, setShowNoResults] = useState(false);

  useEffect(() => {
    if (
      inputValue &&
      filteredData?.length === 0 &&
      !isLoading &&
      timerRef.current === 1
    ) {
      const timer = setTimeout(() => {
        setShowNoResults(true);
      }, 500); // Delay in milliseconds
      return () => clearTimeout(timer);
    } else {
      setShowNoResults(false);
    }
  }, [inputValue, filteredData, isLoading, timerRef.current]);

  const setDropDown = () => {
    return (
      (filteredData?.length > 0 || showNoResults) && (
        <ul
          className="autocomplete-suggections absolute h-auto max-h-40 overflow-auto w-full bg-white shadow-gray-300 shadow-md border border-grey-light py-1.5 z-50  mt-9"
          style={dropPosition}
        >
          {filteredData?.length > 0 ? (
            <>
              {filteredData.map((suggestion: any, index: number) => (
                <li
                  className={`${
                    value?.id === suggestion?.id
                      ? 'bg-blue-navy text-white'
                      : 'hover:bg-table-hover'
                  } cursor-pointer p-1  text-xxs ps-3.5 pl-[10px]`}
                  key={suggestion?.id}
                  data-testid={suggestion.name}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion?.label ? suggestion?.label : suggestion.name}
                </li>
              ))}
            </>
          ) : (
            showNoResults &&
            !isLoading &&
            timerRef.current === 1 && (
              <li
                className={`$ cursor-pointer p-1 rounded-sm text-xxs`}
                onClick={handleClose}
              >
                No Results Found
              </li>
            )
          )}
        </ul>
      )
    );
  };
  const getBorderRight = () => {
    if (fromPrefix) {
      if (
        (hasParentError && Boolean(errors && errors[name])) ||
        hasParentError
      ) {
        return 0;
      } else if (errors && errors[name]) {
        return undefined;
      }
    }
    return 0;
  };

  useEffect(() => {
    applyPositionClass(dropdownref, isHovered);
    setDropOpen(false);
  }, [isHovered]);

  useEffect(() => {
    const shouldShowClose =
      value?.name &&
      (value?.id || String(value?.id) === '0') &&
      !disabled &&
      !readOnly &&
      isClose;
    if (showClose !== shouldShowClose) {
      setShowClose(shouldShowClose);
    }
  }, [value, disabled, readOnly]);
  useEffect(() => {
    // Check if input content overflows
    const checkOverflow = () => {
      if (inputRef.current) {
        const { scrollWidth, clientWidth, value } = inputRef.current;
        // Check for overflow only when there's content
        if (value.trim() !== '') {
          setShowTooltip(scrollWidth > clientWidth + 2);
        } else {
          setShowTooltip(false); // No tooltip for empty input
        }
      }
    };

    if (inputRef.current) {
      inputRef.current.addEventListener('input', checkOverflow);
      checkOverflow(); // Initial check
    }

    return () => {
      if (inputRef.current) {
        inputRef.current.removeEventListener('input', checkOverflow);
      }
    };
  }, [inputValue]);

  const handleMouseEnter = () => {
    setTooltipIsHovered(true);
  };

  const handleMouseLeave = () => {
    setTooltipIsHovered(false);
  };

  return (
    <div
      className={` flex-grow  ${fullWidth ? 'w-full' : 'w-auto'}`}
      ref={dropdownref}
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
        {tooltipIsHovered && showToolTip && !dropOpen && inputValue && (
          <div className={`tooltip-info`}>{inputValue}</div>
        )}

        <div
          className={`flex relative ${fullWidth ? 'w-full' : 'w-auto'}`}
          style={{ width: width }}
        >
          <div
            className="relative w-full"
            onMouseEnter={() => handleMouseEnter()}
            onMouseLeave={() => handleMouseLeave()}
          >
            <input
              id={id}
              type="text"
              readOnly={readOnly ?? type === 'custom_select'}
              value={inputValue ? inputValue : ''}
              onBlur={handleClearInputValue}
              disabled={disabled}
              ref={inputRef}
              data-testid="custom-autocomplete"
              // onBlur={() => {
              // setInputValue("")
              // }}
              aria-describedby={id}
              style={{
                paddingRight: getInnerWidth(),
                ...(fromPrefix
                  ? {
                      borderRight: getBorderRight(),
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                    }
                  : {}),
              }}
              className={` ${generateClassName('input')}`}
              onChange={handleChange}
              placeholder={
                type === 'auto_complete'
                  ? placeholder && isCustomPlaceholder
                    ? placeholder
                    : 'Type to search'
                  : placeholder ?? '--Select--'
              }
              onFocus={onInputFocus}
              onClick={(e) => {
                if (type === 'custom_select') {
                  setDropOpen(!dropOpen);
                  handleOpen(e);
                } else {
                  setDropOpen(!dropOpen);
                }
              }}
            />
            {isModern && (
              <label
                htmlFor={id}
                onClick={() => onLabelClick()}
                className={generateClassName('label')}
              >
                {label ? label : ''}
                {required ? <span className="text-error"> *</span> : <></>}
              </label>
            )}
          </div>
          <div className="flex items-center justify-center   ">
            <div
              ref={adorementRef}
              className={`${generateClassName(
                'adorement'
              )} qbs-autocomplete-adorement mr-[1px] ${
                isLoading ? 'bg-white' : ''
              }`}
            >
              {showClose && (
                <button
                  onClick={() => handleClear()}
                  className=" text-table-bodyColor text-[#667085]"
                  aria-label="close"
                  type="button"
                >
                  <CustomIcons name="close" type="large-m" />
                </button>
              )}
              {isLoading && <Spinner />}
              {type !== 'auto_complete' && !disabled && !readOnly && (
                <button
                  disabled={disabled ?? readOnly}
                  onClick={(e) => handleOpen(e)}
                  onBlur={handleClose}
                  className=" text-[#667085] focus-visible:outline-slate-100"
                  data-testid="drop-arrow"
                  type="button"
                  ref={dropBtnRef}
                >
                  {!dropOpen ? (
                    <DropArrow />
                  ) : (
                    <DropArrow className="rotate-180" />
                  )}
                </button>
              )}
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
            </div>
          </div>
          {dropOpen && (!isLoading || filteredData?.length > 0) && (
            <>{insideOpen ? setDropDown() : <Portal>{setDropDown()}</Portal>}</>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernAutoComplete;
