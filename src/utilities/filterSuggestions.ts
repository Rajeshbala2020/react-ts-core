interface Item {
  [key: string]: string;
}

export const filterSuggestions = (
  data: Item[],
  query: string,
  type: string,
  desc: string,
  inputValue?: string,
  async?: boolean
): Item[] => {
  if (
    (type === 'custom_search_select' ||
      type === 'auto_complete' ||
      type === 'auto_suggestion') &&
    !async &&
    query
  ) {
    return data?.filter((item) =>
      item[desc].toLowerCase().includes(query.toLowerCase())
    );
  }
  return sortedArrayData(data, inputValue, desc);
};

const sortedArrayData = (
  filteredData: any[],
  selectedItems: any[] | string,
  desc: any
) => {
  return [...filteredData].sort((a, b) => {
    let aIsSelected: boolean;
    let bIsSelected: boolean;

    if (Array.isArray(selectedItems)) {
      aIsSelected = selectedItems.some((item) => item[desc] === a[desc]);
      bIsSelected = selectedItems.some((item) => item[desc] === b[desc]);
    } else {
      aIsSelected = a[desc] === selectedItems;
      bIsSelected = b[desc] === selectedItems;
    }

    return (bIsSelected ? 1 : 0) - (aIsSelected ? 1 : 0);
  });
};
