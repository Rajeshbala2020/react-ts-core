import React from 'react';

import { CheckboxProps } from './commontypes';
import CustomIcons from './components/customIcons';

const Checkbox: React.FC<CheckboxProps> = ({
  name,
  id,
  label,
  intermediate,
  handleChange = undefined,
  disabled = false,
  checked,
  className: propsClassName,
  value,
  labalClass,
}) => {
  const getIconName = () => {
    if (checked) {
      if (disabled) {
        return intermediate
          ? 'input_intermediate_check_disabled'
          : 'input_checked_disabled';
      } else {
        return intermediate ? 'input_intermediate_check' : 'input_checked';
      }
    } else {
      return disabled ? 'input_unchecked_disabled' : 'input_unchecked';
    }
  };

  return (
    <div
      className={`text-common qbs-font-normal text-grey-secondary qbs-flex qbs-items-center qbs-justify-start qbs-gap-2 ${
        disabled ? 'qbs-opacity-70' : ''
      } `}
    >
      <div className="qbs-w-4 qbs-h-4">
        <label className="qbs-relative">
          <input
            type="checkbox"
            disabled={disabled}
            name={name}
            autoComplete="off"
            className="qbs-border-none qbs-outline-none qbs-invisible"
            data-testid="app-common-checkbox"
            id={id ? `input-check-${id}` : `input-check-${name}`}
            value={value}
            checked={checked}
            onChange={handleChange}
          />

          <div
            className={`qbs-absolute qbs-top-0 qbs-left-0 text-text-primary ${propsClassName}  ${
              disabled ? 'qbs-cursor-not-allowed' : 'qbs-cursor-pointer'
            }`}
          >
            {checked ? (
              <CustomIcons name={getIconName()} isWrapper={false} />
            ) : (
              <CustomIcons name="input_unchecked" isWrapper={false} />
            )}
          </div>
        </label>
      </div>
      <div className={labalClass}>{label}</div>
    </div>
  );
};

export default Checkbox;
