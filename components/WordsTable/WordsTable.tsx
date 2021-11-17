import React, { useState, useEffect, useRef, useContext } from 'react';
import { Table, Button, Spinner } from 'reactstrap';
import {
  FaSortAlphaDownAlt,
  FaSortAlphaDown,
  FaDownload,
  FaFileExport,
  FaSlideshare,
  FaRegCalendarPlus,
  FaEdit,
  FaTrashAlt,
} from 'react-icons/fa';
import { Checkbox } from 'pretty-checkbox-react';
import 'pretty-checkbox';
import { isMobile } from 'react-device-detect';
import { WordType, texts } from '@vocab/shared';
import { orderBy } from 'lodash';
import { Image } from '../Image';
import { WordField, STATES } from '../../constants';
import { LazyRenderItems } from '../LazyRender/LazyRenderItems';
import { SettingsContext } from '../../context/settings';
import styles from './styles.module.scss';

interface Props {
  words: WordType[];
  showDeleteModal(id: string): void;
  showEditModal(id: string | null): void;
  showDeleteManyWordsModal(ids: Set<string>): void;
  showDistributeModal(ids: Set<string>): void;
  showDownloadModal(ids: Set<string>): void;
  showExportModal(ids: Set<string>): void;
  hiddenLanguage: string;
  actionsAllowed: boolean;
}

