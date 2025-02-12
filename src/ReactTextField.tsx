import React, { useEffect, useRef, useState } from 'react';

import { TextFieldProps } from './commontypes';
import CustomIcons from './components/customIcons';
import ModernAutoComplete from './ReactAutoComplete';
import { applyPositionClass } from './utilities/getPosition';

const TextField: React.FC<TextFieldProps> = ({
  name,
  id,
  label,
  type = 'text',
  disabled = false,
  readOnly = false,
  fullwidth = true,
  uppercase = false,
  adorementPosition = 'end',
  register,
  adorement,
  className: propsClassName,
  value,
  placeholder = '',
  min,
  max,
  size = 'md',
  required = false,
  autoComplete = false,
  isValid,
  isTooltip = true,
  maxLength = 200,
  autoFocus = false,
  step, //new requirement number steper
  onStepUp, //new requirement number steper
  onStepDown, //new requirement number steper
  onChange,
  infoTitle,
  onBlur,
  showInfo,
  errors,
  keyRegexPattern,
  backGround, //added for set background colour according to the form
  /// Provition to add Prefixes
  onPrefixChange,
  prefixValue,
  prefixes,
  width,
  labelTitle,
  hideLabel = false,

  ///
}) => {
  // const [editState, setEditState] = useState<boolean>(false)
  const [isDisabled, setIsDisabled] = useState<boolean>(disabled);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [Width, setWidth] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const adorementRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<any>(null);
  const clickTimeoutRef = useRef<any>(null);
  const [isHolding, setIsHolding] = useState<boolean>(false);

  const onLabelClick = () => {
    if (!isDisabled) {
      inputRef?.current?.focus();
    }
  };

  const checkIsEmptyField = (): boolean => {
    if (value === undefined) return true;
    else return (value?.toString().length ?? 0) <= 0 ? true : false;
  };
  useEffect(() => {
    setIsDisabled(disabled);
  }, [disabled]);
  useEffect(() => {
    const innerwidth = adorementRef.current
      ? adorementRef.current.offsetWidth
      : 15;
    setWidth(innerwidth);
  }, [adorement, infoTitle, showInfo]);
  const getErrors = (err?: any) => {
    let errMsg = '';
    if (err?.message) {
      errMsg = err?.message;
    }
    return errMsg;
  };
  useEffect(() => {
    if (autoFocus) {
      onLabelClick();
    }
  }, [autoFocus]);

  const getHeight = () => {
    switch (size) {
      case 'xs':
        return ' h-10 ';
      case 'xxs':
        return ' h-[25px] ';
      case 'sm':
        return ' h-[34px] ';
      case 'md':
        return ' h-10 ';
      case 'lg':
        return ' h-10 ';
      default:
        return ' h-10 ';
    }
  };
  const getBg = () => backGround || 'bg-transparent'; //added for set background colour according to the form
  const generateClassName = (
    from: 'input' | 'label' | 'message' | 'adorement'
  ): string => {
    let className = `${propsClassName} `;

    switch (from) {
      case 'input':
        className += `block ${
          size === 'xxs' ? ' text-xxs' : 'text-common'
        }  text-input-text font-normal ${
          step && adorement ? 'px-2.5' : 'px-3.5'
        } w-full text-sm text-gray-900 ${getBg()} border appearance-none peer rounded-[4px] disabled:text-input-disabled bg-white disabled:bg-disabled ${
          hideLabel ? '' : 'placeholder-transparent'
        } focus:placeholder-grey-secondary ${
          adorementPosition === 'start' && ' !pl-[45px] '
        }  ${getHeight()}`;

        if (errors && errors[name]) {
          className +=
            ' border-[#FDA29B] focus:border-error-[#FDA29B] focus:ring-[#FDA29B] focus:ring-3 focus:outline-[#FDA29B] input-outline';
        } else {
          className +=
            ' text-grey-dark border-input-light focus:border-blue-navy  focus:outline-none  focus:ring-0';
        }

        break;
      case 'label': // changes made for remove bg-white from placeolder is field disable and or with data
        className += ` modern-input-label peer-focus:modern-input-peer-focus-label-size absolute duration-300 transform -translate-y-4 top-2 z-1 origin-[0] px-0 
    peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 
    peer-focus:-translate-y-4 start-[14px] rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto  ${
      isDisabled ? 'cursor-pointer' : 'cursor-text peer-focus:cursor-pointer'
    } ${
          isDisabled && !checkIsEmptyField()
            ? 'disabled-input-label-bg'
            : !isDisabled || !checkIsEmptyField()
            ? 'active-input-label-bg'
            : ''
        } ${
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
        className += `${
          isDisabled ? 'bg-bodyBG' : 'bg-white'
        } absolute right-0 adorement gap-1 flex items-center`;
        break;

      default:
        break;
    }
    return className;
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

  // Added handle key press function on textfield to restrict typing letter 'e' on number type
  const handleKeyPress = (e: any) => {
    if (type === 'number' && e.key === 'e') e.preventDefault();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (keyRegexPattern) {
      const { value } = event.target;
      if (new RegExp(keyRegexPattern).test(value)) {
        onChange?.(event);
      }
    } else {
      onChange?.(event);
    }
  };
  const renderPrefix = () => {
    if (prefixes) {
      switch (prefixes?.type) {
        case 'custom_select':
          return (
            <ModernAutoComplete
              key={prefixes.name}
              placeholder={prefixes.placeholder}
              onChange={(e: any) => onPrefixChange?.(e)}
              name={prefixes.name}
              value={prefixValue ?? { id: '', name: '' }}
              type="custom_select"
              isCustomPlaceholder
              fullWidth={false}
              width={prefixes.width}
              fromPrefix
              isClose={false}
              hideClear={prefixes.hideClear}
              data={prefixes.data}
              hasParentError={Boolean(errors && errors[name])}
              errors={errors}
              disabled={prefixes.disabled}
              required={prefixes.required}
              autoFilter={prefixes.autoFilter ? prefixes.autoFilter : false}
            />
          );
        default:
          return <></>;
      }
    }
  };
  const getBorderLeft = () => {
    if (prefixes) {
      if (errors && errors[prefixes.name] && Boolean(errors && errors[name])) {
        return undefined;
      } else if (errors && errors[prefixes.name]) {
        return 0;
      }
    }
    return undefined;
  };

  const handleMouseDown = (type: 'up' | 'down') => {
    setIsHolding(true);
    //handleAction(type)
    intervalRef.current = setInterval(() => handleAction(type), 100);
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
  };

  const handleAction = (type: 'up' | 'down') => {
    if (type === 'up') onStepUp?.();
    else onStepDown?.();
  };

  function handleMouseUp() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  const handleClick = (type: 'up' | 'down') => {
    if (!isHolding) {
      clickTimeoutRef.current = setTimeout(() => {
        handleAction(type);
      }, 100);
    }
  };
  const textFieldRef = useRef<HTMLDivElement>(null); // Ref for the text field div

  useEffect(() => {
    applyPositionClass(textFieldRef, isHovered);
  }, [isHovered]);
  return (
    <div ref={textFieldRef} className={` ${fullwidth ? 'w-full' : 'w-auto'}`}>
      <div className="tooltip-container ">
        {isHovered && errors && errors[name] && (
          <span className="tooltip">{handleError(errors)} </span>
        )}
        {isHovered && infoTitle && (
          <span className="tooltip-info">{infoTitle} </span>
        )}
        <div className={`w-full ${prefixes ? 'flex' : ''}`}>
          {prefixes && renderPrefix()}
          <div
            className={`flex relative ${fullwidth ? 'w-full' : 'w-auto'}`}
            style={{ width: width }}
          >
            <div className="relative w-full ">
              <input
                // key={updateKey}
                type={type}
                // id={frmid+id}
                ref={inputRef}
                disabled={isDisabled}
                // step={step}
                min={min}
                max={max}
                maxLength={maxLength}
                readOnly={readOnly ?? false}
                {...register?.(name, { required })}
                aria-describedby={id}
                style={{
                  paddingRight: Width,
                  ...(prefixes
                    ? {
                        borderLeft: getBorderLeft(),
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                      }
                    : {}),
                }}
                className={` ${generateClassName('input')} ${
                  uppercase ? 'uppercase placeholder:normal-case' : ''
                } ''}`}
                placeholder={placeholder}
                onChange={(e) => {
                  handleChange(e);
                }}
                onKeyDown={handleKeyPress}
                autoComplete={autoComplete ? 'on' : 'off'}
                onBlur={(e) => onBlur?.(e)}
                // autoFocus={autoFocus}
                value={value}
              />
              {!hideLabel && (
                <label
                  htmlFor={id}
                  onClick={() => onLabelClick()}
                  className={generateClassName('label')}
                >
                  {label}
                  {required ? <span className="text-error"> *</span> : <></>}
                </label>
              )}
            </div>
            {(adorement ||
              (showInfo && infoTitle) ||
              step ||
              (!isValid && isTooltip && errors && errors[name]) ||
              isValid) && (
              <div className="flex items-center justify-center gap-1 ">
                {adorement && adorementPosition === 'start' && (
                  <div
                    className={`  ${
                      isDisabled ? 'text-zinc-500' : 'text-grey-medium'
                    } absolute adorement left-0  `} // adorement  position added for start
                  >
                    <>{adorement}</>
                  </div>
                )}

                <div
                  className={`${generateClassName(
                    'adorement'
                  )} h-[20px] right-[1px]`} //added adorment bg color
                  ref={adorementRef}
                >
                  {adorement && adorementPosition === 'end' && (
                    <div
                      className={`  ${
                        isDisabled ? 'text-zinc-500' : 'text-grey-medium'
                      } `} // changed for adorment text blurness while disabled
                    >
                      <>{adorement}</>
                    </div>
                  )}

                  {step && (
                    <div className="ml-2">
                      <CustomIcons
                        name="TreeUp_Arrow"
                        className={`text-gray-500 hover:text-dark cursor-pointer ${
                          isDisabled ? 'hidden' : 'block'
                        }`}
                        type="medium"
                        onClick={() => {
                          handleClick('up');
                        }}
                        onMouseDown={() => handleMouseDown('up')}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        viewBox={true}
                      />
                      <CustomIcons
                        name="TreeDown_Arrow"
                        className={`text-gray-500 hover:text-dark cursor-pointer ${
                          isDisabled ? 'hidden' : 'block'
                        }`}
                        type="medium"
                        onClick={() => {
                          handleClick('down');
                        }}
                        onMouseDown={() => handleMouseDown('down')}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        viewBox={true}
                      />
                    </div>
                  )}

                  {!isValid && isTooltip && errors && errors[name] && (
                    <div
                      className={` text-error-label relative bg-white cursor-pointer ${generateClassName(
                        'message'
                      )}`}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      <CustomIcons name="alert" type="medium" />
                    </div>
                  )}
                  {infoTitle && showInfo && (
                    <div
                      className={`  relative bg-white cursor-pointer text-[#667085] `}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      <CustomIcons name="infoCircle" type="medium" />
                    </div>
                  )}
                  {isValid && (
                    <div className="pl-2">
                      <CustomIcons
                        name="check_mark"
                        type="medium"
                        className="text-[#28B440]"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextField;
