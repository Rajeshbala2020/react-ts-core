# AutoComplete Component

`AutoComplete` is a React component that allows users to quickly find and select from a pre-populated list of values as they type, leveraging searching and filtering.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- 
- [Props](#props)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Installation

If your component is published on npm, users can install it using npm or yarn:



```jsx
import React from 'react';
import AutoComplete from 'your-package-name';

const ExampleComponent = () => {
  const handleChange = (value) => {
    console.log("Selected value: ", value);
  };

  return (
    <AutoComplete 
      label="Search"
      onChange={handleChange}
      // other props
    />
 

```
## Props

### `AutoComplete` Component Props

- **`id`** _(string, optional)_ - The ID of the input element.
- **`label`** _(string)_ - The label for the input element.
- **`fullWidth`** _(boolean, optional)_ - If true, the input will take up the full width of its container. Default is `false`.
- **`required`** _(boolean, optional)_ - If true, the input will be required. Default is `false`.
- **`value`** _(`valueProps`, optional)_ - The current selected value.
- **`onChange`** _(function)_ - Function to handle the change event.
- **`data`** _(array, optional)_ - The array of data for generating list suggestions.
- **`type`** _(string, optional)_ - Determines the type of autocomplete. Options are `'custom_select'`, `'auto_complete'`, and `'custom_search_select'`. Default is `'custom_select'`.
- **`placeholder`** _(string, optional)_ - Placeholder text for the input field.
- **`getData`** _(function, optional)_ - Asynchronous function to fetch data for suggestions.
- **`errors`** _(object, optional)_ - Any validation errors.
- **`name`** _(string)_ - The name of the input element.
- **`readOnly`** _(boolean, optional)_ - If true, the input is read-only. Default is `false`.
- **`disabled`** _(boolean, optional)_ - If true, the input is disabled. Default is `false`.

### `valueProps` Object Type

- **`id`** _(string)_ - The unique identifier of the value.
- **`name`** _(string)_ - The name of the value.

npm install qbs-core
