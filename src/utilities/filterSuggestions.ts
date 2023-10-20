interface Item {
  [key: string]: string;
}

export const filterSuggestions = (
  data: Item[],
  query: string,
  type: string,
  inputValue?: string
): Item[] => {
  if (type === 'custom_search_select' && query) {
    return data?.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }
  return sortedArrayData(data, inputValue);
};

const sortedArrayData = (
  filteredData: any[],
  selectedItems: any[] | string
) => {
  return [...filteredData].sort((a, b) => {
    let aIsSelected: boolean;
    let bIsSelected: boolean;

    if (Array.isArray(selectedItems)) {
      aIsSelected = selectedItems.some((item) => item.name === a.name);
      bIsSelected = selectedItems.some((item) => item.name === b.name);
    } else {
      aIsSelected = a.name === selectedItems;
      bIsSelected = b.name === selectedItems;
    }

    return (bIsSelected ? 1 : 0) - (aIsSelected ? 1 : 0);
  });
};
