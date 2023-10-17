type ValueProps = {
  [key: string]: string;
};
export interface AutoSuggestionInputProps {
  id?: string;
  label?: string;
  fullWidth?: boolean;
  required?: boolean;
  value?: string;
  onChange: (value?: ValueProps) => void;
  data?: ValueProps[];
  type?:
    | 'custom_select'
    | 'auto_complete'
    | 'custom_search_select'
    | 'auto_suggestion';
  placeholder?: string;
  getData?: (key?: string) => any;
  errors?: any;
  name: string;
  readOnly?: boolean;
  disabled?: boolean;
  isMultiple?: boolean;
  desc: string;
  descId: string;
  singleSelect?: boolean;
  className?: string;
}
