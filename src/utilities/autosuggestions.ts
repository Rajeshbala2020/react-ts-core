import { useEffect, useState } from 'react';

type ValueProps = {
  [key: string]: string;
};

type UseSuggestionsType = (
  getData: (key?: string, next?: number) => Promise<ValueProps[]>,
  initialData?: ValueProps[],
  dropOpen?: boolean,
  asyncFetch?: boolean,
  paginationEnabled?: boolean,
  initialLoad?: boolean,
  inputValue?: string,
  isMultiple?: boolean,
  setNextPage?: (value: number) => void,
  selectedItems?: any[]
) => {
  suggestions: ValueProps[];
  isLoading: boolean;

  handlePickSuggestions: (
    value?: string,
    next?: number,
    append?: boolean
  ) => Promise<void>;
};

export const useSuggestions: UseSuggestionsType = (
  getData,
  initialData = [],
  dropOpen = false,
  asyncFetch = false,
  paginationEnabled = false,
  initialLoad = false,
  inputValue = '',
  isMultiple,
  setNextPage,
  selectedItems = []
) => {
  const [suggestions, setSuggestions] = useState<ValueProps[]>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePickSuggestions = async (
    value?: string,
    nextPage?: number,
    appendData?: boolean
  ) => {
    setIsLoading(true);
    try {
      const data = await (asyncFetch || initialLoad
        ? getData(value, nextPage)
        : Promise.resolve(initialData));
      if (!data || data?.length === 0) {
        setNextPage(undefined);
      }
      const newSuggestions = appendData ? [...suggestions, ...data] : data;
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dropOpen) {
      if (!isMultiple && (!inputValue || suggestions.length === 0)) {
        setNextPage(1);
        handlePickSuggestions('', paginationEnabled ? 1 : undefined);
      } else if (
        isMultiple &&
        (suggestions.length === 0 ||
          !selectedItems ||
          selectedItems?.length === 0)
      ) {
        handlePickSuggestions('', paginationEnabled ? 1 : undefined);
      }
    }
  }, [dropOpen]);

  return { suggestions, isLoading, handlePickSuggestions };
};
