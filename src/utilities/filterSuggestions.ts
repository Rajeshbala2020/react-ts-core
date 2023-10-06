interface Item {
  id: string;
  name: string;
}

export const filterSuggestions = (
  data: Item[],
  query: string,
  type: string
): Item[] => {
  if (type === 'custom_search_select' && query) {
    return data.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }
  return data;
};
