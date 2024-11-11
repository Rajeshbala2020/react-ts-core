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
      className={`labels label-text flex items-center justify-start ${
        !customLabel && "gap-0"
      }  ${disabled ? " opacity-70" : ""} `}
    >
      <div>
        <label
          className={`radio-button ${
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <input
            type="radio"
            checked={checked}
            disabled={disabled}
            ref={radioRef}
            name={name}
            data-testid="app-common-radio"
            value={value}
            id={id}
            onChange={onChange}
          />
          <span className="radio"></span>
        </label>{" "}
      </div>
      <div
        className={`text-common font-normal cursor-pointer ${
          checked ? "text-secondary" : ""
        }`}
        onClick={labelClick}
      >
        {label}
      </div>
    </div>
  );
};

export default Radio;
