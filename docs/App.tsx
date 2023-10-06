import React from 'react';
import AutoComplete from '../src/AutoComplete';
import '../src/styles/global.css';

export default function App() {
  const getData = (keyName?: string) => {
    return fetch('https://jsonplaceholder.typicode.com/posts')
      .then((res) => res.json())
      .then((res) => {
        const result = res.map((item: any) => {
          return { ...item, ['name']: item?.title, id: item?.id.toString() };
        });
        console.log(result);
        return result;
      });
  };
  return (
    <React.Fragment>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ width: 200 }}>
          <AutoComplete
            label="Custom Select"
            name="sample"
            type="custom_select"
            data={[
              { name: 'test', id: '1' },
              { name: 'test1', id: '2' },

              { name: 'test2', id: '3' },

              { name: 'test3', id: '4' },
            ]}
            getData={getData}
            onChange={() => console.log('onchange')}
          />
        </div>
        <div style={{ width: 200 }}>
          <AutoComplete
            label="Auto Complete"
            name="sample"
            type="auto_complete"
            // data={[{ name: 'test', id: '1' }]}
            getData={getData}
            onChange={() => console.log('onchange')}
          />
        </div>
        <div style={{ width: 200 }}>
          <AutoComplete
            label="Custom Search Select"
            name="sample"
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
        <div style={{ width: 200 }}>
          <AutoComplete
            label="Auto Suggestion"
            name="sample"
            type="auto_suggestion"
            // data={[{ name: 'test', id: '1' }]}
            getData={getData}
            onChange={() => console.log('onchange')}
          />
        </div>
      </div>
    </React.Fragment>
  );
}
