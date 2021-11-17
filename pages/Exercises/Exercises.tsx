import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Jumbotron, Form, Button } from 'reactstrap';
import { WordType, Language, WordStateField, texts } from '@vocab/shared';
import { useSpeechRecognition } from 'react-speech-recognition';
import { SpeechSynthesis } from '../../services/speech-synthesis-service';
import { Loader } from '../../components/Loader';
import { ExercisesList } from '../../components/ExercisesList';
import { RightAnswerView } from '../../components/exercises/RightAnswerView';
import { VoiceToText } from '../../components/exercises/VoiceToText';
import { TextToVoice } from '../../components/exercises/TextToVoice';
import { TextToHelpLanguage } from '../../components/exercises/TextToHelpLanguage';
import { VoiceToHelpLanguage } from '../../components/exercises/VoiceToHelpLanguage';
import { HelpLanguageToText } from '../../components/exercises/HelpLanguageToText';
import { HelpLanguageToVoice } from '../../components/exercises/HelpLanguageToVoice';
import { LearnLanguageToImage } from '../../components/exercises/LearnLanguageToImage/';
import { ImageToLearnLanguage } from '../../components/exercises/ImageToLearnLanguage/';
import { Timer } from '../../components/Timer';
import { ModalWindow } from '../../components/ModalWindow';
import { WordlistDropdown } from '../../components/WordlistDropdown';
import { ExerciseType, LANGUAGE_NAMES, VOICE_INPUT_EXERCISES, GERMAN_LANGUAGE_SHORT_CODE } from '../../constants';
import {
  resetExerciseState,
  updateWordState,
  getExerciseWords,
} from '../../services/state-service';
import {
  checkAnswer,
  generateExercisePlaceholder,
  getLanguageFilteredWords,
  shuffleArray,
} from '../../utils';
import { SettingsContext } from '../../context/settings';
import exercisesStyles from '../../components/exercises/exercises.module.scss';

interface Props {
  mode: WordStateField;
}

