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
    let className = `resize-none ${propsClassName}`;
    switch (type) {
      case 'input':
        className += ` block text-common text-input-text font-normal px-3.5 py-2 w-full text-sm text-gray-900 bg-transparent  border  appearance-none   focus:outline-none focus:ring-0  peer  rounded-[4px] disabled:text-input-disabled disabled:bg-disabled ${
          hideLabel ? '' : 'placeholder-transparent'
        } focus:placeholder-grey-secondary`;
        if (errors && errors[name]) {
          className +=
            ' border-[#FDA29B] focus:border-error-[#FDA29B] focus:ring-[#FDA29B] focus:ring-3 ';
        } else {
          className +=
            ' text-grey-dark border-input-light focus:border-blue-navy   focus:outline-none  focus:ring-0';
        }
        break;
      //   case 'label': // changes made for remove bg-white from placeolder is field disable and or with data
      //     className += ` modern-input-label peer-focus:modern-input-peer-focus-label-size absolute duration-300 transform -translate-y-4 top-6 z-1 origin-[0] px-0
      // peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-[60%] peer-focus:top-2
      // peer-focus:-translate-y-4 start-[14px] rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto  ${
      //   isDisabled ? 'cursor-pointer' : 'cursor-text peer-focus:cursor-pointer'
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
      //       className += ' text-error-light ';
      //     } else {
      //       className += ' text-grey-dark peer-focus:text-blue-navy';
      //     }
      //     break;
      case 'label': // changes made for remove bg-white from placeolder is field disable and or with data
        className += ` modern-input-label peer-focus:modern-input-peer-focus-label-size absolute duration-300 transform -translate-y-4 top-1.5 z-1 origin-[0] px-0 
         peer-focus:-translate-y-4 start-[14px] rtl:peer-focus:translate-x-1/6 rtl:peer-focus:left-auto 
         peer-placeholder-shown:translate-y-2 peer-placeholder-shown:top-[2px] peer-focus:top-1.5 peer-focus:-translate-y-4" ${
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
          className += ' text-error-light ';
        } else {
          className += ' text-grey-dark peer-focus:text-blue-navy';
        }
        break;

      case 'message':
        className = ' text-error-icon ';
        break;
      case 'adorement':
        className +=
          '  absolute right-0 py-4 adorement gap-1 flex items-center ';
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
    <div ref={textFieldRef} className={` ${fullwidth ? 'w-full' : 'w-auto'}`}>
      <div className="tooltip-container">
        {isHovered && errors && errors[name] && (
          <span className="tooltip">{errors && handleError(errors)}</span>
        )}

        <div className={`flex relative ${fullwidth ? 'w-full' : 'w-auto'}`}>
          <div className="relative w-full">
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
          </div>
          <div className={generateClassName('adorement')} ref={adorementRef}>
            {errors && errors[name] && (
              <div
                className={` text-error-label text-error-icon cursor-pointer relative ${generateClassName(
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
  );
};

export default ModernTextArea;
