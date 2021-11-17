import { WordType, Language } from '@vocab/shared';
import { ExerciseType, ENGLISH_ARTICLES } from './constants';

export const checkAnswer = (
  correctAnswer: string,
  userAnswer: string,
  allSynonymsRequired: boolean,
  isGerman: boolean,
  voiceUserInput: boolean,
) => {
  const correctAnswerWords = splitToWords(correctAnswer, isGerman);
  const userAnswerWords = splitToWords(userAnswer, isGerman);

  if (userAnswerWords.length === 0) return false;

  if (voiceUserInput) return voiceInputCheck(userAnswerWords.toString(), allSynonymsRequired, correctAnswerWords);

  if (allSynonymsRequired) {
    const allSynonymsProvided = correctAnswerWords.every((word) =>
      userAnswerWords.includes(word),
    );
    const noRedundantWords =
      correctAnswerWords.length === userAnswerWords.length;

    return allSynonymsProvided && noRedundantWords;
  }

  return userAnswerWords.every((word) => correctAnswerWords.includes(word));
};

export const voiceInputCheck = (remainingAnswerString: string, allSynonymsRequired: boolean, correctAnswerWords: string[]) => {
  if (allSynonymsRequired) {
    const answers = correctAnswerWords.map((word) => {
      if (remainingAnswerString.includes(word)) {
        remainingAnswerString = remainingAnswerString.replace(word, '').trim();
        return true;
      } else {
        return false;
      }
    });
    const allAnswersPresent = answers.every((word) => word === true)
    remainingAnswerString = remainingAnswerString.replace(/;/g, ',')
      .replace(/,/g, '');
    return allAnswersPresent && remainingAnswerString.length === 0
  }; 
  let presentRightAnswer = false;
  correctAnswerWords.forEach((word) => {
    if (remainingAnswerString.includes(word)) {
      presentRightAnswer = true;
      remainingAnswerString = remainingAnswerString.replace(word, '').trim()
    }
  });
  remainingAnswerString = remainingAnswerString.replace(/;/g, ',')
    .replace(/,/g, '')

  if (presentRightAnswer && remainingAnswerString.length === 0) return true
  
  return false;
};

/** Splits a string of words into an array of words without articles and punctuation marks */
export const splitToWords = (text: string, isGerman: boolean) => {
  if (!isGerman) text = text.toLowerCase();

  const result = text
    .replace(/ё/g, 'е')
    .replace(/;/g, ',')
    .replace(/\./g, '')
    .replace(/\?/g, '')
    .replace(/!/g, '')
    .replace(/\s\s+/g, ' ')
    .trim()
    .split(',')
    .map((word) => word.trim());

  if (isGerman) return result;

  return result.map((word) => (
    word.split(' ')
      .filter((word) => !ENGLISH_ARTICLES.includes(word))
      .join(' ')
  ));
};

export const shuffleArray = <T extends unknown>(array: T[]) => {
  let currentIndex = array.length;

  while (currentIndex > 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    const temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

export const wordsLeft = (words: WordType[], exerciseType: ExerciseType) => {
  return words
    .map((word, index) => ({ ...word, index }))
    .filter((word) => !word[exerciseType])
    .map((word) => word.index);
};

export const generateExercisePlaceholder = (
  wordText: string,
  hint?: string,
) => {
  const synonymsNumber = wordText.split(',').length;
  let placeholder = '';
  if (hint) placeholder = hint;
  if (hint && synonymsNumber > 1) placeholder = `${placeholder}; `;
  if (synonymsNumber > 1)
    placeholder = `${placeholder}${synonymsNumber} synonyms`;
  return placeholder;
};

export const calculatePercent = (part: number, total: number) =>
  Math.round((part / total) * 100);

export const getLanguageFilteredWords = (
  words: WordType[],
  language: Language,
) => words.filter((word: WordType) => word[language]);
