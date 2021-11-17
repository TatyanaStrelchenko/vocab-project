import React, {
  useState,
  useContext,
  useEffect,
  ChangeEvent,
  useCallback,
} from 'react';
import { differenceWith, isEqual } from 'lodash';
import { useParams, Link, Redirect } from 'react-router-dom';
import { useLastLocation } from 'react-router-last-location';
import { Container, Label, Progress, FormGroup } from 'reactstrap';
import 'pretty-checkbox';
import {
  Radio,
  RadioGroup,
  useRadioState,
  Checkbox,
} from 'pretty-checkbox-react';
import fileDownload from 'js-file-download';
import {
  WordType,
  WordStateField,
  Wordlist,
  Language,
  Progress as ProgressType,
  texts,
} from '@vocab/shared';
import { WordsTable } from '../../components/WordsTable';
import { Loader } from '../../components/Loader';
import { SearchForm } from '../../components/SearchForm';
import { ModalWindow } from '../../components/ModalWindow';
import { UploadForm } from '../../components/UploadForm';
import { Alert } from '../../components/Alert';
import { EditWordForm } from '../../components/forms/EditWordForm';
import { EditWordlistForm } from '../../components/forms/EditWordlistForm';
import { UploadedErrorsTable } from '../../components/UploadedErrorsTable';
import { ErrorReport } from '../../components/UploadedErrorsTable/UploadedErrorsTable';
import {
  getUserWords,
  deleteUserWords,
  updateUserWord,
  addUserWord,
  addUserWords,
} from '../../services/word-service';
import {
  getWordlist,
  addWordlist,
  updateWordlist,
  deleteWordlistWords,
  updateWordlistWord,
  addWordlistWord,
  getMyWordlists,
} from '../../services/wordlist-service';
import { changeWordsState } from '../../services/state-service';
import { socket } from '../../services/socket-service';
import { uploadWords } from '../../services/upload-service';
import { STATES, LANGUAGE_NAMES } from '../../constants';
import { calculatePercent } from '../../utils';
import { SettingsContext } from '../../context/settings';
import { getCurrentUser } from '../../services/auth-service';
import styles from './styles.module.scss';

interface ImportProgressResponse {
  progress: ProgressType;
  wordlistId?: string;
}

interface ImportFinishedResponse {
  uploaded: number;
  errors: ErrorReport[];
}

type IAlert = {
  message: string;
  color: string;
};

