import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import { WordType, texts } from '@vocab/shared';
import { WordCard } from '../../components/WordCard';
import { Loader } from '../../components/Loader';
import { SpeechSynthesis } from '../../services/speech-synthesis-service';
import {
  getWordsForDistributing,
  updateWordState,
  resetAllWordsState,
} from '../../services/state-service';
import { SettingsContext } from '../../context/settings';
import { ExercisesList } from '../../components/ExercisesList';
import { ModalWindow } from '../../components/ModalWindow';
import { WordlistDropdown } from '../../components/WordlistDropdown';
import { getLanguageFilteredWords } from '../../utils';
import exercisesStyles from '../../components/exercises/exercises.module.scss';
import styles from './styles.module.scss';

const newExerciseData = {
  txt_help: false,
  voice_help: false,
  learn_img: false,
  img_learn: false,
  help_voice: false,
  help_txt: false,
  voice_txt: false,
  txt_voice: false,
};

export const Distributing = () => {
  const { settings } = useContext(SettingsContext);
  const { interfaceLanguage } = settings;
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<WordType[]>([]);
  const [currentWord, setCurrentWord] = useState<WordType | undefined>(
    undefined,
  );
  const [wordIndex, setWordIndex] = useState<number>(0);
  const [isModalShown, setIsModalShown] = useState(false);
  const [wordlistId, setWordlistId] = useState<string | null>(null);
  const speechSynthesis = new SpeechSynthesis(settings);
  const handleSynthesis = (word: string) => {
    speechSynthesis.sound(word, settings.learnLanguage);
  };

  useEffect(() => {
    const loadWords = async () => {
      const { data } = await getWordsForDistributing(wordlistId);
      setWords(getLanguageFilteredWords(data, settings.learnLanguage));
      setCurrentWord(getLanguageFilteredWords(data, settings.learnLanguage)[0]);
      setLoading(false);
    };
    loadWords();
  }, [wordlistId, settings]);

  const handleStateChange = (wordId: string, status: string) => {
    speechSynthesis.cancel();
    const newIndex = wordIndex + 1;
    setCurrentWord(words[newIndex]);
    setWordIndex(newIndex);
    const exercisesData = status !== 'learned' ? newExerciseData : {};
    updateWordState({
      wordId,
      state: status,
      ...exercisesData,
    });
  };

  const resetDistribution = async () => {
    setLoading(true);
    const wordsAfterReset = await resetAllWordsState(wordlistId);
    const { words } = wordsAfterReset.data;
    setWords(words);
    setCurrentWord(words[0]);
    setWordIndex(0);
    setLoading(false);
  };

  const hideModal = () => {
    setIsModalShown(false);
  };

  const openModal = () => {
    setIsModalShown(true);
  };

  const onModalConfirm = () => {
    resetDistribution();
    setIsModalShown(false);
  };
  const distributionContent = loading ? (
    <Loader />
  ) : (
    <>
      <div className={styles.counterContainer}>
        <div className={styles.counter}>
          {texts[interfaceLanguage].pages.distributing.wordsLeft}{' '}
          {words.length - wordIndex}
        </div>
        <Button onClick={openModal} color="secondary" size="sm">
          {texts[interfaceLanguage].pages.distributing.reset}
        </Button>
      </div>
      {words.length === 0 || !currentWord ? (
        <>
          <h2>{texts[interfaceLanguage].pages.distributing.goToExercises}</h2>
          <ExercisesList mode="to learn" />
          <h2>
            {texts[interfaceLanguage].pages.distributing.orAddNewWords}{' '}
            <Link to="/dictionary">
              {texts[interfaceLanguage].pages.distributing.dictionary}
            </Link>
          </h2>
        </>
      ) : (
        <WordCard
          word={currentWord}
          stateChange={handleStateChange}
          synthesizeWord={handleSynthesis}
        />
      )}
    </>
  );

  return (
    <>
      <h1 className={exercisesStyles.exerciseTitle}>
        {texts[interfaceLanguage].pages.distributing.title}
      </h1>
      <WordlistDropdown wordlistId={wordlistId} setWordlistId={setWordlistId} />
      <div className="custom-container">{distributionContent}</div>
      <ModalWindow
        isShown={isModalShown}
        title="Reset distribution"
        onCancel={hideModal}
        onConfirm={onModalConfirm}
        confirmColor="danger"
      >
        {
          texts[interfaceLanguage].pages.distributing
            .resetDistributionConfirmation
        }
      </ModalWindow>
    </>
  );
};
