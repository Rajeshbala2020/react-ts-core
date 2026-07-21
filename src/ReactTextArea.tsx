import React, { useEffect, useRef, useState } from 'react';

import { TextAreaProps } from './commontypes';
import CustomIcons from './components/customIcons';
import { getInnerWidth } from './utilities/generateInnerWidth';
import { applyPositionClass } from './utilities/getPosition';

const ModernTextArea: React.FC<TextAreaProps> = ({
  name,
  id,
  label,
  rows = 5,
  disabled = false,
  fullwidth = true,
  placeholder,
  className: propsClassName,
  register,
  fieldEdit = false,
  required = false,
  autoComplete = false,
  autoFocus = false,
  onEditComplete,
  onEditCancel,
  boxHeight,
  boxMinHeight,
  errors,
  onChange,
  value,
  hideLabel = false,
}) => {
  // const [editState, setEditState] = useState<boolean>(false)
  const [isDisabled, setIsDisabled] = useState<boolean>(disabled);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const adorementRef = useRef<HTMLDivElement>(null);
  // const onEditIconClick = () => {
  //   setEditState(true)
  //   setIsDisabled(false)
  // }
  // const onCancelIconClick = () => {
  //   setEditState(false)
  //   setIsDisabled(true)
  //   if (onEditCancel) {
  //     onEditCancel()
  //   }
  // }
  // const onSaveIconClick = () => {
  //   setEditState(false)
  //   setIsDisabled(true)
  //   if (onEditComplete) {
  //     onEditComplete()
  //   }
  // }
  // useEffect(() => {
  //   if (editState) {
  //     inputRef?.current?.focus()
  //   }
  // }, [editState, name])
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
  const getErrors = (err: any) => {
    let errMsg = '';
    if (err.message) {
      errMsg = err?.message;
    }
    return errMsg;
  };
  const generateClassName = (
    type: 'input' | 'label' | 'message' | 'adorement'
  ): string => {
    let className = `qbs-resize-none ${propsClassName}`;
    switch (type) {
      case 'input':
        className += ` qbs-block text-common qbs-text-input-text qbs-font-normal qbs-px-3.5 qbs-py-2 qbs-w-full qbs-text-sm qbs-text-gray-900 qbs-bg-transparent qbs-border qbs-appearance-none focus:qbs-outline-none focus:qbs-ring-0 qbs-peer qbs-rounded-[4px] disabled:qbs-text-input-disabled disabled:qbs-bg-disabled ${
          hideLabel ? '' : 'placeholder-transparent'
        } focus:placeholder-grey-secondary`;
        if (errors && errors[name]) {
          className +=
            ' qbs-input-error';
        } else {
          className +=
            ' qbs-text-grey-dark qbs-border-input-light focus:qbs-border-blue-navy focus:qbs-outline-none focus:qbs-ring-0';
        }
        break;
      //   case 'label': // changes made for remove bg-white from placeolder is field disable and or with data
      //     className += ` modern-input-label peer-focus:modern-input-peer-focus-label-size qbs-absolute qbs-duration-300 qbs-transform -qbs-translate-y-4 qbs-top-6 qbs-z-1 qbs-origin-[0] qbs-px-0 // peer-placeholder-shown:qbs-translate-y-0 peer-placeholder-shown:qbs-top-[60%] peer-focus:qbs-top-2 // peer-focus:-qbs-translate-y-4 qbs-start-[14px] rtl:peer-focus:qbs-translate-x-1/4 rtl:peer-focus:qbs-left-auto  ${
      //   isDisabled ? 'qbs-cursor-pointer' : 'qbs-cursor-text peer-focus:qbs-cursor-pointer'
      // } ${
      //       !isDisabled || !checkIsEmptyField()
      //         ? 'active-input-label-bg'
      //         : isDisabled && !checkIsEmptyField()
      //         ? 'disabled-input-label-bg'
      //         : ''
      //     } ${
      //       checkIsEmptyField()
      //         ? 'modern-input-label-size'
      //         : 'modern-input-peer-focus-label-size'
      //     }`;

      //     if (errors && errors[name]) {
      //       className += ' qbs-text-error-light';
      //     } else {
      //       className += ' qbs-text-grey-dark peer-focus:qbs-text-blue-navy';
      //     }
      //     break;
      case 'label': // changes made for remove bg-white from placeolder is field disable and or with data
        className += ` qbs-flex modern-input-label-truncate peer-focus:modern-input-peer-focus-label-size qbs-absolute qbs-duration-300 qbs-transform -qbs-translate-y-4 qbs-top-1.5 qbs-z-1 qbs-origin-[0] qbs-px-0 peer-focus:-qbs-translate-y-4 qbs-start-[14px] rtl:peer-focus:qbs-translate-x-1/6 rtl:peer-focus:qbs-left-auto peer-placeholder-shown:qbs-translate-y-2 peer-placeholder-shown:qbs-top-[2px] peer-focus:qbs-top-1.5 peer-focus:-qbs-translate-y-4" ${
           isDisabled
             ? 'cursor-pointer'
             : 'cursor-text peer-focus:cursor-pointer'
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
          className += ' qbs-text-error-light';
        } else {
          className += ' qbs-text-grey-dark peer-focus:qbs-text-blue-navy';
        }
        break;

      case 'message':
        className='qbs-text-error-icon';
        break;
      case 'adorement':
        className +=
          'qbs-absolute qbs-right-0 qbs-py-4 adorement qbs-gap-1 qbs-flex qbs-items-center';
        break;
      default:
        break;
    }
    return className;
  };
  useEffect(() => {
    if (autoFocus) {
      onLabelClick();
    }
  }, [autoFocus]);
  // const getPosition = () => {
  //   return 'top'
  // }
  const handleError = (data: any) => {
    if (
      getErrors(data[name]) === 'required' ||
      getErrors(data[name]) === 'Required'
    ) {
      return `${label} is ${getErrors(data[name])}`;
    } else {
      return getErrors(data[name]) ?? '';
    }
  };
  const textFieldRef = useRef<HTMLDivElement>(null); // Ref for the text field div

  useEffect(() => {
    applyPositionClass(textFieldRef, isHovered);
  }, [isHovered]);
  return (
    <div ref={textFieldRef} className={` ${fullwidth ? 'qbs-w-full' : 'qbs-w-auto'}`}>
      <div className="tooltip-container">
        {isHovered && errors && errors[name] && (
          <span className="tooltip">{errors && handleError(errors)}</span>
        )}

        <div className={`qbs-flex qbs-relative ${fullwidth ? 'qbs-w-full' : 'qbs-w-auto'}`}>
          <div className="qbs-relative qbs-w-full">
            <textarea
              id={id ? `input-textarea-${id}` : `input-textarea-${name}`}
              ref={inputRef}
              disabled={isDisabled}
              data-testid="textarea"
              {...register?.(name, { required })}
              placeholder={placeholder || label}
              rows={rows || 5}
              onChange={onChange}
              value={value}
              style={{
                paddingRight: getInnerWidth(adorementRef, 11),
                height: boxHeight ?? undefined,
                minHeight: boxMinHeight ?? undefined,
              }}
              autoComplete={autoComplete ? 'on' : 'off'}
              // autoFocus={autoFocus}
              className={generateClassName('input')}
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
            <div className={generateClassName('adorement')} ref={adorementRef}>
              {errors && errors[name] && (
                <div
                  className={` qbs-text-error-label qbs-text-error-icon qbs-cursor-pointer qbs-relative ${generateClassName(
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
        </div>
      </div>
    </div>
  );
};

export default ModernTextArea;
