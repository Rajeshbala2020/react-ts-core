import { FieldErrors, UseFormRegister } from 'react-hook-form';

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
    | 'custom_select'
    | 'auto_complete'
    | 'custom_search_select'
    | 'auto_suggestion';
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
  errorFlag?: boolean;
  selectedRowLimit?: number; // used for showing selected items rows limit, will show scroll if more items added
  topMargin?: number; // adjust dropdown postion manually if any overlap issue
  currentTab?: number; // current active tab
  selectedLabel?: string; // Able to change the "Item selected" label
  viewMode?: boolean; // show only selected items
  handleUpdateParent?: (val: boolean, level?: string) => void;
  isSeachable?: boolean; // show search input
  customDropOffset?: number; // adjust dropdown postion manually if any overlap issue
  showIcon?: boolean;
  handleShowIcon?: (node: any) => boolean;
  hasDisableSelection?: (node: any) => boolean;
}
export interface IconsProps {
  name: any;
  className?: string;
  onClick?: (e: any) => void;
  color?: string;
  type?: string;
  isWrapper?: boolean;
  viewBox?: boolean;
  svgClassName?: string;
  custDimension?: number;
  style?: any;
  hasCustomSize?: boolean;
  onMouseDown?: (e: any) => void;
  onMouseUp?: (e: any) => void;
  onMouseLeave?: (e: any) => void;
}
export interface IconProps {
  stroke?: number;
  className?: string;
  color?: string;
  width?: number;
  height?: number;
}
export interface TextFieldProps {
  id: string;
  name: string;
  label?: string;
  type?: string;
  decimal?: boolean;
  fullwidth?: boolean;
  step?: number;
  disabled?: boolean;
  uppercase?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  required?: boolean;
  labelTitle?: string;
  fieldEdit?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xxs';
  edited?: boolean;
  onEditComplete?: () => void;
  value?: string;
  onEditCancel?: () => void;
  adorement?: JSX.Element | string | undefined;
  autoComplete?: boolean;
  autoFocus?: boolean;
  register?: any;
  setFocus?: any;
  errors?: FieldErrors;
  isValid?: boolean;
  isTooltip?: boolean;
  className?: string;
  showValidityCheck?: boolean;
  maxLength?: number;
  max?: number;
  min?: number;
  minLength?: number;
  keyRegexPattern?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  adjustFieldLabel?: string;
  backGround?: any; //added for set background colour according to the form
  prefixes?: any;
  onPrefixChange?: (e: any) => void;
  prefixValue?: any;
  onStepUp?: () => void;
  onStepDown?: () => void;
  width?: number;
  adorementPosition?: 'start' | 'end';
  hideLabel?: boolean;
  defaultData?: string[];
  onCreatableChange?: (e: string[]) => void;
  infoTitle?: string;
  showInfo?: boolean;
}

export interface TextAreaProps {
  id: string;
  name: string;
  label?: string;
  rows?: number;
  fullwidth?: boolean;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  fieldEdit?: boolean;
  edited?: boolean;
  value?: string;
  onEditComplete?: () => void;
  onEditCancel?: () => void;
  adorement?: JSX.Element;
  autoComplete?: boolean;
  autoFocus?: boolean;
  hideLabel?: boolean;
  minLength?: number;
  maxLength?: number;
  register?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

  setFocus?: any;
  errors?: FieldErrors;
  boxHeight?: string;
  boxMinHeight?: number | string;
}
export interface CheckboxProps {
  id: string;
  name: string;
  label?: string;
  disabled?: boolean;
  intermediate?: boolean;
  labalClass?: string;
  className?: string;
  checked?: boolean;
  register?: UseFormRegister<any>;
  handleChange?: (e: any) => void;
  value?: string | number;
}
export interface RadioProps {
  id: string;
  name: string;
  label?: string;
  value?: string | number;
  checked?: boolean;
  disabled?: boolean;
  customLabel?: boolean;
  handleChange?: (e: any) => void;
  prefixNode?: React.ReactNode;
}