export const Dictionary: React.FC = () => {
  const user = getCurrentUser();
  const radio = useRadioState();
  const { wordlistId } = useParams();
  const lastLocation = useLastLocation();
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<WordType[]>([]);
  const [filteredWords, setFilteredWords] = useState<WordType[]>([]);
  const [isDeleteModalShown, setIsDeleteModalShown] = useState(false);
  const [isDistributeModalShown, setIsDistributeModalShown] = useState(false);
  const [isDownloadModalShown, setIsDownloadModalShown] = useState(false);
  const [isExportModalShown, setIsExportModalShown] = useState(false);
  const [isCreateWordlistModalShown, setIsCreateWordlistModalShown] = useState(
    false,
  );
  const [isImportModalShown, setIsImportModalShown] = useState(false);
  const [
    shouldDeleteDictionaryWords,
    setShouldDeleteDictionaryWords,
  ] = useState(wordlistId ? false : true);
  const [myWordlists, setMyWordlists] = useState<Wordlist[]>([]);
  const [isCurrentWordlistPublic, setIsCurrentWordlistPublic] = useState(false);
  const [selectedWordlistId, setSelectedWordlistId] = useState<string | null>(
    null,
  );
  const [importErrors, setImportErrors] = useState<ErrorReport[] | null>(null);
  const [wordsToOperate, setWordsToOperate] = useState<Set<string>>(new Set());
  const [alert, setAlert] = useState<IAlert | null>(null);
  const [isEditModalShown, setIsEditModalShown] = useState(false);
  const [editWordId, setEditWordId] = useState<string | null>(null);
  const [isEditFormDisabled, setIsEditFormDisabled] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>(new FormData());
  const [wordlistFormData, setWordlistFormData] = useState<FormData>(
    new FormData(),
  );
  const [wordsOperation, setWordsOperation] = useState<WordStateField>(
    'to distribute',
  );
  const [importProgress, setImportProgress] = useState<ProgressType | null>(
    null,
  );
  const [importWordlistId, setImportWordlistId] = useState<string>();
  const [wordlist, setWordlist] = useState<Wordlist | undefined>(undefined);
  const [noWordlistFound, setNoWordlistFound] = useState<boolean>(false);
  const [pageTitle, setPageTitle] = useState<string | JSX.Element>('');

  const { helpLanguage, learnLanguage, interfaceLanguage } = useContext(
    SettingsContext,
  ).settings;
  const hiddenLanguage: Language = differenceWith(
    Object.keys(LANGUAGE_NAMES) as Language[],
    [learnLanguage, helpLanguage],
    isEqual,
  )[0];

  const { errorsTableConfirmButtonText } = texts[
    interfaceLanguage
  ].pages.dictionary;

  useEffect(() => {
    setFilteredWords(words);
  }, [words]);

  const loadWords = useCallback(async () => {
    setLoading(true);
    const response = wordlistId
      ? await getWordlist(wordlistId)
      : await getUserWords();
    wordlistId && !response.data.wordlist && setNoWordlistFound(true);
    const data = wordlistId
      ? response.data.wordlist
        ? response.data.wordlist.words
        : []
      : response.data;
    setWordlist(wordlistId && response.data.wordlist);
    setWords(data);
    setLoading(false);
  }, [wordlistId]);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  const onDeleteConfirm = async () => {
    hideModal();
    if (wordsToOperate.size) {
      setLoading(true);
      wordlistId
        ? await deleteWordlistWords(
            wordlistId,
            Array.from(wordsToOperate),
            shouldDeleteDictionaryWords,
          )
        : await deleteUserWords(Array.from(wordsToOperate));
      loadWords();
    }
  };

  const showDeleteModalOneWord = (id: string) => {
    setIsDeleteModalShown(true);
    setWordsToOperate(new Set([id]));
  };

  const showDeleteManyWordsModal = (ids: Set<string>) => {
    setIsDeleteModalShown(true);
    setWordsToOperate(ids);
  };

  const hideModal = () => {
    setIsDistributeModalShown(false);
    setIsDownloadModalShown(false);
    setIsDeleteModalShown(false);
    setIsExportModalShown(false);
    setIsCreateWordlistModalShown(false);
    setIsImportModalShown(false);
    setSelectedWordlistId(null);
    setWordlistFormData(new FormData());
    setImportErrors(null);
    setWordsOperation('to distribute');
  };

  const onEditConfirm = async () => {
    hideEditModal();
    setLoading(true);
    try {
      const { data } = editWordId
        ? wordlistId
          ? await updateWordlistWord(wordlistId, editWordId, formData)
          : await updateUserWord(editWordId, formData)
        : wordlistId
        ? await addWordlistWord(wordlistId, formData)
        : await addUserWord(formData);
      setAlert({
        message: data.message,
        color: data.error ? 'danger' : 'success',
      });
    } catch (e) {
      setAlert({
        message: e.response.data,
        color: 'danger',
      });
    }
    loadWords();
  };

  const showEditModal = (id: string | null) => {
    setIsEditModalShown(true);
    setEditWordId(id);
  };

  const hideEditModal = () => {
    setIsEditModalShown(false);
  };

  useEffect(() => {
    socket.emit('requestImportProgress');
  }, [wordlistId]);

  useEffect(() => {
    const handleRequestImportProgress = (response: ImportProgressResponse) => {
      setImportWordlistId(response.wordlistId);

      const showImportProgress =
        !wordlistId || wordlistId === response.wordlistId;

      if (showImportProgress) {
        setImportProgress(response.progress);
      } else {
        setImportProgress(null);
      }
    };

    socket.on('requestImportProgress', handleRequestImportProgress);

    return () => {
      socket.off('requestImportProgress', handleRequestImportProgress);
    };
  }, [wordlistId]);

  useEffect(() => {
    const showImportProgress = !wordlistId || wordlistId === importWordlistId;

    if (showImportProgress) {
      const handleImportFinished = (response: ImportFinishedResponse) => {
        const { errors, uploaded } = response;

        setImportProgress(null);
        loadWords();

        if (uploaded > 0 && errors.length === 0) {
          setAlert({
            message: `${uploaded}
             ${texts[interfaceLanguage].pages.dictionary.nWordsWereSuccessfullyUploaded}`,
            color: 'success',
          });
        } else {
          setAlert({
            message: `${uploaded} ${texts[interfaceLanguage].pages.dictionary.nWordsWereUploaded}
             ${errors.length} ${texts[interfaceLanguage].pages.dictionary.nErrors}`,
            color: 'warning',
          });
          setImportErrors(errors);
        }
      };

      const handleImportError = () => {
        setImportProgress(null);
        setAlert({
          message: texts[interfaceLanguage].pages.dictionary.somethingWentWrong,
          color: 'danger',
        });
      };

      socket.on('importProgress', setImportProgress);
      socket.on('importFinished', handleImportFinished);
      socket.on('importError', handleImportError);

      return () => {
        socket.off('importProgress', setImportProgress);
        socket.off('importFinished', handleImportFinished);
        socket.off('importError', handleImportError);
      };
    } else {
      setImportProgress(null);
    }
  }, [importWordlistId, loadWords, wordlistId, interfaceLanguage]);

  const uploadWordsHandler = async (formData: FormData) => {
    setImportWordlistId(wordlistId);
    try {
      const { data } = await uploadWords(formData, wordlistId);

      if (data.error) {
        setAlert({
          message: data.error,
          color: 'danger',
        });
      }
    } catch (error) {
      if (error?.response?.data) {
        setAlert({
          message: error?.response?.data,
          color: 'danger',
        });
      }
    }
  };

  const showDistributeModal = (ids: Set<string>) => {
    setIsDistributeModalShown(true);
    setWordsToOperate(ids);
  };
  const onDistributeConfirm = async () => {
    hideModal();
    if (wordsToOperate.size) {
      setLoading(true);
      await changeWordsState(
        wordsOperation,
        Array.from(wordsToOperate),
        wordlistId,
      );
      loadWords();
    }
  };

  const showDownloadModal = (ids: Set<string>) => {
    setIsDownloadModalShown(true);
    setWordsToOperate(ids);
  };
  const onDownloadConfirm = async () => {
    hideModal();
    if (wordsToOperate.size) {
      const downloadingSelectedWords = words
        .filter((word) => Array.from(wordsToOperate).includes(word._id ?? ''))
        .map((word) => ({
          en: word.en,
          de: word.de,
          ru: word.ru,
          hint: word.hint,
          img: word.img ? word.img.x1 : '',
        }));
      fileDownload(JSON.stringify(downloadingSelectedWords), 'words.json');
    }
  };

  const showExportModal = async (ids: Set<string>) => {
    await loadMyWordlists();
    setIsExportModalShown(true);
    setWordsToOperate(ids);
    if (wordlist && wordlist.privacyType === 'public') {
      setIsCurrentWordlistPublic(true);
    }
  };
  const onExportConfirm = async () => {
    hideModal();
    if (wordsToOperate.size) {
      if (selectedWordlistId === 'new') {
        showCreateWordlistModal();
      } else if (selectedWordlistId === 'dictionary') {
        showImportWordsModal(wordsToOperate);
      } else {
        setLoading(true);
        wordlistFormData.append(
          'words',
          JSON.stringify(Array.from(wordsToOperate)),
        );
        if (wordlistId) {
          wordlistFormData.append('originalWordlistId', wordlistId);
        }
        const { data } = await updateWordlist(
          selectedWordlistId ?? '',
          wordlistFormData,
        );
        setAlert({
          message: data.message,
          color: data.error ? 'danger' : 'success',
        });
        loadWords();
      }
    }
  };

  const showCreateWordlistModal = () => {
    setIsCreateWordlistModalShown(true);
  };
  const onCreateWordlistConfirm = async () => {
    hideModal();
    if (wordsToOperate.size) {
      setLoading(true);
      wordlistFormData.append(
        'words',
        JSON.stringify(Array.from(wordsToOperate)),
      );
      if (wordlistId) {
        wordlistFormData.append('originalWordlistId', wordlistId);
      }
      const { data } = await addWordlist(wordlistFormData);
      setAlert({
        message: data.message,
        color: data.error ? 'danger' : 'success',
      });
      loadWords();
    }
  };

  const loadMyWordlists = async () => {
    setLoading(true);
    const response = await getMyWordlists();
    const data = response.data.wordlists;
    setMyWordlists(data);
    setLoading(false);
    return data;
  };

  const showImportWordsModal = (ids: Set<string>) => {
    setIsImportModalShown(true);
    setWordsToOperate(ids);
  };
  const onImportConfirm = async () => {
    hideModal();
    if (wordsToOperate.size) {
      setLoading(true);
      const { data } = await addUserWords(
        [wordlistId],
        Array.from(wordsToOperate),
      );
      setAlert({
        message: data.message,
        color: data.error ? 'danger' : 'success',
      });
      loadWords();
    }
  };

  const actionsWithWordsAllowed =
    !wordlistId || (wordlist && wordlist.userID === user._id) || false;

  useEffect(() => {
    const title = wordlist ? (
      lastLocation ? (
        <>
          <span className={styles.linkTitle}>
            <Link to={lastLocation.pathname}>
              {texts[interfaceLanguage].pages.dictionary.wordlists}
            </Link>{' '}
            /{' '}
          </span>
          {wordlist.name}
        </>
      ) : (
        wordlist.name
      )
    ) : (
      texts[interfaceLanguage].pages.dictionary.title
    );
    !loading && setPageTitle(title);
  }, [wordlist, lastLocation, loading, interfaceLanguage]);

  if (noWordlistFound) {
    return <Redirect to="/notfound" />;
  }

  return (
    <Container fluid={true}>
      <h1>{pageTitle}</h1>
      {actionsWithWordsAllowed &&
      ['admin', 'teacher'].includes(user.role) &&
      importProgress ? (
        <>
          <Progress
            color="info"
            value={calculatePercent(
              importProgress.uploaded,
              importProgress.total,
            )}
            className="mb-4"
          />
          <p className="text-center">
            {importProgress.uploaded}{' '}
            {texts[interfaceLanguage].pages.dictionary.of}{' '}
            {importProgress.total}{' '}
            {texts[interfaceLanguage].pages.dictionary.wordsUploaded}
          </p>
        </>
      ) : !['student', 'blocked'].includes(user.role) ? (
        <UploadForm uploadFile={uploadWordsHandler} />
      ) : null}
      <SearchForm
        items={words}
        setFilteredItems={setFilteredWords}
        hiddenLanguage={hiddenLanguage}
        entity="words"
      />
      {loading ? (
        <Loader />
      ) : (
        <WordsTable
          words={filteredWords}
          showDeleteModal={showDeleteModalOneWord}
          showEditModal={showEditModal}
          showDeleteManyWordsModal={showDeleteManyWordsModal}
          showDistributeModal={showDistributeModal}
          showDownloadModal={showDownloadModal}
          showExportModal={showExportModal}
          hiddenLanguage={hiddenLanguage}
          actionsAllowed={actionsWithWordsAllowed}
        />
      )}

      <ModalWindow
        isShown={isEditModalShown}
        title={
          editWordId
            ? texts[interfaceLanguage].pages.dictionary.editWordModalTitle
            : texts[interfaceLanguage].pages.dictionary.addWordModalTitle
        }
        onCancel={hideEditModal}
        onConfirm={onEditConfirm}
        isDisabled={isEditFormDisabled}
        modalSize="xl"
      >
        <EditWordForm
          setFormData={setFormData}
          oldWordId={editWordId}
          wordlistId={wordlistId}
          setIsEditFormDisabled={setIsEditFormDisabled}
        ></EditWordForm>
      </ModalWindow>

      <ModalWindow
        isShown={isDeleteModalShown}
        confirmColor="danger"
        title={
          wordsToOperate.size > 1
            ? texts[interfaceLanguage].pages.dictionary.deleteWords
            : texts[interfaceLanguage].pages.dictionary.deleteAWord
        }
        onCancel={hideModal}
        onConfirm={onDeleteConfirm}
      >
        {wordsToOperate.size > 1
          ? texts[interfaceLanguage].pages.dictionary.removeWordsConfirmation
          : texts[interfaceLanguage].pages.dictionary.removeWordConfirmation}
        <>
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
            {wordlistId
              ? texts[interfaceLanguage].pages.dictionary
                  .checkRemoveFromDictionaryAndWordlists
              : texts[interfaceLanguage].pages.dictionary
                  .checkRemoveFromWordlists}
          </Label>
        </>
      </ModalWindow>

      <ModalWindow
        isShown={isDistributeModalShown}
        title={
          texts[interfaceLanguage].pages.dictionary.distributeWordsModalTitle
        }
        onCancel={hideModal}
        onConfirm={onDistributeConfirm}
      >
        {texts[interfaceLanguage].pages.dictionary.changeStateTo}
        <RadioGroup {...radio}>
          {Object.keys(STATES).map((key) => (
            <Radio
              className="d-block my-3"
              key={key}
              checked={key === wordsOperation}
              value={key}
              name="distribution"
              color="primary"
              {...radio}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setWordsOperation(e.target.value as WordStateField)
              }
            >
              {key}
            </Radio>
          ))}
        </RadioGroup>
      </ModalWindow>

      <ModalWindow
        isShown={isDownloadModalShown}
        title={
          texts[interfaceLanguage].pages.dictionary.downloadWordsModalTitle
        }
        onCancel={hideModal}
        onConfirm={onDownloadConfirm}
      >
        {texts[interfaceLanguage].pages.dictionary.downloadWordsConfirmation}
      </ModalWindow>

      <ModalWindow
        isShown={isExportModalShown}
        title={texts[interfaceLanguage].pages.dictionary.exportWordsModalTitle}
        onCancel={hideModal}
        onConfirm={onExportConfirm}
        isDisabled={selectedWordlistId === null}
      >
        <RadioGroup {...radio}>
          {isCurrentWordlistPublic && (
            <>
              <Radio
                className="d-block my-3"
                key="dictionary"
                checked={selectedWordlistId === 'dictionary'}
                value="dictionary"
                name="wordlist"
                color="primary"
                {...radio}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSelectedWordlistId(e.target.value as string)
                }
              >
                {texts[interfaceLanguage].pages.dictionary.checkAddToDictionary}
              </Radio>
              <hr />
            </>
          )}
          <Radio
            className="d-block my-3"
            key="new"
            checked={selectedWordlistId === 'new'}
            value="new"
            name="wordlist"
            color="primary"
            {...radio}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSelectedWordlistId(e.target.value as string)
            }
          >
            {texts[interfaceLanguage].pages.dictionary.createNewWordlist}
          </Radio>
          {myWordlists.length > 0 && (
            <>
              <hr />
              <FormGroup>
                <Label>
                  {texts[interfaceLanguage].pages.dictionary.addWordsTo}
                </Label>
              </FormGroup>
              {myWordlists
                .filter((wordlist) => wordlist._id !== wordlistId)
                .map((key) => (
                  <Radio
                    className="d-block my-3"
                    key={key._id}
                    checked={key._id === selectedWordlistId}
                    value={key._id}
                    name="wordlist"
                    color="primary"
                    {...radio}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setSelectedWordlistId(e.target.value as string)
                    }
                  >
                    {key.name}
                  </Radio>
                ))}
            </>
          )}
        </RadioGroup>
      </ModalWindow>

      <ModalWindow
        isShown={isCreateWordlistModalShown}
        title={
          texts[interfaceLanguage].pages.dictionary.createWordlistModalTitle
        }
        onCancel={hideModal}
        onConfirm={onCreateWordlistConfirm}
      >
        <EditWordlistForm
          setFormData={setWordlistFormData}
          setIsEditFormDisabled={setIsEditFormDisabled}
        ></EditWordlistForm>
      </ModalWindow>

      <ModalWindow
        isShown={Boolean(importErrors)}
        title={texts[interfaceLanguage].pages.dictionary.uploadErrorsModalTitle}
        onConfirm={hideModal}
        modalSize="xl"
        confirmButtonText={errorsTableConfirmButtonText}
      >
        {importErrors && (
          <UploadedErrorsTable
            errors={importErrors}
            confirmButtonText={errorsTableConfirmButtonText}
            handleConfirm={hideModal}
          />
        )}
      </ModalWindow>

      <ModalWindow
        isShown={isImportModalShown}
        title={texts[interfaceLanguage].pages.dictionary.importModalTitle}
        onCancel={() => setIsImportModalShown(false)}
        onConfirm={onImportConfirm}
      >
        {texts[interfaceLanguage].pages.dictionary.addWordsConfirmation}
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
