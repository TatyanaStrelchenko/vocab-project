import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Input, InputGroup, InputGroupAddon, Button } from 'reactstrap';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { UserData, WordType, Wordlist, Language, texts } from '@vocab/shared';
import { SettingsContext } from '../../context/settings';
import {
  WORDS_SEARCH_FIELDS,
  PUBLIC_WORDLISTS_SEARCH_FIELDS,
  PRIVATE_WORDLISTS_SEARCH_FIELDS,
  USERS_SEARCH_FIELDS,
} from '../../constants';
import { Calendar } from '../Calendar';

interface SearchProps<T> {
  items: T[];
  hiddenLanguage?: Language;
  entity: 'words' | 'publicWordlists' | 'privateWordlists' | 'users';
  setFilteredItems(items: T[]): void;
}

const searchFields = {
  words: WORDS_SEARCH_FIELDS,
  publicWordlists: PUBLIC_WORDLISTS_SEARCH_FIELDS,
  privateWordlists: PRIVATE_WORDLISTS_SEARCH_FIELDS,
  users: USERS_SEARCH_FIELDS,
};

export const SearchForm = <T extends WordType | Wordlist | UserData>({
  items,
  hiddenLanguage,
  entity,
  setFilteredItems,
}: SearchProps<T>) => {
  const [inputValue, setInputValue] = useState('');
  const [calendarShown, setCalendarShown] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>();
  const [endDate, setEndDate] = useState<Date | null>();
  const { interfaceLanguage } = useContext(SettingsContext).settings;

  const getFilteredItems = useCallback(() => {
    let filteredItems = items;

    if (inputValue) {
      filteredItems = filteredItems.filter((item) => {
        return Object.values(searchFields[entity]).some((searchFields) => {
          if (searchFields === hiddenLanguage) return false;
          const field = String(item[searchFields as keyof T]);
          return field.toLowerCase().includes(inputValue.toLowerCase());
        });
      });
    }

    if (calendarShown && (startDate || endDate)) {
      filteredItems = filteredItems.filter((item) => {
        const wordlistItem: Wordlist = item as never;
        const isPublishedAfterStartDate = startDate
          ? new Date(startDate) < new Date(wordlistItem.lastPublishedDate)
          : true;
        const isPublishedBeforeEndDate = endDate
          ? new Date(wordlistItem.lastPublishedDate) < new Date(endDate)
          : true;

        return (
          wordlistItem.lastPublishedDate &&
          isPublishedAfterStartDate &&
          isPublishedBeforeEndDate
        );
      });
    }

    setFilteredItems(filteredItems);
  }, [
    calendarShown,
    endDate,
    entity,
    hiddenLanguage,
    inputValue,
    items,
    setFilteredItems,
    startDate,
  ]);

  useEffect(() => {
    getFilteredItems();
  }, [inputValue, startDate, endDate, getFilteredItems, calendarShown]);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value: searchValue } = event.target;
    setInputValue(searchValue);
    getFilteredItems();
  };

  return (
    <div className="custom-container mb-4 py-0">
      <InputGroup>
        <InputGroupAddon addonType="prepend" tag="label" htmlFor="searchInput">
          {texts[interfaceLanguage].components.searchForm.search}
        </InputGroupAddon>
        <Input
          id="searchInput"
          value={inputValue}
          onChange={onChange}
          placeholder={
            texts[interfaceLanguage].components.searchForm.placeholder
          }
        />
        {entity === 'publicWordlists' && (
          <Button
            className="m-0 mb-2 ml-2"
            outline
            color="secondary"
            onClick={() => setCalendarShown(!calendarShown)}
          >
            <FaRegCalendarAlt color="secondary" />
          </Button>
        )}
      </InputGroup>
      {calendarShown && (
        <Calendar
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
        />
      )}
    </div>
  );
};
