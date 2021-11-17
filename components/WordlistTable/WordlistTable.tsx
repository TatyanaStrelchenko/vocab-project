import React, { useState, useContext, useEffect, useRef } from 'react';
import { Table, Button, Spinner } from 'reactstrap';
import { Link } from 'react-router-dom';
import {
  FaSortAlphaDownAlt,
  FaSortAlphaDown,
  FaRegCalendarPlus,
  FaEdit,
  FaTrashAlt,
  FaRegCopy,
  FaFileImport,
  FaEyeSlash,
  FaPlusCircle,
} from 'react-icons/fa';
import { Checkbox } from 'pretty-checkbox-react';
import 'pretty-checkbox';
import { Wordlist, texts } from '@vocab/shared';
import { orderBy } from 'lodash';
import { isMobile } from 'react-device-detect';
import { SettingsContext } from '../../context/settings';
import { WordlistField } from '../../constants';
import { getCurrentUser } from '../../services/auth-service';
import { LazyRenderItems } from '../LazyRender/LazyRenderItems';
import styles from './styles.module.scss';

interface Props {
  wordlists: Wordlist[];
  type: string;
  showDeleteModal(id: string | null): void;
  showDeleteManyWordsModal(ids: Set<string>): void;
  showEditModal(id: string | null): void;
  showCopyModal(id: string): void;
  showImportWordsModal(ids: Set<string>): void;
  showBlockModal(id: string, isBlocked: boolean): void;
}

