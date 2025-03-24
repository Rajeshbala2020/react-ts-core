import React from 'react'

import { CheckboxProps } from './commontypes'
import CustomIcons from './components/customIcons'

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
  labalClass
}) => {
  const getIconName = () => {
    if (checked) {
      if (disabled) {
        return intermediate
          ? 'input_intermediate_check_disabled'
          : 'input_checked_disabled'
      } else {
        return intermediate ? 'input_intermediate_check' : 'input_checked'
      }
    } else {
      return disabled ? 'input_unchecked_disabled' : 'input_unchecked'
    }
  }

  return (
    <div
      className={`text-common font-normal text-grey-secondary flex items-center justify-start gap-2.5 ${
        disabled ? ' opacity-70' : ''
      } `}
    >
      <div>
        <label className="relative">
          <input
            type="checkbox"
            disabled={disabled}
            name={name}
            autoComplete="off"
            className="border-none outline-none invisible "
            data-testid="app-common-checkbox"
            id={id ? `input-check-${id}` : `input-check-${name}`}
            value={value}
            checked={checked}
            onChange={handleChange}
          />

          <div
            className={`absolute top-[2px] left-0 text-text-primary ${propsClassName}  ${
              disabled ? 'cursor-not-allowed' : 'cursor-pointer'
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
      <div className={labalClass} title={label}>
        {label}
      </div>
    </div>
  );
}

export default Checkbox