export const WordsTable: React.FC<Props> = (props: Props) => {
  const {
    words,
    showDeleteModal,
    showEditModal,
    showDeleteManyWordsModal,
    showDistributeModal,
    showDownloadModal,
    showExportModal,
    hiddenLanguage,
    actionsAllowed,
  } = props;

  const [sortedWords, setSortedWords] = useState(words);
  const [sortField, setSortField] = useState<WordField>('en');
  const [isDescending, setIsDescending] = useState<boolean>(false);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [visibleItemsNumber, setVisibleItemsNumber] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = useContext(SettingsContext).settings
    .dictionaryWordsPerPage;
  const { interfaceLanguage } = useContext(SettingsContext).settings;
  const [isLoading, setisLoading] = useState(!isMobile);

  useEffect(() => {
    setSortedWords(orderBy(words, sortField, isDescending ? 'desc' : 'asc'));
  }, [sortField, isDescending, words]);

  const languageTableCell = (
    key: WordField,
    value: string,
    useCellWrapper?: boolean,
  ) => {
    if (key !== hiddenLanguage) {
      let cellValue = <span className={styles.value}>{value}</span>;
      if (useCellWrapper) cellValue = <td>{cellValue}</td>;

      return cellValue;
    }
  };

  const handleClick = (field: WordField) => {
    const order = sortField === field ? !isDescending : false;
    setSortField(field);
    setIsDescending(order);
  };

  const createSortableField = (key: WordField, label: string) => {
    if (key !== hiddenLanguage) {
      return (
        <th
          key={key}
          onClick={() => handleClick(key)}
          className={styles.sortColumn}
        >
          {label}{' '}
          {sortField === key &&
            (isDescending ? (
              <FaSortAlphaDownAlt color="gray" />
            ) : (
              <FaSortAlphaDown color="gray" />
            ))}
        </th>
      );
    }
  };

  const selectWord = (id: string) => {
    const newSelectedWords = new Set(selectedWords);
    newSelectedWords.has(id)
      ? newSelectedWords.delete(id)
      : newSelectedWords.add(id);
    setSelectedWords(newSelectedWords);
  };

  const onDeleteManyWords = () => {
    showDeleteManyWordsModal(selectedWords);
  };

  const areAllWordsSelected = selectedWords.size === sortedWords.length;
  const onCheckUncheckAllWords = () => {
    const allWords = areAllWordsSelected
      ? []
      : sortedWords.map((word) => word._id ?? '');
    setSelectedWords(new Set(allWords));
  };

  const badgeColor = (state: string) => {
    return Object.entries(STATES).filter((item) => item[0] === state)[0][1];
  };

  const renderItem = (word: WordType, i: number) => (
    <tr key={word._id}>
      <td>{i + 1}</td>
      <td>
        <Checkbox
          color="primary"
          state={selectedWords.has(word._id ?? '')}
          onChange={() => selectWord(word._id ?? '')}
        />
      </td>
      {languageTableCell('en', word.en, true)}
      {languageTableCell('ru', word.ru, true)}
      {languageTableCell('de', word.de, true)}
      <td>{word.hint}</td>
      <td>
        <Image img={word.img} alt={word.en} className={styles.image} />
      </td>
      {actionsAllowed && (
        <td>
          <span className={'badge badge-' + badgeColor(word.state)}>
            {word.state}
          </span>
        </td>
      )}
      <td>
        <div className={styles.colBtn}>
          {actionsAllowed && word._id && (
            <Button
              color="link"
              id={word._id}
              title={texts[interfaceLanguage].components.wordsTable.editWord}
              onClick={() => showEditModal(word._id)}
            >
              <FaEdit className={styles.icon} />
            </Button>
          )}
          {actionsAllowed && word._id && (
            <Button
              id={word._id}
              color="link"
              title={texts[interfaceLanguage].components.wordsTable.deleteWord}
              onClick={() => showDeleteModal(word._id)}
            >
              <FaTrashAlt className={styles.icon} />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );

  const renderItemMobile = (word: WordType, i: number) => (
    <div key={word._id} className={styles.wordMobile}>
      <div className={styles.colLeft}>
        <Image img={word.img} alt={word.en} className={styles.image} />
      </div>
      <div className={styles.colRight}>
        <span className={styles.lang}>{languageTableCell('en', word.en)}</span>
        <span className={styles.subLang}>
          {languageTableCell('de', word.de)}
        </span>
        <span className={styles.subLang}>
          {languageTableCell('ru', word.ru)}
        </span>
        <span className={styles.hint}>
          {word.hint ? `(${word.hint})` : null}
        </span>
      </div>
      <div className={styles.colLeft}>
        <div className={styles.btnHolder}>
          <Checkbox
            color="primary"
            state={selectedWords.has(word._id ?? '')}
            onChange={() => selectWord(word._id ?? '')}
          />
          {actionsAllowed && word._id && (
            <Button
              color="link"
              className={styles.btnCustom}
              id={word._id}
              title={texts[interfaceLanguage].components.wordsTable.editWord}
              onClick={() => showEditModal(word._id)}
            >
              <FaEdit className={styles.icon} />
            </Button>
          )}
          {actionsAllowed && word._id && (
            <Button
              id={word._id}
              color="link"
              className={styles.btnCustom}
              title={texts[interfaceLanguage].components.wordsTable.deleteWord}
              onClick={() => showDeleteModal(word._id)}
            >
              <FaTrashAlt className={styles.icon} />
            </Button>
          )}
        </div>
      </div>
      <div className={styles.colRight}>
        <div className={styles.badgeHolder}>
          <span className={'badge badge-' + badgeColor(word.state)}>
            {word.state}
          </span>
        </div>
      </div>
    </div>
  );


  const showSpinner = (isLoading: boolean) => {
    setisLoading(isLoading);
  };

  return (
    <>
      <div className={styles.selectedWords}>
        <div>
          <span className="font-weight-bold">
            {texts[interfaceLanguage].components.wordsTable.selected}{' '}
          </span>
          {selectedWords.size}
        </div>
        <div className={styles.btnHolder}>
          {selectedWords.size > 0 && (
            <div>
              <Button
                title={
                  texts[interfaceLanguage].components.wordsTable.toWordlist
                }
                color="link"
                onClick={() => showExportModal(selectedWords)}
              >
                <FaFileExport className={styles.icon} />
              </Button>
              <Button
                title={texts[interfaceLanguage].components.wordsTable.download}
                color="link"
                onClick={() => showDownloadModal(selectedWords)}
              >
                <FaDownload className={styles.icon} />
              </Button>
              {actionsAllowed && (
                <Button
                  title={
                    texts[interfaceLanguage].components.wordsTable.distribute
                  }
                  color="link"
                  onClick={() => showDistributeModal(selectedWords)}
                >
                  <FaSlideshare className={styles.icon} />
                </Button>
              )}
            </div>
          )}
          {actionsAllowed && selectedWords.size > 0 && (
            <Button
              title={texts[interfaceLanguage].components.wordsTable.deleteMany}
              color="link"
              onClick={onDeleteManyWords}
              className="btn btn-link"
            >
              <FaTrashAlt className={styles.icon} />
            </Button>
          )}
          {actionsAllowed && (
            <Button
              title={texts[interfaceLanguage].components.wordsTable.addWord}
              color="link"
              onClick={() => showEditModal(null)}
              className="btn btn-link"
            >
              <FaRegCalendarPlus className={styles.icon} />
            </Button>
          )}
        </div>
      </div>
      <div ref={elementRef}>
        {isMobile ? (
          <div className={styles.wordsMobile}>
            <LazyRenderItems
              data={sortedWords}
              elementRef={elementRef}
              renderItem={renderItemMobile}
              itemsPerPage={itemsPerPage}
              showSpinner={showSpinner}
              isMobile={isMobile}
              isLoading={isLoading}
              setVisibleItemsNumber={setVisibleItemsNumber}
            />
          </div>
        ) : (
          <Table className={styles.wordTable} striped responsive>
            <thead>
              <tr>
                <th></th>
                <th>
                  {sortedWords.length > 0 && (
                    <Checkbox
                      color="primary"
                      state={areAllWordsSelected}
                      title={
                        areAllWordsSelected
                          ? texts[interfaceLanguage].components.wordsTable
                              .uncheckAll
                          : texts[interfaceLanguage].components.wordsTable
                              .checkAll
                      }
                      onChange={onCheckUncheckAllWords}
                    />
                  )}
                </th>
                {createSortableField(
                  'en',
                  texts[interfaceLanguage].components.wordsTable.englishLabel,
                )}
                {createSortableField(
                  'ru',
                  texts[interfaceLanguage].components.wordsTable.russianLabel,
                )}
                {createSortableField(
                  'de',
                  texts[interfaceLanguage].components.wordsTable.germanLabel,
                )}
                {createSortableField(
                  'hint',
                  texts[interfaceLanguage].components.wordsTable.hintLabel,
                )}
                <th key="img">
                  {texts[interfaceLanguage].components.wordsTable.imageLabel}
                </th>
                {actionsAllowed &&
                  createSortableField(
                    'state',
                    texts[interfaceLanguage].components.wordsTable.stateLabel,
                  )}
                <th></th>
              </tr>
            </thead>
            <tbody>
              <LazyRenderItems
                data={sortedWords}
                elementRef={elementRef}
                renderItem={renderItem}
                itemsPerPage={itemsPerPage}
                showSpinner={showSpinner}
                isMobile={isMobile}
                isLoading={isLoading}
              />
            </tbody>
          </Table>
        )}
        {isMobile ? (
          <>
            <div className="text-center">{isLoading && <Spinner />}</div>
            <div className="text-center">
              {!isLoading && sortedWords.length > visibleItemsNumber && (
                <Button onClick={() => showSpinner(true)}>
                  {texts[interfaceLanguage].components.wordsTable.showMore}
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center">{isLoading && <Spinner />}</div>
        )}
      </div>
    </>
  );
};
