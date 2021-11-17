import { WordType, SingleWordState, WordStateField } from '@vocab/shared';
import { ExerciseType } from '../constants';
import { http } from './http-service';

const apiEndpoint = `/states`;

interface PayloadWords {
  words: WordType[];
}

export const getWordsForDistributing = (wordlistId: string | null) => {
  return wordlistId
    ? http.get<WordType[]>(`${apiEndpoint}/words/${wordlistId}`)
    : http.get<WordType[]>(`${apiEndpoint}/words`);
};

export const getExerciseWords = (
  state: WordStateField,
  exerciseType: string,
  wordlistId: string | null,
) =>
  wordlistId
    ? http.get<WordType[]>(
        `${apiEndpoint}/exercise-words/${state}/${exerciseType}/${wordlistId}`,
      )
    : http.get<WordType[]>(
        `${apiEndpoint}/exercise-words/${state}/${exerciseType}`,
      );

export const getAvailableExercises = (state: WordStateField) =>
  http.get(`${apiEndpoint}/exercises/${state}`);

export const updateWordState = async (state: SingleWordState) => {
  return await http.put(`${apiEndpoint}/update`, state);
};

export const resetExerciseState = (
  exerciseMode: WordStateField,
  exerciseType: ExerciseType,
  wordlistId: string | null,
) => {
  return wordlistId
    ? http.put<PayloadWords>(
        `${apiEndpoint}/reset/${exerciseMode}/${exerciseType}/${wordlistId}`,
      )
    : http.put<PayloadWords>(
        `${apiEndpoint}/reset/${exerciseMode}/${exerciseType}`,
      );
};

export const resetAllWordsState = (wordlistId: string | null) => {
  return wordlistId
    ? http.put<PayloadWords>(`${apiEndpoint}/reset-distribution/${wordlistId}`)
    : http.put<PayloadWords>(`${apiEndpoint}/reset-distribution`);
};

export const changeWordsState = (
  state: string,
  wordIds: string[],
  wordlistId?: string,
) => {
  return http.put(`${apiEndpoint}?state=${encodeURIComponent(state)}`, {
    wordIds,
    wordlistId,
  });
};
