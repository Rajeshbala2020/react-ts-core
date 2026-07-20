import React, { useEffect, useRef, useState } from "react";

import { TextFieldProps } from "./commontypes";
import CustomIcons from "./components/customIcons";
import ModernAutoComplete from "./ReactAutoComplete";
import { applyPositionClass } from "./utilities/getPosition";

const TextField: React.FC<TextFieldProps> = ({
  name,
  id,
  label,
  type = "text",
  disabled = false,
  readOnly = false,
  fullwidth = true,
  uppercase = false,
  adorementPosition = "end",
  register,
  adorement,
  className: propsClassName,
  value,
  placeholder = "",
  min,
  max,
  size = "md",
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
  isModern = true,
  enableSearch = false,
  onSearchClick,
  inputClassName = '',
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
  const searchBtnRef = useRef<HTMLButtonElement>(null);  
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
      : enableSearch ? searchBtnRef.current?.offsetWidth || 38 : 15;
    setWidth(innerwidth);
  }, [adorement, infoTitle, showInfo]);
  const getErrors = (err?: any) => {
    let errMsg = "";
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
      case "xs":
        return "qbs-h-10";
      case "xxs":
        return "qbs-h-[25px]";
      case "sm":
        return "qbs-h-[34px]";
      case "md":
        return "qbs-h-10";
      case "lg":
        return "qbs-h-10";
      default:
        return "qbs-h-10";
    }
  };
  const getBg = () => backGround || "qbs-bg-transparent"; //added for set background colour according to the form
  const generateClassName = (
    from: "input" | "label" | "message" | "adorement" | "search"
  ): string => {
    let className = `${propsClassName} `;

    switch (from) {
      case "input":
        className += `qbs-block ${inputClassName} ${
          size === "xxs" ? "qbs-text-xxs" : "text-common"
        }  qbs-text-input-text qbs-font-normal ${
          step && adorement ? "qbs-px-2.5" : "qbs-px-3.5"
        } ${enableSearch ? "search-btn-input" : ""} qbs-w-full qbs-text-sm qbs-text-gray-900 ${getBg()} qbs-border qbs-appearance-none qbs-peer qbs-rounded-[4px] disabled:qbs-text-input-disabled qbs-bg-white disabled:qbs-bg-disabled ${
          hideLabel ? "" : label && isModern ? "placeholder-transparent" : ""
        } focus:placeholder-grey-secondary ${
          adorementPosition === "start" && "!qbs-pl-[45px]"
        }  ${getHeight()}`;

        if (errors && errors[name]) {
          className +=
            "qbs-border-[#FDA29B] focus:qbs-border-error-[#FDA29B] focus:qbs-ring-[#FDA29B] focus:qbs-ring-3 focus:qbs-outline-[#FDA29B] qbs-input-outline";
        } else {
          className +=
            "qbs-text-grey-dark qbs-border-input-light focus:qbs-border-blue-navy focus:qbs-outline-none focus:qbs-ring-0";
        }

        break;
      case "label": // changes made for remove bg-white from placeolder is field disable and or with data
        className += `qbs-flex modern-input-label-truncate peer-focus:modern-input-peer-focus-label-size qbs-absolute qbs-duration-300 qbs-transform -qbs-translate-y-4 qbs-top-2 qbs-z-1 qbs-origin-[0] qbs-px-0 peer-placeholder-shown:-qbs-translate-y-1/2 peer-placeholder-shown:qbs-top-1/2 peer-focus:qbs-top-2 peer-focus:-qbs-translate-y-4 qbs-start-[14px] rtl:peer-focus:qbs-translate-x-1/4 rtl:peer-focus:qbs-left-auto  ${
      isDisabled ? "qbs-cursor-pointer" : "qbs-cursor-text peer-focus:qbs-cursor-pointer"
    } ${
          isDisabled && !checkIsEmptyField()
            ? "disabled-input-label-bg"
            : !isDisabled || !checkIsEmptyField()
            ? "active-input-label-bg"
            : ""
        } ${
          checkIsEmptyField()
            ? "modern-input-label-size"
            : "modern-input-peer-focus-label-size"
        }`;

        if (errors && errors[name]) {
          className += "qbs-text-error-light";
        } else {
          className += "qbs-text-grey-dark peer-focus:qbs-text-blue-navy";
        }
        break;
      case "message":
        className="qbs-text-error-icon";
        break;
      case "adorement":
        className += `${
          isDisabled ? "qbs-bg-bodyBG" : "qbs-bg-white"
        } qbs-absolute qbs-right-0 adorement qbs-gap-1 qbs-flex qbs-items-center`;
        break;

      case "search":
          className += `qbs-absolute inner-search-button qbs-gap-1 qbs-flex qbs-items-center qbs-cursor-pointer`;
          break;

      default:
        break;
    }
    return className;
  };

  const handleError = (data: any) => {
    if (
      getErrors(data[name]) === "required" ||
      getErrors(data[name]) === "Required"
    ) {
      return `${label ?? labelTitle} is ${getErrors(data[name])}`;
    } else {
      return getErrors(data[name]) ?? "";
    }
  };

  // Added handle key press function on textfield to restrict typing letter 'e' on number type
  const handleKeyPress = (e: any) => {
    if (type === "number" && e.key === "e") e.preventDefault();
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
        case "custom_select":
          return (
            <ModernAutoComplete
              key={prefixes.name}
              placeholder={prefixes.placeholder}
              onChange={(e: any) => onPrefixChange?.(e)}
              name={prefixes.name}
              value={prefixValue ?? { id: "", name: "" }}
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
        case "text":
          return <div className="qbs-text-sm qbs-text-gray-500 textfield-text-prefix">{prefixes.data}</div>;
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

  const handleMouseDown = (type: "up" | "down") => {
    setIsHolding(true);
    //handleAction(type)
    intervalRef.current = setInterval(() => handleAction(type), 100);
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
  };

  const handleAction = (type: "up" | "down") => {
    if (type === "up") onStepUp?.();
    else onStepDown?.();
  };

  function handleMouseUp() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  const handleClick = (type: "up" | "down") => {
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
    <div
      ref={textFieldRef}
      className={`qbs-textfield ${fullwidth ? "qbs-w-full" : "qbs-w-auto"}`}
    >
      {label && !isModern && !hideLabel && (
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
        {isHovered && infoTitle && (
          <span className="tooltip-info">{infoTitle} </span>
        )}
        <div className={`qbs-w-full ${prefixes ? "qbs-flex" : ""}`}>
          {prefixes && renderPrefix()}
          <div
            className={`qbs-flex qbs-relative ${fullwidth ? "qbs-w-full" : "qbs-w-auto"}`}
            style={{ width: width }}
          >
            <div className="qbs-relative qbs-w-full">
              <input
                // key={updateKey}
                type={type}
                // id={frmid+id}
                ref={inputRef}
                id={id ? `input-${id}` : `input-${name}`}
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
                className={` ${generateClassName("input")} ${
                  uppercase ? "uppercase placeholder:normal-case" : ""
                } ''}`}
                placeholder={placeholder}
                onChange={(e) => {
                  handleChange(e);
                }}
                onKeyDown={handleKeyPress}
                autoComplete={autoComplete ? "on" : "off"}
                onBlur={(e) => onBlur?.(e)}
                // autoFocus={autoFocus}
                value={value}
              />
              {!hideLabel && isModern && (
                <label
                  htmlFor={id}
                  onClick={() => onLabelClick()}
                  className={generateClassName("label")}
                >
                  {label ? <span className="qbs-truncate">{label}</span> : ""}
                  {required ? <span className="text-error"> *</span> : <></>}
                </label>
              )}
            </div>
            {enableSearch && (
               <button
                  disabled={disabled ?? readOnly}
                  onClick={() => onSearchClick?.(inputRef.current?.value || value || '')} 
                  className={`${generateClassName("search")}`}
                  data-testid="tools-drop-arrow"
                  type="button"
                  id="search-btn-textfield"
                  ref={searchBtnRef}
              >
                <CustomIcons name="search" type="medium" />
              </button>
            )}
            {(adorement ||
              (showInfo && infoTitle) ||
              step ||
              (!isValid && isTooltip && errors && errors[name]) ||
              isValid) && (
              <div className="qbs-flex qbs-items-center qbs-justify-center qbs-gap-1">
                {adorement && adorementPosition === "start" && (
                  <div
                    className={`  ${
                      isDisabled ? "qbs-text-zinc-500" : "qbs-text-grey-medium"
                    } qbs-absolute adorement qbs-left-0  `} // adorement  position added for start
                  >
                    <>{adorement}</>
                  </div>
                )}

                <div
                  className={`${generateClassName(
                    "adorement"
                  )} qbs-h-[20px] qbs-right-[1px]`} //added adorment bg color
                  ref={adorementRef}
                >
                  {adorement && adorementPosition === "end" && (
                    <div
                      className={`  ${
                        isDisabled ? "qbs-text-zinc-500" : "qbs-text-grey-medium"
                      } `} // changed for adorment text blurness while disabled
                    >
                      <>{adorement}</>
                    </div>
                  )}

                  {step && (
                    <div className="qbs-ml-2">
                      <CustomIcons
                        name="TreeUp_Arrow"
                        className={`qbs-text-gray-500 hover:qbs-text-dark qbs-cursor-pointer ${
                          isDisabled ? "qbs-hidden" : "qbs-block"
                        }`}
                        type="medium"
                        onClick={() => {
                          handleClick("up");
                        }}
                        onMouseDown={() => handleMouseDown("up")}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        viewBox={true}
                      />
                      <CustomIcons
                        name="TreeDown_Arrow"
                        className={`qbs-text-gray-500 hover:qbs-text-dark qbs-cursor-pointer ${
                          isDisabled ? "qbs-hidden" : "qbs-block"
                        }`}
                        type="medium"
                        onClick={() => {
                          handleClick("down");
                        }}
                        onMouseDown={() => handleMouseDown("down")}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        viewBox={true}
                      />
                    </div>
                  )}

                  {!isValid && isTooltip && errors && errors[name] && (
                    <div
                      className={` qbs-text-error-label qbs-relative qbs-bg-white qbs-cursor-pointer ${generateClassName(
                        "message"
                      )}`}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      <CustomIcons name="alert" type="medium" />
                    </div>
                  )}
                  {infoTitle && showInfo && (
                    <div
                      className={`  qbs-relative qbs-bg-white qbs-cursor-pointer qbs-text-[#667085] `}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      <CustomIcons name="infoCircle" type="medium" />
                    </div>
                  )}
                  {isValid && (
                    <div className="qbs-pl-2">
                      <CustomIcons
                        name="check_mark"
                        type="medium"
                        className="qbs-text-[#28B440]"
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
