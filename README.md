# AutoComplete Component

The `AutoComplete` component offers a user-friendly input experience by presenting suggestions based on their input, allowing for efficient and interactive form filling. This component can work with both local and asynchronous data, and provides single and multi-select functionality.

## Table of Contents

- [AutoComplete Component](#autocomplete-component)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
  - [Props](#props)
  - [Contribution](#contribution)

## Features

- **Single & Multi-select**: Allows users to select a single or multiple suggestions.
- **Asynchronous Data Support**: Can fetch suggestions from an API or use local data.
- **Pagination**: Supports paginated data with a "Load More" feature.
- **Customizable**: Provides props for styling, placeholder text, and more.
- **Error Handling**: Displays validation errors.

## Installation

Before you can use the `AutoComplete` component, ensure you've imported it properly.

```bash

npm install qbs-core
```

```jsx
import {AutoComplete} from 'qbs-core';

function ExampleComponent() {
  return (
    <AutoComplete
      label="Search"
      onChange={handleChange}
      getData={fetchSuggestions}
      required={true}
      placeholder="Type to search..."
      type="auto_complete"
      async={true}
    />
  );
}

```

## Props

You can pass the following props to the `AutoComplete` component:

- **label** _(string)_: Label for the input field.
- **onChange** _(function)_: Callback when the value changes.
- **getData** _(function)_: Asynchronous function to retrieve suggestions. By default, it returns an empty array.
- **data** _(Array)_: Local data source for suggestions.
- **errors** _(object)_: Validation error messages.
- **required** _(boolean)_: Indicates if the input is mandatory. Defaults to false.
- **name** _(string)_: Name attribute for the input element.
- **fullWidth** _(boolean)_: If true, the input will take the full width of its container. Defaults to false.
- **placeholder** _(string)_: Placeholder text for the input.
- **id** _(string)_: ID attribute for the input element.
- **type** _(string)_: Determines the type of autocomplete (custom_select, auto_complete, or auto_suggestion). Defaults to custom_select.
- **readOnly** _(boolean)_: Makes the input read-only if set to true. Defaults to false.
- **disabled** _(boolean)_: Disables the input if set to true. Defaults to false.
- **value** _(string)_: Value of the input.
- **isMultiple** _(boolean)_: If true, allows for multiple selection. Defaults to false.
- **desc** _(string)_: The key name for displaying suggestion items. Defaults to 'name'.
- **descId** _(string)_: The key name for the unique ID of suggestion items. Defaults to 'id'.
- **singleSelect** _(boolean)_: If set to true, adds checkbox functionality in single-select mode.
- **className** _(string)_: CSS class for styling the input component.
- **async** _(boolean)_: If true, indicates that the `getData` function is asynchronous.
- **nextBlock** _(function or boolean)_: Function for pagination or boolean to determine if pagination is enabled.
- **paginationEnabled** _(boolean)_: If true, pagination for suggestions is enabled.

## Contribution

If you'd like to contribute to the improvement of the AutoComplete component, please follow the standard contribution guidelines for this project. Your feedback and contributions are valuable!

