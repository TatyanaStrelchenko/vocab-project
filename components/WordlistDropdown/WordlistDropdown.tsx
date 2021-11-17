import React, { useState, useEffect, useContext } from 'react';
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { Wordlist, texts } from '@vocab/shared';
import { SettingsContext } from '../../context/settings';
import { getMyWordlists } from '../../services/wordlist-service';

interface Props {
  wordlistId: string | null;
  setWordlistId(id: string | null): void;
}

export const WordlistDropdown: React.FC<Props> = (props) => {
  const { wordlistId, setWordlistId } = props;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [wordlists, setWordlists] = useState<Wordlist[]>([]);
  const toggle = () => setDropdownOpen((prevState) => !prevState);
  const { interfaceLanguage } = useContext(SettingsContext).settings;

  useEffect(() => {
    loadWordlists();
  }, []);

  const loadWordlists = async () => {
    const response = await getMyWordlists();
    const data = response.data.wordlists;
    setWordlists(data);
  };
  const setWordlist = (wordlist: Wordlist | null) => {
    setWordlistId(wordlist ? wordlist._id : null);
  };
  const activeWordlist = wordlists.find((wl) => wl._id === wordlistId);

  return (
    <div className="text-center">
      <Dropdown
        isOpen={dropdownOpen}
        onClick={() => loadWordlists()}
        toggle={toggle}
      >
        <DropdownToggle outline color="primary" caret>
          {activeWordlist
            ? activeWordlist.name
            : texts[interfaceLanguage].components.wordlistDropdown.myDictionary}
        </DropdownToggle>
        <DropdownMenu>
          {activeWordlist && (
            <DropdownItem key="dictionary" onClick={() => setWordlist(null)}>
              {
                texts[interfaceLanguage].components.wordlistDropdown
                  .myDictionary
              }
            </DropdownItem>
          )}
          {wordlists
            .filter((wordlist) =>
              activeWordlist ? wordlist._id !== activeWordlist._id : wordlist,
            )
            .map((wordlist) => (
              <DropdownItem
                key={wordlist._id}
                onClick={() => setWordlist(wordlist)}
              >
                {wordlist.name}
              </DropdownItem>
            ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
