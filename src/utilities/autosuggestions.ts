import { useEffect, useState } from "react";

type ValueProps = {
  [key: string]: string;
};

type UseSuggestionsType = (
  getData: (
    key?: string,
    next?: number,
    tabValue?: number | string,
    toolApply?: boolean
  ) => Promise<ValueProps[]>,
  initialData?: ValueProps[],
  dropOpen?: boolean,
  asyncFetch?: boolean,
  paginationEnabled?: boolean,
  initialLoad?: boolean,
  /** Current search text (main field and/or inline search); used when opening the dropdown */
  searchQuery?: string,
  isMultiple?: boolean,
  setNextPage?: (value: number) => void,
  selectedItems?: any[],
  typeOnlyFetch?: boolean
) => {
  suggestions: ValueProps[];
  isLoading: boolean;

  handlePickSuggestions: (
    value?: string,
    next?: number,
    append?: boolean,
    tabValue?: string | number,
    toolApply?: boolean
  ) => Promise<void>;
  resetSuggections?: () => void
};

export const useSuggestions: UseSuggestionsType = (
  getData,
  initialData = [],
  dropOpen = false,
  asyncFetch = false,
  paginationEnabled = false,
  initialLoad = false,
  searchQuery = "",
  isMultiple,
  setNextPage,
  selectedItems = [],
  typeOnlyFetch = false
) => {
  const [suggestions, setSuggestions] = useState<ValueProps[]>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const resetSuggections = () => {
    setSuggestions([]);
  }

  const handlePickSuggestions = async (
    value?: string,
    nextPage?: number,
    appendData?: boolean,
    tabValue?: string | number,
    toolApply?: boolean
  ) => {
    setIsLoading(true);
    try {
      const data = await (asyncFetch || initialLoad
        ? typeOnlyFetch && value === ""
          ? Promise.resolve([])
          : getData(value, nextPage, tabValue, toolApply)
        : Promise.resolve(initialData));
      if (!data || data?.length === 0) {
        setNextPage(undefined);
      }
      const newSuggestions = appendData ? [...suggestions, ...data] : data;
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!dropOpen) return;

    const q = searchQuery ?? '';

    if (!isMultiple) {
      if (!q || suggestions.length === 0) {
        setNextPage?.(1);
        handlePickSuggestions(q, paginationEnabled ? 1 : undefined);
      }
    } else if (
      suggestions.length === 0 ||
      !selectedItems ||
      selectedItems.length === 0
    ) {
      if (!typeOnlyFetch) {
        setNextPage?.(1);
        handlePickSuggestions(q, paginationEnabled ? 1 : undefined);
      }
    }
  }, [dropOpen]);

  return { suggestions, isLoading, handlePickSuggestions, resetSuggections};
};
