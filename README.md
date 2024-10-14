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

npm install react-core-ts
```

```jsx
import { AutoComplete } from 'react-core-ts';

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
You can also use the `ExpandableAutoComplete` component, which will allow you to show all selected items and have the option to inline search.

```jsx
import { ExpandableAutoComplete } from 'react-core-ts';

function ExampleExpandableComponent() {
  return (
    <ExpandableAutoComplete
      label="Search"
      onChange={handleChange}
      getData={fetchSuggestions}
      placeholder="Type to search..."
      type="auto_suggestion"
      selectedItems={selectedItems}
      async={true}
      isMultiple={true}
      expandable={true}
    />
  );
}


```
You can also use the `AutoCompleteWithSelectedList` component, which will allow you to show all selected items at the bottom part of the suggection box. Also enabled these features along with this component, selected items count, clear all and expand more and tab menu features

```jsx
import { AutoCompleteWithSelectedList } from 'react-core-ts';

function ExampleSelectedListComponent() {
  return (
    <AutoCompleteWithSelectedList
      label="Search"
      onChange={handleChange}
      getData={fetchSuggestions}
      placeholder="Type to search..."
      type="auto_suggestion"
      selectedItems={selectedItems}
      async={true}
      isMultiple={true}
      countOnly={true}
    />
  );
}

function ExampleSelectedListWithTabComponent() {
  return (
    <AutoCompleteWithSelectedList
      label="Search"
      onChange={handleChange}
      getData={fetchSuggestions}
      placeholder="Type to search..."
      type="auto_suggestion"
      selectedItems={selectedItems}
      async={true}
      isMultiple={true}
      countOnly={true}
      typeOnlyFetch={true}
      tab={tabMenu}
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
- **notDataMessage** _(string)_: Custom `"No Results Found` message.

Additional props for the `ExpandableAutoComplete` component:

- **expandable** _(boolean)_: If true, enable the expandable feature.
- **textCount** _(number)_: Selected chip item text count; the default value will be `10`. If the text count is higher than this, it will show `...` prefix.
- **itemCount** _(number)_: Selected items count; the default value will be `1`. If more than this count is selected, then will show a `+ count more` button with tooltip.
- **initialDataMessage** _(string)_: Custom intial empty message `Type to search`.


Additional props for the `AutoCompleteWithSelectedList` component:

- **countOnly** _(boolean)_: If true, only shows selected items count.
- **typeOnlyFetch** _(boolean)_: If true, suggections only list when user types on the search box. This works only if `async: true`.
- **tab** _(Array)_:  Local data source for tabs, format should be `{id: nummber | string, label: string }`

## Contribution

If you'd like to contribute to the improvement of the AutoComplete component, please follow the standard contribution guidelines for this project. Your feedback and contributions are valuable!