export const Exercises: React.FC<Props> = (props) => {
  const { mode } = props;

  const { settings } = React.useContext(SettingsContext);
  const {
    learnLanguage,
    helpLanguage,
    interfaceLanguage,
    allSynonymsRequired,
    learnBatchSize,
    numberOfAttemptsToSkip,
  } = settings;

  const { exerciseId } = useParams() as { exerciseId: ExerciseType };
  const [wordsBatch, setWordsBatch] = useState<WordType[]>([]);
  const [wordsRest, setWordsRest] = useState<WordType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetExerciseModalShown, setIsResetExerciseModalShown] = useState(
    false,
  );
  const [wordlistId, setWordlistId] = useState<string | null>(null);
  const [wordIndex, setWordIndex] = useState<number>(0);
  const [isRenderSound, setIsRenderSound] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValueChecked, setIsValueChecked] = useState(false);
  const [currentWord, setCurrentWord] = useState<WordType>({} as WordType);
  const [userTextInput, setUserTextInput] = useState('');
  const [userVoiceInput, setUserVoiceInput] = useState('');
  const [attempts, setAttempts] = useState<Map<string, number>>(new Map());
  const buttonEl = useRef<HTMLButtonElement>(null);

  const { transcript, resetTranscript } = useSpeechRecognition();

  const userInput = userVoiceInput
    ? `${userTextInput} ${userVoiceInput}`
    : userTextInput;

  const wordText = currentWord[learnLanguage] ?? '';
  const isRepeating = mode === 'to repeat';
  const wordsRestNumber = wordsBatch.length + wordsRest.length;
  const currentWordAttempts = attempts.get(wordText) ?? 0;
  const allowSkip = currentWordAttempts >= numberOfAttemptsToSkip;

  const sampleWordsBatch = () => {
    if (isLoading || !learnBatchSize) return;
    const batchSize = mode === 'to learn' ? learnBatchSize : wordsRest.length;
    setWordsBatch(wordsRest.slice(0, batchSize));
    setWordsRest(wordsRest.slice(batchSize));
  };

  const setDefaultState = () => {
    setUserTextInput('');
    setIsValueChecked(false);
    setIsSuccess(false);
    setIsRenderSound(true);
  };

  const handleUserInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserTextInput(e.currentTarget.value);
    setUserVoiceInput('');
    resetTranscript();
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    ['txt_help', 'voice_help'].includes(exerciseId)
      ? handleHelperLanguageToSubmit()
      : handleCheck();
  };

  const baseAnswerSubmit = (
    correctAnswer: string,
    answerToCheck: string,
    allSynonymsRequired: boolean,
    isGerman: boolean,
    voiceUserInput: boolean,
  ) => {
    const result = checkAnswer(
      correctAnswer,
      answerToCheck,
      allSynonymsRequired,
      isGerman,
      voiceUserInput,
    );

    if (result) {
      if (attempts.delete(wordText)) setAttempts(new Map(attempts));
    } else {
      if (attempts.has(wordText)) {
        const currentWordAttempts = attempts.get(wordText) ?? 0;

        setAttempts(new Map(attempts.set(wordText, currentWordAttempts + 1)));
      } else {
        setAttempts(new Map(attempts.set(wordText, 1)));
      }
    }

    setIsSuccess(result);
    setIsRenderSound(true);
    setIsValueChecked(true);
  };

  const handleHelperLanguageToSubmit = () => {
    baseAnswerSubmit(
      currentWord[helpLanguage],
      userInput,
      allSynonymsRequired,
      isGerman,
      voiceUserInput,
    );
  };

  const handleLearnLanguageToImageSubmit = (answer: WordType) => {
    setUserTextInput(answer[learnLanguage]);
    baseAnswerSubmit(wordText, answer[learnLanguage], false, isGerman, voiceUserInput);
  };

  const handleCheck = () => {
    baseAnswerSubmit(wordText, userInput, allSynonymsRequired, isGerman, voiceUserInput);
  };

  const setNewWordIndex = () => {
    let newWordIndex = wordIndex + 1;
    newWordIndex = newWordIndex >= wordsBatch.length ? 0 : newWordIndex;
    setWordIndex(newWordIndex);
    const newCurrentWord = wordsBatch[newWordIndex];
    setCurrentWord(newCurrentWord);
  };

  const changeWordsBatch = () => {
    const wordsBatchCopy = wordsBatch.slice();
    wordsBatchCopy.splice(wordIndex, 1);
    wordsBatchCopy.length === 0
      ? sampleWordsBatch()
      : setWordsBatch(wordsBatchCopy);
    if (wordIndex >= wordsBatchCopy.length) setWordIndex(0);
  };

  const handleNext = () => {
    if (isSuccess) {
      learnWord();
      changeWordsBatch();
    } else {
      setNewWordIndex();
    }
    setDefaultState();
    resetTranscript();
  };

  const resetExercise = async () => {
    setIsLoading(true);
    const response = await resetExerciseState(mode, exerciseId, wordlistId);
    const { words } = response.data;
    setWordsRest(words);
    setIsLoading(false);
  };

  const learnWord = () => {
    updateWordState({
      wordId: currentWord._id,
      state: mode,
      [exerciseId]: true,
    });
  };

  const openResetExerciseModal = () => {
    setIsResetExerciseModalShown(true);
  };

  const hideResetModal = () => {
    setIsResetExerciseModalShown(false);
  };

  const onModalConfirm = () => {
    resetExercise();
    setIsResetExerciseModalShown(false);
  };

  const clearUserInput = () => {
    setUserTextInput('');
    setUserVoiceInput('');
    resetTranscript();
  };

  const handleSkip = () => {
    if (attempts.delete(wordText)) setAttempts(new Map(attempts));
    setIsSuccess(true);
    setIsRenderSound(true);
    setIsValueChecked(true);
    setUserTextInput(currentWord[learnLanguage]);
  };

  const speechSynthesis = useRef(new SpeechSynthesis(settings));
  const handleSynthesis = useCallback(
    (currentLanguage: Language = learnLanguage) => {
      speechSynthesis.current.cancel();
      currentWord[currentLanguage] &&
        speechSynthesis.current.sound(
          currentWord[currentLanguage],
          currentLanguage,
        );
    },
    [learnLanguage, speechSynthesis, currentWord],
  );

  useEffect(() => {
    setUserVoiceInput(transcript);
  }, [transcript]);

  useEffect(() => {
    exerciseHash[exerciseId].voiceRequired &&
      handleSynthesis(exerciseHash[exerciseId].languageToSpeak);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId, currentWord]);

  useEffect(() => {
    isRenderSound &&
      exerciseHash[exerciseId].voiceRequired &&
      currentWord &&
      handleSynthesis(exerciseHash[exerciseId].languageToSpeak);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    isValueChecked && handleSynthesis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValueChecked]);

  useEffect(() => {
    const getWords = async () => {
      setIsLoading(true);
      const response = await getExerciseWords(mode, exerciseId, wordlistId);
      const words = response.data || [];
      setWordsRest(
        getLanguageFilteredWords(shuffleArray(words), settings.learnLanguage),
      );
      setIsLoading(false);
    };
    getWords();
  }, [exerciseId, mode, wordlistId, settings]);

  useEffect(() => {
    sampleWordsBatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  useEffect(() => {
    setDefaultState();
  }, [exerciseId]);

  useEffect(() => {
    setWordIndex(0);
  }, [wordlistId]);

  useEffect(() => {
    if (wordsBatch.length === 0) return;
    const newCurrentWord = wordsBatch[wordIndex];
    setCurrentWord(newCurrentWord);
  }, [helpLanguage, exerciseId, wordsBatch, wordIndex, learnLanguage]);

  const exerciseHash = {
    voice_txt: {
      task: texts[interfaceLanguage].pages.exercises.voice_txt,
      title: `${texts[interfaceLanguage].pages.exercises.voiceToText} (${LANGUAGE_NAMES[learnLanguage]})`,
      languageToSpeak: learnLanguage,
      languageToShowInHelp: helpLanguage,
      languageToComplete: learnLanguage,
      voiceRequired: true,
      render: (
        <VoiceToText
          placeholder={generateExercisePlaceholder(wordText, currentWord.hint)}
          learnLanguage={learnLanguage}
          handleSynthesis={handleSynthesis}
          userInput={userInput}
          handleUserInput={handleUserInput}
          clearUserInput={clearUserInput}
        />
      ),
    },
    txt_voice: {
      task: texts[interfaceLanguage].pages.exercises.txt_voice,
      title: `${texts[interfaceLanguage].pages.exercises.textToVoice} (${LANGUAGE_NAMES[learnLanguage]})`,
      languageToSpeak: learnLanguage,
      languageToShowInHelp: helpLanguage,
      languageToComplete: learnLanguage,
      voiceRequired: false,
      render: (
        <TextToVoice
          wordText={wordText}
          placeholder={generateExercisePlaceholder(wordText, currentWord.hint)}
          userInput={userInput}
          clearUserInput={clearUserInput}
          allowSkip={allowSkip}
          handleSkip={handleSkip}
          learnLanguage={learnLanguage}
        />
      ),
    },
    txt_help: {
      task: `${texts[interfaceLanguage].pages.exercises.txt_help} ${LANGUAGE_NAMES[helpLanguage]}`,
      title: `${LANGUAGE_NAMES[learnLanguage]} ${texts[interfaceLanguage].pages.exercises.textTo} ${LANGUAGE_NAMES[helpLanguage]}`,
      languageToSpeak: learnLanguage,
      languageToShowInHelp: learnLanguage,
      languageToComplete: helpLanguage,
      voiceRequired: false,
      render: (
        <TextToHelpLanguage
          wordText={wordText}
          placeholder={generateExercisePlaceholder(wordText, currentWord.hint)}
          helpLanguage={helpLanguage}
          userInput={userInput}
          handleUserInput={handleUserInput}
          clearUserInput={clearUserInput}
        />
      ),
    },
    voice_help: {
      task: `${texts[interfaceLanguage].pages.exercises.voice_help} ${LANGUAGE_NAMES[helpLanguage]}`,
      title: `${LANGUAGE_NAMES[learnLanguage]} ${texts[interfaceLanguage].pages.exercises.voiceTo} ${LANGUAGE_NAMES[helpLanguage]}`,
      languageToSpeak: learnLanguage,
      languageToShowInHelp: learnLanguage,
      languageToComplete: helpLanguage,
      voiceRequired: true,
      render: (
        <VoiceToHelpLanguage
          placeholder={generateExercisePlaceholder(wordText, currentWord.hint)}
          helpLanguage={helpLanguage}
          userInput={userInput}
          handleUserInput={handleUserInput}
          clearUserInput={clearUserInput}
          handleSynthesis={handleSynthesis}
        />
      ),
    },
    help_txt: {
      task: `${texts[interfaceLanguage].pages.exercises.help_txt} ${LANGUAGE_NAMES[learnLanguage]}`,
      title: `${LANGUAGE_NAMES[helpLanguage]} ${texts[interfaceLanguage].pages.exercises.to} ${LANGUAGE_NAMES[learnLanguage]} ${texts[interfaceLanguage].pages.exercises.text}`,
      languageToSpeak: helpLanguage,
      languageToShowInHelp: helpLanguage,
      languageToComplete: learnLanguage,
      voiceRequired: true,
      render: (
        <HelpLanguageToText
          translatedWordText={currentWord[helpLanguage]}
          placeholder={generateExercisePlaceholder(wordText, currentWord.hint)}
          learnLanguage={helpLanguage}
          userInput={userInput}
          handleUserInput={handleUserInput}
          clearUserInput={clearUserInput}
          handleSynthesis={() => handleSynthesis(helpLanguage)}
        />
      ),
    },
    help_voice: {
      task: `${texts[interfaceLanguage].pages.exercises.help_voice} ${LANGUAGE_NAMES[learnLanguage]}`,
      title: `${LANGUAGE_NAMES[helpLanguage]} ${texts[interfaceLanguage].pages.exercises.to} ${LANGUAGE_NAMES[learnLanguage]} ${texts[interfaceLanguage].pages.exercises.voice}`,
      languageToSpeak: helpLanguage,
      languageToShowInHelp: helpLanguage,
      languageToComplete: learnLanguage,
      voiceRequired: true,
      render: (
        <HelpLanguageToVoice
          translatedWordText={currentWord[helpLanguage]}
          placeholder={generateExercisePlaceholder(wordText, currentWord.hint)}
          userInput={userInput}
          clearUserInput={clearUserInput}
          handleSynthesis={() => handleSynthesis(helpLanguage)}
          allowSkip={allowSkip}
          handleSkip={handleSkip}
          learnLanguage={learnLanguage}
        />
      ),
    },
    img_learn: {
      task: `${texts[interfaceLanguage].pages.exercises.img_learn} ${LANGUAGE_NAMES[learnLanguage]}`,
      title: `${texts[interfaceLanguage].pages.exercises.imageTo} ${LANGUAGE_NAMES[learnLanguage]}`,
      languageToSpeak: learnLanguage,
      languageToShowInHelp: helpLanguage,
      languageToComplete: learnLanguage,
      voiceRequired: false,
      render: (
        <ImageToLearnLanguage
          img={currentWord.img}
          placeholder={generateExercisePlaceholder(wordText, currentWord.hint)}
          learnLanguage={learnLanguage}
          wordText={wordText}
          userInput={userInput}
          handleUserInput={handleUserInput}
          clearUserInput={clearUserInput}
        />
      ),
    },
    learn_img: {
      task: texts[interfaceLanguage].pages.exercises.learn_img,
      title: `${LANGUAGE_NAMES[learnLanguage]} ${texts[interfaceLanguage].pages.exercises.toImage}`,
      languageToSpeak: learnLanguage,
      languageToShowInHelp: helpLanguage,
      languageToComplete: learnLanguage,
      voiceRequired: false,
      render: (
        <LearnLanguageToImage
          handleSynthesis={handleSynthesis}
          currentWord={currentWord}
          handleSubmit={handleLearnLanguageToImageSubmit}
          wordText={wordText}
        />
      ),
    },
  };

  const isGerman = exerciseHash[exerciseId].languageToComplete === GERMAN_LANGUAGE_SHORT_CODE;
  const voiceUserInput = VOICE_INPUT_EXERCISES.includes(exerciseId);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className={exercisesStyles.exerciseTitle}>
        <b>{exerciseHash[exerciseId]['task']}</b>
      </div>
      <WordlistDropdown wordlistId={wordlistId} setWordlistId={setWordlistId} />
      <div className={exercisesStyles.counterContainer}>
        <div className={exercisesStyles.counter}>
          {texts[interfaceLanguage].pages.exercises.wordsLeft} {wordsRestNumber}
        </div>
        <Button color="secondary" size="sm" onClick={openResetExerciseModal}>
          {texts[interfaceLanguage].pages.exercises.reset}
        </Button>
      </div>

      {!wordsRestNumber && (
        <div className="custom-container text-center">
          <h2>
            {texts[interfaceLanguage].pages.exercises.exercise} '
            {exerciseHash[exerciseId].title}'{' '}
            {texts[interfaceLanguage].pages.exercises.isFinished} <br />
            {texts[interfaceLanguage].pages.exercises.chooseNext}
          </h2>
          <ExercisesList mode={mode} />
          <h2>
            {texts[interfaceLanguage].pages.exercises.or}{' '}
            <Link to="/distributing">
              {texts[interfaceLanguage].pages.exercises.distribute}
            </Link>{' '}
            {texts[interfaceLanguage].pages.exercises.words} <br />
            {texts[interfaceLanguage].pages.exercises.orAdd}{' '}
            <Link to="/dictionary">
              {texts[interfaceLanguage].pages.exercises.dictionary}
            </Link>
          </h2>
        </div>
      )}

      {wordsRestNumber && (
        <div className={exercisesStyles.wrapper}>
          <Jumbotron className={exercisesStyles.jumbotron}>
            <Form
              autoComplete="off"
              onSubmit={onSubmit}
              className={exercisesStyles.mainForm}
            >
              {!isValueChecked && (
                <>
                  {exerciseHash[exerciseId].render}

                  <div className={exercisesStyles.checkAndTimer}>
                    {exerciseId === 'learn_img' ? null : (
                      <Button color="primary">
                        {texts[interfaceLanguage].pages.exercises.check}
                      </Button>
                    )}
                    {isRepeating && (
                      <Timer
                        correctWord={wordText}
                        userInput={userInput}
                        onExpiration={handleCheck}
                      />
                    )}
                  </div>
                </>
              )}

              {isValueChecked && (
                <>
                  <RightAnswerView
                    isSuccess={isSuccess}
                    userInput={userInput}
                    correctText={
                      currentWord[exerciseHash[exerciseId].languageToComplete]
                    }
                    helpLanguageText={
                      currentWord[exerciseHash[exerciseId].languageToShowInHelp]
                    }
                    img={currentWord.img}
                    handleSynthesis={handleSynthesis}
                  />
                  <Button
                    type="submit"
                    color="primary"
                    className={exercisesStyles.btnCustom}
                    onClick={handleNext}
                    autoFocus
                    innerRef={buttonEl}
                  >
                    {texts[interfaceLanguage].pages.exercises.next}
                  </Button>
                </>
              )}
            </Form>
          </Jumbotron>
        </div>
      )}
      <ModalWindow
        isShown={isResetExerciseModalShown}
        title={exerciseHash[exerciseId].title}
        onCancel={hideResetModal}
        onConfirm={onModalConfirm}
        confirmColor="danger"
      >
        {texts[interfaceLanguage].pages.exercises.resetExerciseConfirmation}
      </ModalWindow>
    </>
  );
};
