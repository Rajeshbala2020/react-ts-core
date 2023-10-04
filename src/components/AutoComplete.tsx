import * as React from 'react';

const AutoComplete = (props: any) => {
  return (
    <React.Fragment>
      <input placeholder="AutoComplete" name={props?.name} />
    </React.Fragment>
  );
};

export default AutoComplete;
