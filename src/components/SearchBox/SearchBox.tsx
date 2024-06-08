import './SearchBox.css'; // Import the CSS file

import { FC } from 'react';

interface SearchAction {
  onChange: (x: any) => void;
  value: string;
}
const SearchBox: FC<SearchAction> = ({ onChange, value }) => {

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search..."
        value={value}
        onChange={onChange}
        className="search-input"
      />
    </div>
  );
};

export default SearchBox;