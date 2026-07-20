import React, { useRef } from "react";

import { RadioProps } from "./commontypes";

const Radio: React.FC<RadioProps> = ({
  name,
  id,
  label,
  checked,
  value = undefined,
  handleChange,
  disabled = false,
  customLabel,
  prefixNode,
}) => {
  const radioRef = useRef<HTMLInputElement>(null);
  const onChange = (e: any) => {
    handleChange?.(e);
  };
  const labelClick = () => {
    if (radioRef.current) {
      radioRef.current.click();
    }
  };
  return (
    <div
      className={`labels qbs-label-text qbs-flex qbs-items-center qbs-justify-start qbs-custom-radio-container ${
        !customLabel && 'qbs-gap-0'
      }  ${disabled ? 'qbs-opacity-70' : ''} `}
    >
      <div>
        <label
          className={`qbs-radio-button ${
            disabled ? 'qbs-cursor-not-allowed' : 'qbs-cursor-pointer'
          }`}
        >
          <input
            type="radio"
            autoComplete="off"
            checked={checked}
            disabled={disabled}
            id={id ? `input-button-${id}` : `input-button-${name}`}
            ref={radioRef}
            name={name}
            data-testid="app-common-radio"
            value={value}
            onChange={onChange}
          />
          <span className="radio"></span>
        </label>{' '}
      </div>
      {prefixNode && <div>{prefixNode}</div>}
      <div
        className={`text-common qbs-font-normal qbs-cursor-pointer ${
          checked ? 'qbs-text-secondary' : ''
        }`}
        onClick={labelClick}
      >
        {label}
      </div>
    </div>
  );
};

export default Radio;
