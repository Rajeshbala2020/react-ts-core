import { useState, useEffect } from 'react';

type ValueProps = {
  id: string;
  name: string;
};

type UseSuggestionsType = (
  getData: (key?: string) => any,
  initialData?: ValueProps[],
  type?: string,
  dropOpen?: boolean
) => {
  suggestions: ValueProps[];
  isLoading: boolean;
  handlePickSuggestions: (value?: string) => Promise<void>;
};

export const useSuggestions: UseSuggestionsType = (
  getData,
  initialData = [],
  type = 'custom_select',
  dropOpen = false
) => {
  const [suggestions, setSuggestions] = useState<ValueProps[]>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePickSuggestions = async (value?: string) => {
    setIsLoading(true);
    try {
      const fetchedSuggestions = await getData(value);

      setSuggestions(fetchedSuggestions);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if ((!initialData || initialData?.length === 0) && dropOpen) {
      handlePickSuggestions();
    }
  }, [dropOpen]);

  return { suggestions, isLoading, handlePickSuggestions };
};
