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
  initialLoad?: boolean
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
  initialLoad = false
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
      const newSuggestions = appendData ? [...suggestions, ...data] : data;
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dropOpen && suggestions.length === 0) {
      handlePickSuggestions('', paginationEnabled ? 1 : undefined);
    }
  }, [dropOpen]);

  return { suggestions, isLoading, handlePickSuggestions };
};
