import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Container, Label } from 'reactstrap';
import { Checkbox } from 'pretty-checkbox-react';
import 'pretty-checkbox';
import { Wordlist, texts } from '@vocab/shared';
import { Loader } from '../../components/Loader';
import { SearchForm } from '../../components/SearchForm';
import { WordlistTable } from '../../components/WordlistTable';
import { Alert } from '../../components/Alert';
import { ModalWindow } from '../../components/ModalWindow';
import { EditWordlistForm } from '../../components/forms/EditWordlistForm';
import exercises from '../../components/exercises/exercises.module.scss';
import {
  getPublicWordlists,
  getMyWordlists,
  addWordlist,
  copyWordlist,
  blockWordlist,
  updateWordlist,
  deleteWordlists,
} from '../../services/wordlist-service';
import { addUserWords } from '../../services/word-service';
import { SettingsContext } from '../../context/settings';

type IAlert = {
  message: string;
  color: string;
};

interface Props {
  type: string;
}

export const Wordlists: React.FC<Props> = (props) => {
  const [loading, setLoading] = useState(true);
  const [wordlists, setWordlists] = useState<Wordlist[]>([]);
  const [filteredWordlists, setFilteredWordlists] = useState<Wordlist[]>([]);
  const [isEditModalShown, setIsEditModalShown] = useState(false);
  const [isDeleteModalShown, setIsDeleteModalShown] = useState(false);
  const [isCopyModalShown, setIsCopyModalShown] = useState(false);
  const [isImportModalShown, setIsImportModalShown] = useState(false);
  const [isBlockModalShown, setIsBlockModalShown] = useState(false);
  const [isWordlistBlocked, setIsWordlistBlocked] = useState(false);
  const [
    shouldDeleteDictionaryWords,
    setShouldDeleteDictionaryWords,
  ] = useState(false);
  const [formData, setFormData] = useState<FormData>(new FormData());
  const [alert, setAlert] = useState<IAlert | null>(null);
  const [isEditFormDisabled, setIsEditFormDisabled] = useState<boolean>(true);
  const [selectedWordlistIds, setSelectedWordlistIds] = useState<Set<string>>(
    new Set(),
  );
  const { interfaceLanguage } = useContext(SettingsContext).settings;

  useEffect(() => {
    setFilteredWordlists(wordlists);
  }, [wordlists]);

  const loadWordlists = useCallback(async () => {
    setLoading(true);
    const { data } =
      props.type === 'public'
        ? await getPublicWordlists()
        : await getMyWordlists();
    setWordlists(data.wordlists);
    setLoading(false);
  }, [props.type]);

  useEffect(() => {
    loadWordlists();
  }, [props.type, loadWordlists]);

  const showEditModal = (id: string | null) => {
    setIsEditModalShown(true);
    if (id) {
      setSelectedWordlistIds(new Set([id]));
    }
  };
  const onEditConfirm = async () => {
    setIsEditModalShown(false);
    setLoading(true);
    const { data } = selectedWordlistIds.size
      ? await updateWordlist(Array.from(selectedWordlistIds)[0], formData)
      : await addWordlist(formData);
    setAlert({
      message: data.message,
      color: data.error ? 'danger' : 'success',
    });
    setSelectedWordlistIds(new Set());
    loadWordlists();
  };

  const showDeleteModal = (id: string) => {
    setIsDeleteModalShown(true);
    setSelectedWordlistIds(new Set([id]));
  };
  const showDeleteManyWordsModal = (ids: Set<string>) => {
    setIsDeleteModalShown(true);
    setSelectedWordlistIds(ids);
  };
  const onDeleteConfirm = async () => {
    setIsDeleteModalShown(false);
    if (selectedWordlistIds.size) {
      setLoading(true);
      const { data } = await deleteWordlists(
        Array.from(selectedWordlistIds),
        shouldDeleteDictionaryWords,
      );
      setAlert({
        message: data.message,
        color: data.error ? 'danger' : 'success',
      });
      setSelectedWordlistIds(new Set());
      loadWordlists();
    }
  };

  const showCopyModal = (id?: string) => {
    setIsCopyModalShown(true);
    if (id) {
      setSelectedWordlistIds(new Set([id]));
    }
  };
  const onCopyConfirm = async () => {
    setIsCopyModalShown(false);
    if (selectedWordlistIds.size) {
      setLoading(true);
      const { data } = await copyWordlist(Array.from(selectedWordlistIds)[0]);
      setAlert({
        message: data.message,
        color: data.error ? 'danger' : 'success',
      });
      setSelectedWordlistIds(new Set());
      loadWordlists();
    }
  };

  const showImportWordsModal = (ids: Set<string>) => {
    setIsImportModalShown(true);
    setSelectedWordlistIds(ids);
  };
  const onImportConfirm = async () => {
    setIsImportModalShown(false);
    if (selectedWordlistIds.size) {
      setLoading(true);
      const { data } = await addUserWords(Array.from(selectedWordlistIds));
      setAlert({
        message: data.message,
        color: data.error ? 'danger' : 'success',
      });
      setSelectedWordlistIds(new Set());
      loadWordlists();
    }
  };

  const showBlockModal = (id: string, isBlocked: boolean) => {
    setIsBlockModalShown(true);
    setIsWordlistBlocked(isBlocked);
    setSelectedWordlistIds(new Set([id]));
  };
  const onBlockConfirm = async () => {
    setIsBlockModalShown(false);
    if (selectedWordlistIds.size) {
      setLoading(true);
      const { data } = await blockWordlist(Array.from(selectedWordlistIds)[0]);
      setAlert({
        message: data.message,
        color: data.error ? 'danger' : 'success',
      });
      setSelectedWordlistIds(new Set());
      loadWordlists();
    }
  };

  return (
    <Container>
      <h1 className={exercises.exerciseTitle}>
        {props.type === 'public'
          ? texts[interfaceLanguage].pages.wordlists.titlePublic
          : texts[interfaceLanguage].pages.wordlists.titleMy}
      </h1>
      {loading ? (
        <Loader />
      ) : (
        <>
          <SearchForm
            items={wordlists}
            setFilteredItems={setFilteredWordlists}
            entity={
              props.type === 'public' ? 'publicWordlists' : 'privateWordlists'
            }
          />
          <WordlistTable
            type={props.type}
            wordlists={filteredWordlists}
            showDeleteModal={showDeleteModal}
            showDeleteManyWordsModal={showDeleteManyWordsModal}
            showEditModal={showEditModal}
            showCopyModal={showCopyModal}
            showImportWordsModal={showImportWordsModal}
            showBlockModal={showBlockModal}
          />
        </>
      )}

      <ModalWindow
        isShown={isEditModalShown}
        title={
          selectedWordlistIds.size
            ? texts[interfaceLanguage].pages.wordlists.editWordlist
            : texts[interfaceLanguage].pages.wordlists.addWordlist
        }
        onCancel={() => setIsEditModalShown(false)}
        onConfirm={onEditConfirm}
        isDisabled={isEditFormDisabled}
        modalSize="xl"
      >
        <EditWordlistForm
          oldWordlistId={Array.from(selectedWordlistIds)[0]}
          setFormData={setFormData}
          setIsEditFormDisabled={setIsEditFormDisabled}
          isPublic={props.type === 'public'}
        ></EditWordlistForm>
      </ModalWindow>

      <ModalWindow
        isShown={isDeleteModalShown}
        confirmColor="danger"
        title={
          texts[interfaceLanguage].pages.wordlists.deleteWordlistModalTitle
        }
        onCancel={() => setIsDeleteModalShown(false)}
        onConfirm={onDeleteConfirm}
      >
        {texts[interfaceLanguage].pages.wordlists.deleteWordlistConfirmation}
        <hr />
        <Checkbox
          id="shouldDeleteDictionaryWords"
          color="primary"
          state={shouldDeleteDictionaryWords}
          onChange={() =>
            setShouldDeleteDictionaryWords(!shouldDeleteDictionaryWords)
          }
        />
        <Label for="shouldDeleteDictionaryWords">
          {
            texts[interfaceLanguage].pages.wordlists
              .checkRemoveFromDictionaryAndWordlists
          }
        </Label>
      </ModalWindow>

      <ModalWindow
        isShown={isCopyModalShown}
        title={texts[interfaceLanguage].pages.wordlists.copyWordlistModalTitle}
        onCancel={() => setIsCopyModalShown(false)}
        onConfirm={onCopyConfirm}
      >
        {texts[interfaceLanguage].pages.wordlists.copyWordlistConfirmation}
      </ModalWindow>

      <ModalWindow
        isShown={isImportModalShown}
        title={
          texts[interfaceLanguage].pages.wordlists.importWordlistModalTitle
        }
        onCancel={() => setIsImportModalShown(false)}
        onConfirm={onImportConfirm}
      >
        {texts[interfaceLanguage].pages.wordlists.importWordlistConfirmation}
      </ModalWindow>

      <ModalWindow
        isShown={isBlockModalShown}
        title={texts[interfaceLanguage].pages.wordlists.blockWordlistModalTitle}
        onCancel={() => setIsBlockModalShown(false)}
        onConfirm={onBlockConfirm}
      >
        {isWordlistBlocked
          ? texts[interfaceLanguage].pages.wordlists.unblockWordlistConfirmation
          : texts[interfaceLanguage].pages.wordlists.blockWordlistConfirmation}
      </ModalWindow>

      {alert && (
        <Alert
          message={alert.message}
          color={alert.color}
          onHide={() => setAlert(null)}
        />
      )}
    </Container>
  );
};
