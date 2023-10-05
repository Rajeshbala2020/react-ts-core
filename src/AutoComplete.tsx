import React, { useEffect, useState } from 'react';

import { Close, DropArrow, Spinner } from './utilities/icons';

type valueProps = {
  id: string;
  name: string;
};
interface AutoSuggestionInputProps {
  id?: string;
  label: string;
  fullWidth?: boolean;
  required?: boolean;
  value?: valueProps;
  onChange: (value?: valueProps) => void;
  data?: any[];
  type?: 'custom_select' | 'auto_complete' | 'custom_search_select';
  placeholder?: string;
  getData?: (key?: string) => Promise<any>;
  errors?: any;
  name: string;
  readOnly?: boolean;
  disabled?: boolean;
}

const AutoComplete: React.FC<AutoSuggestionInputProps> = ({
  label,
  onChange,
  getData,
  data,
  errors,
  required = true,
  name,
  fullWidth,
  placeholder,
  id,
  type = 'custom_select',
  readOnly,
  disabled,
  value,
}) => {
  const [inputValue, setInputValue] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dropOpen, setDropOpen] = useState<boolean>(false);

  const [suggestions, setSuggestions] = useState<any>([]);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setInputValue(value);
    setDropOpen(true);
    if (value.trim() === '') {
      setSuggestions([]);
    }
    handleDropData(value);
  };
  const handleDropData = (value?: string) => {
    if (type === 'auto_complete') {
      handlePickSuggestions(value);
    } else if (
      (type === 'custom_select' || type === 'custom_search_select') &&
      (!data || data?.length === 0)
    ) {
      handlePickSuggestions();
    } else if (type === 'custom_search_select' && data && data?.length > 0) {
      const filteredData = value
        ? data.filter((item) =>
            item.name.toLowerCase().includes(value?.toLocaleLowerCase())
          )
        : data;
      setSuggestions(filteredData);
    }
  };
  const handlePickSuggestions = async (value?: string) => {
    setIsLoading(true);
    if (getData)
      try {
        const fetchedSuggestions = await getData(value);
        setSuggestions(fetchedSuggestions);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
  };
  const handleSuggestionClick = (suggestion: valueProps) => {
    onChange({ id: suggestion?.id, name: suggestion.name });
    setInputValue('');
    setDropOpen(false);
  };
  const handleOpen = () => {
    if (!suggestions || suggestions?.length === 0) handleDropData();
    if (!isLoading) {
      setDropOpen(!dropOpen);
    }
  };
  const handleClear = () => {
    setDropOpen(false);
    setInputValue('');
    onChange({ id: '', name: '' });
  };

  useEffect(() => {
    setInputValue(value?.name);
  }, [value?.name]);

  useEffect(() => {
    setSuggestions(data);
  }, [data]);

  const getErrors = (err: any) => {
    let errMsg = '';
    if (err.message) {
      errMsg = err?.message;
    }
    return errMsg;
  };
  const generateClassName = () => {
    let className = 'qbs-textfield-default';

    if (errors && errors[name]) {
      className += ' textfield-error';
    } else {
      className += ' textfield';
    }

    return className;
  };
  const handleClose = () => {
    setTimeout(() => {
      setDropOpen(false);
    }, 500);
  };
  return (
    <div className={fullWidth ? 'fullWidth' : 'autoWidth'}>
      {label && (
        <div className="mb-[4px] ">
          <label className={`labels label-text`}>
            {label}
            {required ? <span className="text-error"> *</span> : <></>}
          </label>
        </div>
      )}
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type="text"
          readOnly={readOnly ?? type === 'custom_select'}
          value={inputValue ?? { id: null, name: null }}
          onBlur={handleClose}
          disabled={disabled}
          data-testid="custom-autocomplete"
          className={generateClassName()}
          onChange={handleChange}
          placeholder={placeholder ?? 'Type to search...'}
        />
        <div className="qbs-autocomplete-close-icon">
          {value?.id && !disabled && !readOnly && (
            <button
              onClick={() => handleClear()}
              className=" text-error"
              aria-label="close"
            >
              <Close />
            </button>
          )}
          {isLoading && <Spinner />}
          <button
            disabled={disabled ?? readOnly}
            onClick={() => handleOpen()}
            onBlur={handleClose}
            className=" text-primary"
            data-testid="drop-arrow"
          >
            <DropArrow />
          </button>
        </div>
        {dropOpen && (
          <ul className="qbs-autocomplete-suggestions">
            {suggestions?.length > 0 ? (
              <>
                {suggestions.map((suggestion: any, index: number) => (
                  <li
                    className={`${
                      value?.id === suggestion?.id
                        ? 'qbs-autocomplete-suggestions-item is-selected'
                        : 'qbs-autocomplete-suggestions-item is-not-selected'
                    } additional-classes`}
                    key={suggestion?.id}
                    data-testid={suggestion.name}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.name}
                  </li>
                ))}
              </>
            ) : (
              <li
                className={`qbs-autocomplete-notfound `}
                onClick={() => handleClose()}
              >
                No Results Found
              </li>
            )}
          </ul>
        )}
      </div>
      {errors && errors[name] && (
        <div
          className="text-error text-error-label mt-[1px]"
          data-testid="autocomplete-error"
        >
          {getErrors(errors[name])}
        </div>
      )}
    </div>
  );
};

export default AutoComplete;
