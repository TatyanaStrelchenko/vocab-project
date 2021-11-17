import { AxiosResponse } from 'axios';
import { WordType } from '@vocab/shared';
import { http } from './http-service';

const apiEndpoint = `/words`;

export const getUserWords = () => {
  return http.get(apiEndpoint);
};

export const getUserWord = (wordId: string) => {
  return http.get(`${apiEndpoint}/${wordId}`);
};

export const addUserWord = (formData: FormData) => {
  return http.post(apiEndpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateUserWord = (wordId: string, formData: FormData) => {
  return http.put(`${apiEndpoint}/${wordId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getRandomWords = (
  count: number,
  excludedId: string,
): Promise<AxiosResponse<WordType[]>> => {
  return http.get(`${apiEndpoint}/random/${count}/${excludedId}`);
};

export const deleteUserWords = (wordIds: string[]) => {
  return http.delete(apiEndpoint, {
    data: {
      wordsToDelete: wordIds,
      shouldDeleteDictionaryWords: true,
    },
  });
};

export const addUserWords = (wordlistIds: string[], wordIds?: string[]) => {
  return http.post(`${apiEndpoint}/many`, {
    wordlistIds,
    wordIds,
  });
};