export const WordlistTable: React.FC<Props> = (props) => {
  const {
    wordlists,
    type,
    showDeleteModal,
    showDeleteManyWordsModal,
    showEditModal,
    showCopyModal,
    showImportWordsModal,
    showBlockModal,
  } = props;

  const [sortedWordlists, setSortedWordlists] = useState(wordlists);
  const [selectedWordlists, setSelectedWordlists] = useState<Set<string>>(
    new Set(),
  );
  const { interfaceLanguage } = useContext(SettingsContext).settings;

  const [sortField, setSortField] = useState<WordlistField>('name');
  const [isDescending, setIsDescending] = useState<boolean>(false);
  const [visibleItemsNumber, setVisibleItemsNumber] = useState(0);

  const elementRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = useContext(SettingsContext).settings
    .dictionaryWordsPerPage;
  const [isLoading, setIsLoading] = useState(!isMobile);
  const [sortedFilteredWordLists, setSortedFilteredWordlists] = useState<
    Wordlist[]
  >([]);

  const handleClick = (lang: WordlistField) => {
    const order = sortField === lang ? !isDescending : false;
    setSortField(lang);
    setIsDescending(order);
  };

  const createSortableField = (
    key: WordlistField,
    label: string,
    alignRight?: boolean,
  ) => {
    return (
      <th
        key={key}
        onClick={() => handleClick(key)}
        className={alignRight ? styles.sortColumnRight : styles.sortColumn}
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
  };

  useEffect(() => {
    setSortedWordlists(
      orderBy(wordlists, sortField, isDescending ? 'desc' : 'asc'),
    );
  }, [isDescending, sortField, wordlists]);

  const selectWordlist = (id: string) => {
    const newSelectedWords = new Set(selectedWordlists);
    newSelectedWords.has(id)
      ? newSelectedWords.delete(id)
      : newSelectedWords.add(id);
    setSelectedWordlists(newSelectedWords);
  };
  const areAllWordsSelected = selectedWordlists.size === sortedWordlists.length;
  const onCheckUncheckAllWords = () => {
    const allWords = areAllWordsSelected
      ? []
      : sortedWordlists.map((wordlist) => wordlist._id ?? '');
    setSelectedWordlists(new Set(allWords));
  };
  const showImportModal = (id: string) => {
    showImportWordsModal(new Set([id]));
  };

  const publicationDate = (lastPublishedDate: Date) => {
    return new Date(lastPublishedDate).toLocaleString(interfaceLanguage, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
  };

  const user = getCurrentUser();

  useEffect(() => {
    const nextSortedWordlists = sortedWordlists.filter(
      (wordlist) =>
        wordlist.userID === user._id ||
        (type === 'public' && (!wordlist.isBlocked || user.role === 'admin')),
    );

    setSortedFilteredWordlists(nextSortedWordlists);
  }, [sortedWordlists, type, user._id, user.role]);

  const renderItem = (wordlist: Wordlist, i: number) => (
    <tr key={wordlist._id}>
      <td>{i + 1}</td>
      <td>
        <Checkbox
          color="primary"
          state={selectedWordlists.has(wordlist._id ?? '')}
          onChange={() => selectWordlist(wordlist._id ?? '')}
        />
      </td>
      <td>
        <Link to={`/wordlists/${wordlist._id}`}>{wordlist.name}</Link>
      </td>
      <td>{wordlist.words.length || 0} </td>
      {type === 'public' && <td> {wordlist.userName} </td>}
      {type === 'public' && (
        <td className="text-right">
          {wordlist.lastPublishedDate &&
            publicationDate(wordlist.lastPublishedDate)}
        </td>
      )}
      {type === 'my' && <td> {wordlist.privacyType} </td>}
      <td>
        {wordlist.isBlocked && (
          <span className="badge badge-danger">
            {texts[interfaceLanguage].components.wordlistTable.blocked}
          </span>
        )}
      </td>
      <td>
        <div className={styles.colBtn}>
          {wordlist.userID === user._id && wordlist._id && (
            <Button
              id={wordlist._id}
              color="link"
              title={
                texts[interfaceLanguage].components.wordlistTable
                  .editButtonTitle
              }
              onClick={() => showEditModal(wordlist._id)}
            >
              <FaEdit className={styles.icon} />
            </Button>
          )}
          {wordlist.userID === user._id && wordlist._id && (
            <Button
              id={wordlist._id}
              color="link"
              title={
                texts[interfaceLanguage].components.wordlistTable
                  .deleteButtonTitle
              }
              onClick={() => showDeleteModal(wordlist._id)}
            >
              <FaTrashAlt className={styles.icon} />
            </Button>
          )}
          {type === 'public' &&
            user.role === 'admin' &&
            user._id !== wordlist.userID &&
            wordlist._id && (
              <Button
                id={wordlist._id}
                color="link"
                title={
                  texts[interfaceLanguage].components.wordlistTable
                    .blockButtonTitle
                }
                onClick={() =>
                  showBlockModal(
                    wordlist._id ?? '',
                    wordlist.isBlocked ?? false,
                  )
                }
              >
                <FaEyeSlash className={styles.icon} />
              </Button>
            )}
          {type === 'public' && wordlist._id && (
            <Button
              id={wordlist._id}
              color="link"
              onClick={() => showImportModal(wordlist._id ?? '')}
              title={
                texts[interfaceLanguage].components.wordlistTable
                  .copyToDictionaryButtonTitle
              }
            >
              <FaFileImport className={styles.icon} />
            </Button>
          )}
          {type === 'public' && wordlist._id && (
            <Button
              id={wordlist._id}
              color="link"
              title={
                texts[interfaceLanguage].components.wordlistTable
                  .copyWordlistButtonTitle
              }
              onClick={() => showCopyModal(wordlist._id)}
              className="btn btn-link"
            >
              <FaRegCopy className={styles.icon} />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );

  const renderItemMobile = (wordlist: Wordlist, i: number) => (
    <div key={wordlist._id} className={styles.wordMobile}>
      <div className={styles.blockRow}>
        <div className={styles.col}>
          <Checkbox
            color="primary"
            state={selectedWordlists.has(wordlist._id ?? '')}
            onChange={() => selectWordlist(wordlist._id ?? '')}
          />
        </div>
        <div className={styles.col}>
          <Link to={`/wordlists/${wordlist._id}`} className={styles.listName}>{wordlist.name}</Link>
        </div>
        <div className={styles.col}>
          <span className={styles.countWords}>{wordlist.words.length || 0}<small> (words)</small></span>
        </div>
        <div className={styles.col}>
          {type === 'public' && <span> {wordlist.userName} </span>}
          {type === 'my' && <span> {wordlist.privacyType} </span>}
        </div>
        <div className={styles.col}>
          {wordlist.isBlocked && (
            <span className="badge badge-danger">
            {texts[interfaceLanguage].components.wordlistTable.blocked}
          </span>
          )}
          <div className={styles.colBtn}>
            {wordlist.userID === user._id && wordlist._id && (
              <Button
                id={wordlist._id}
                color="link"
                className={styles.btnCustom}
                title={
                  texts[interfaceLanguage].components.wordlistTable
                    .editButtonTitle
                }
                onClick={() => showEditModal(wordlist._id)}
              >
                <FaEdit className={styles.icon} />
              </Button>
            )}
            {wordlist.userID === user._id && wordlist._id && (
              <Button
                id={wordlist._id}
                color="link"
                className={styles.btnCustom}
                title={
                  texts[interfaceLanguage].components.wordlistTable
                    .deleteButtonTitle
                }
                onClick={() => showDeleteModal(wordlist._id)}
              >
                <FaTrashAlt className={styles.icon} />
              </Button>
            )}
            {type === 'public' &&
            user.role === 'admin' &&
            user._id !== wordlist.userID &&
            wordlist._id && (
              <Button
                id={wordlist._id}
                color="link"
                className={styles.btnCustom}
                title={
                  texts[interfaceLanguage].components.wordlistTable
                    .blockButtonTitle
                }
                onClick={() =>
                  showBlockModal(
                    wordlist._id ?? '',
                    wordlist.isBlocked ?? false,
                  )
                }
              >
                <FaEyeSlash className={styles.icon} />
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className={styles.blockRow}>
        {type === 'public' && (
          <div className={styles.dateHolder}>
            {wordlist.lastPublishedDate &&
            publicationDate(wordlist.lastPublishedDate)}
          </div>
        )}
        <div className={styles.btnRight}>
          {type === 'public' && wordlist._id && (
            <Button
              id={wordlist._id}
              color="link"
              className={styles.btnCustom}
              title={
                texts[interfaceLanguage].components.wordlistTable
                  .copyWordlistButtonTitle
              }
              onClick={() => showCopyModal(wordlist._id)}
            >
              <FaRegCopy className={styles.icon} />
            </Button>
          )}
          {type === 'public' && wordlist._id && (
            <Button
              id={wordlist._id}
              color="link"
              className={styles.btnCustom}
              onClick={() => showImportModal(wordlist._id ?? '')}
              title={
                texts[interfaceLanguage].components.wordlistTable
                  .copyToDictionaryButtonTitle
              }
            >
              <FaFileImport className={styles.icon} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className={styles.selectedWordlists}>
        <div className={styles.btnHolder}>
          <div>
            <span className="font-weight-bold">
              {texts[interfaceLanguage].components.wordlistTable.selected}
            </span>
            {selectedWordlists.size}
          </div>
          <div className={styles.colBtn}>
            {type === 'my' && selectedWordlists.size > 0 && (
              <Button
                color="link"
                onClick={() => showDeleteManyWordsModal(selectedWordlists)}
                title={
                  texts[interfaceLanguage].components.wordlistTable
                    .deleteManyButtonTitle
                }
                className="btn btn-link"
              >
                <FaTrashAlt className={styles.icon} />
              </Button>
            )}
            {type === 'public' && selectedWordlists.size > 0 && (
              <Button
                color="link"
                onClick={() => showImportWordsModal(selectedWordlists)}
                title={
                  texts[interfaceLanguage].components.wordlistTable
                    .addToDictionaryButtonTitle
                }
              >
                <FaPlusCircle className={styles.icon} />
              </Button>
            )}
            {(['admin', 'teacher'].includes(user.role) ||
              (!['admin', 'teacher'].includes(user.role) &&
                type !== 'public')) && (
              <Button
                color="link"
                onClick={() => showEditModal(null)}
                title={
                  texts[interfaceLanguage].components.wordlistTable
                    .addButtonTitle
                }
                className="btn btn-link"
              >
                <FaRegCalendarPlus className={styles.icon} />
              </Button>
            )}
          </div>
        </div>
      </div>
      <div ref={elementRef}>
        {isMobile ?
          <div className={styles.wordsMobile}>
            <LazyRenderItems
              data={sortedFilteredWordLists}
              elementRef={elementRef}
              renderItem={renderItemMobile}
              itemsPerPage={itemsPerPage}
              showSpinner={setIsLoading}
              isMobile={isMobile}
              isLoading={isLoading}
              setVisibleItemsNumber={setVisibleItemsNumber}
            />
          </div> :
          <Table className={styles.wordlistTable} striped responsive bordered>
            <thead>
              <tr>
                <th></th>
                <th>
                  {sortedWordlists.length > 0 && (
                    <Checkbox
                      color="primary"
                      state={areAllWordsSelected}
                      title={
                        areAllWordsSelected
                          ? texts[interfaceLanguage].components.wordlistTable
                              .uncheckAll
                          : texts[interfaceLanguage].components.wordlistTable
                              .checkAll
                      }
                      onChange={onCheckUncheckAllWords}
                    />
                  )}
                </th>
                {createSortableField(
                  'name',
                  texts[interfaceLanguage].components.wordlistTable.nameLabel,
                )}
                {createSortableField(
                  'words',
                  texts[interfaceLanguage].components.wordlistTable
                    .wordsNumberLabel,
                )}
                {type === 'public' &&
                  createSortableField(
                    'userName',
                    texts[interfaceLanguage].components.wordlistTable.userLabel,
                  )}
                {type === 'public' &&
                  createSortableField(
                    'lastPublishedDate',
                    texts[interfaceLanguage].components.wordlistTable
                      .publicationDateLabel,
                    true,
                  )}
                {type === 'my' &&
                  createSortableField(
                    'privacyType',
                    texts[interfaceLanguage].components.wordlistTable.typeLabel,
                  )}
                {createSortableField(
                  'isBlocked',
                  texts[interfaceLanguage].components.wordlistTable.statusLabel,
                )}
                <th></th>
              </tr>
            </thead>
            <tbody>
              <LazyRenderItems
                data={sortedFilteredWordLists}
                elementRef={elementRef}
                renderItem={renderItem}
                itemsPerPage={itemsPerPage}
                showSpinner={setIsLoading}
                isMobile={isMobile}
                isLoading={isLoading}
              />
            </tbody>
          </Table>}

        {isMobile ? (
          <>
            <div className="text-center">{isLoading && <Spinner />}</div>
            <div className="text-center">
              {!isLoading && sortedWordlists.length > visibleItemsNumber && (
                <Button onClick={() => setIsLoading(true)}>
                  {texts[interfaceLanguage].components.wordlistTable.showMore}
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
