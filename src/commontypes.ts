export type ValueProps = {
  [key: string]: string;
};
export type TabPops = {
  id: number | string;
  label: string;
};
export interface AutoSuggestionInputProps {
  id?: string;
  label?: string;
  fullWidth?: boolean;
  required?: boolean;
  value?: string;
  onChange: (value?: ValueProps | ValueProps[]) => void;
  data?: any[];
  type?:
    | "custom_select"
    | "auto_complete"
    | "custom_search_select"
    | "auto_suggestion";
  placeholder?: string;
  getData?: (
    key?: string,
    nextBlock?: number,
    tabValue?: number | string
  ) => any;
  errors?: any;
  name: string;
  readOnly?: boolean;
  disabled?: boolean;
  isMultiple?: boolean;
  desc?: string;
  descId?: string;
  singleSelect?: boolean;
  className?: string;
  async?: boolean;
  scrollRef?: any;
  paginationEnabled?: boolean;
  nextBlock?: number;
  initialLoad?: boolean;
  handleAction?: () => void;
  actionLabel?: string;
  notDataMessage?: string;
  initialDataMessage?: string;
  selectedItems?: any[];
  onFocus?: (e: React.FocusEvent<HTMLInputElement, Element>) => void;
  dopDownRef?: HTMLInputElement;
  expandable?: boolean;
  textCount?: number;
  itemCount?: number;
  isTreeDropdown?: boolean;
  flatArray?: boolean;
  parentField?: string;
  countOnly?: boolean; // only show selected items count
  typeOnlyFetch?: boolean; // async only call when typed any value
  tab?: TabPops[];
  clearTabSwitch?: boolean;
}
