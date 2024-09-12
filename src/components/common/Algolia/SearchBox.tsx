import {
  useEffect,
  useRef,
  useState,
  ChangeEvent,
  ComponentProps,
} from 'react';
import { useSearchBox, UseSearchBoxProps } from 'react-instantsearch-hooks';

import { ControlledSearchBox } from 'components/common/Algolia/ControlledSearchBox';

export type SearchBoxProps = ComponentProps<'div'> & UseSearchBoxProps;

export const SearchBox = (props: SearchBoxProps) => {
  const { query, refine, isSearchStalled } = useSearchBox(props);
  const [value, setValue] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  const onReset = () => {
    setValue('');
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.currentTarget.value);
  };

  useEffect(() => {
    if (query !== value) {
      refine(value);
    }
  }, [value, refine]);

  return (
    <ControlledSearchBox
      className={props.className}
      inputRef={inputRef}
      isSearchStalled={isSearchStalled}
      onChange={onChange}
      onReset={onReset}
      placeholder={props.placeholder}
      value={value}
    />
  );
};
