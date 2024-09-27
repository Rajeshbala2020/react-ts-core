import React, { useState } from 'react';

import { AutoComplete, ExpandableAutoComplete } from '../src/index';

import '../src/styles/global.css';

export default function App() {
  const [dropData, setDropData] = useState();
  const [nexBlock, setNexBlock] = useState(1);
  const [prev, setPrev] = useState(1);

  const getData = (keyName?: string, next?: number) => {
    return fetch(
      keyName
        ? `https://jsonplaceholder.typicode.com/posts?_page=${next}&_limit=10&title_like=${keyName}`
        : `https://jsonplaceholder.typicode.com/posts?_page=${next}&_limit=10`
    )
      .then((res) => res.json())
      .then((res) => {
        setNexBlock(nexBlock + 1);
        const result = res.map((item: any) => {
          return { ...item, ['name']: item?.title, id: item?.id.toString() };
        });
        return result;
      });
  };
  const getDatas = (keyName?: string) => {
    return fetch(
      keyName
        ? `https://jsonplaceholder.typicode.com/posts?title_like=${keyName}`
        : `https://jsonplaceholder.typicode.com/posts`
    )
      .then((res) => res.json())
      .then((res) => {
        setPrev(prev + 1);
        const result = res.map((item: any) => {
          return { ...item, ['name']: item?.title, id: item?.id.toString() };
        });
        return result;
      });
  };
  return (
    <React.Fragment>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          padding: 20,

          overflowY: 'scroll',
        }}
      >
        <div className="autocomplete-section">
          <h2>Expandable Auto Suggestion</h2>
          <p>
            As you type, suggestions will appear based on your input, aiding in
            quicker and potentially more accurate data entry. This mode supports
            both listed and non-listed input, providing flexibility in user
            input while still offering assistance.
          </p>
        </div>
        <div style={{ width: 300 }}>
          <ExpandableAutoComplete
            label="Auto Suggestion"
            name="sample"
            type="auto_suggestion"
            // async
            desc="name"
            isMultiple
            expandable={true}
            descId="id"
            paginationEnabled={false}
            initialLoad={true}
            itemCount={5}
            // nextBlock={nexBlock}
            placeholder="Auto Suggestion Suggestion Suggestion Suggestion"
            selectedItems={[{ name: 'test', id: '1' }]}
            getData={getData}
            onChange={(e) => console.log(e, 'onchange')}
          />
        </div>
        <div style={{ width: 300 }}>
          <ExpandableAutoComplete
            label="Auto Suggestion"
            name="sample"
            type="auto_suggestion"
            // async
            desc="name"
            isMultiple
            expandable={true}
            isTreeDropdown={true}
            descId="id"
            paginationEnabled={false}
            initialLoad={true}
            itemCount={5}
            // nextBlock={nexBlock}
            placeholder="Auto Suggestion Suggestion Suggestion Suggestion"
            selectedItems={[{ name: 'test', id: '1' }]}
            getData={getData}
            onChange={(e) => console.log(e, 'onchange')}
          />
        </div>
        <div className="autocomplete-section">
          <h2>Custom Select</h2>
          <p>
            Select an option from a predefined static list. Ideal for a scenario
            when the available options are limited and known.
          </p>
        </div>
        <div style={{ width: 300 }}>
          <AutoComplete
            label="Custom Select"
            name="sample"
            placeholder="Custom Select"
            desc="name"
            descId="id"
            type="custom_select"
            data={[
              { name: 'test', id: '1' },
              { name: 'test1', id: '2' },

              { name: 'test2', id: '3' },

              { name: 'test3', id: '4' },
            ]}
            // getData={getData}
            onChange={() => console.log('onchange')}
          />
        </div>
        <div className="autocomplete-section">
          <h2>Auto Complete</h2>
          <p>
            Type in the input field and get real-time suggestions from
            dynamically fetched data. Useful for selecting from large datasets
            where displaying all available options is impractical.
          </p>
        </div>
        <div style={{ width: 300 }}>
          <AutoComplete
            label="Auto Complete"
            name="sample"
            desc="name"
            paginationEnabled={true}
            nextBlock={nexBlock}
            descId="id"
            async={true}
            type="auto_complete"
            placeholder="Auto Complete"
            // data={[{ name: 'test', id: '1' }]}
            getData={getData}
            onChange={() => console.log('onchange')}
          />
        </div>
        <div style={{ width: 300 }}>
          <AutoComplete
            label="Auto Complete"
            name="sample"
            desc="name"
            descId="id"
            async={false}
            type="auto_complete"
            placeholder="Auto Complete"
            // data={[{ name: 'test', id: '1' }]}
            getData={getDatas}
            onChange={() => console.log('onchange')}
          />
        </div>
        <div className="autocomplete-section">
          <h2>Custom Search Select</h2>
          <p>
            This allows you to search through static data, providing a filtered
            list based on your query or select from available items. Optimal for
            scenarios where you might have predefined options but also want to
            enable users to quickly narrow down their choices.
          </p>
        </div>

        <div style={{ width: 300 }}>
          <AutoComplete
            label="Custom Search Select"
            name="sample"
            placeholder="Custom Search Select"
            desc="name"
            descId="id"
            type="custom_search_select"
            data={[
              { name: 'Apple', id: '1' },
              { name: 'Banana', id: '2' },
              { name: 'Cherry', id: '3' },
              { name: 'Date', id: '4' },
              { name: 'Fig', id: '5' },
              { name: 'Grape', id: '6' },
              { name: 'Honeydew', id: '7' },
              { name: 'Kiwi', id: '8' },
              { name: 'Lemon', id: '9' },
              { name: 'Mango', id: '10' },
            ]}
            onChange={() => console.log('onchange')}
          />
        </div>
        <div className="autocomplete-section">
          <h2>Auto Suggestion</h2>
          <p>
            As you type, suggestions will appear based on your input, aiding in
            quicker and potentially more accurate data entry. This mode supports
            both listed and non-listed input, providing flexibility in user
            input while still offering assistance.
          </p>
        </div>
        <div style={{ width: 300 }}>
          <AutoComplete
            label="select Auto Suggestion"
            name="sample"
            type="auto_suggestion"
            desc="name"
            descId="id"
            async
            placeholder="Auto Suggestion"
            // data={[{ name: 'test', id: '1' }]}
            getData={getData}
            onChange={() => console.log('onchange')}
          />
        </div>
        <div style={{ width: 300 }}>
          <AutoComplete
            label="Auto Suggestion"
            name="sample"
            type="auto_suggestion"
            required
            desc="name"
            async
            isMultiple
            descId="id"
            placeholder="Auto Suggestion"
            selectedItems={[{ name: 'test', id: '1' }]}
            // data={[{ name: 'test', id: '1' }]}
            getData={getData}
            onChange={(value) => console.log(value, 'onchange')}
          />
        </div>
        <div style={{ width: 300 }}>
          <AutoComplete
            label="Auto Suggestion"
            name="sample"
            type="auto_suggestion"
            // async
            desc="name"
            singleSelect
            descId="id"
            paginationEnabled={false}
            initialLoad={true}
            // nextBlock={nexBlock}
            placeholder="Auto Suggestion"
            selectedItems={[{ name: 'test', id: '1' }]}
            getData={getData}
            onChange={(e) => console.log(e, 'onchange')}
          />
        </div>

        <div className="autocomplete-section">
          <h2>Expandable Auto Suggestion</h2>
          <p>
            As you type, suggestions will appear based on your input, aiding in
            quicker and potentially more accurate data entry. This mode supports
            both listed and non-listed input, providing flexibility in user
            input while still offering assistance.
          </p>
        </div>
        <div style={{ width: 300 }}>
          <ExpandableAutoComplete
            label="Auto Suggestion"
            name="sample"
            type="auto_suggestion"
            // async
            desc="name"
            isMultiple
            expandable={true}
            descId="id"
            paginationEnabled={false}
            initialLoad={true}
            itemCount={5}
            // nextBlock={nexBlock}
            placeholder="Auto Suggestion Suggestion Suggestion Suggestion"
            selectedItems={[{ name: 'test', id: '1' }]}
            getData={getData}
            onChange={(e) => console.log(e, 'onchange')}
          />
        </div>
      </div>
    </React.Fragment>
  );
}
