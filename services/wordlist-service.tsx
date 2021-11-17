import { http } from './http-service';

const apiEndpoint = `/wordlists`;

export const getMyWordlists = () => {
  return http.get(`${apiEndpoint}/my`);
};

export const getPublicWordlists = () => {
  return http.get(`${apiEndpoint}/public`);
};

export const getWordlist = (wordlistId: string) => {
  return http.get(`${apiEndpoint}/${wordlistId}`);
};

export const addWordlist = (formData: FormData) => {
  return http.post(apiEndpoint, formData);
};

export const copyWordlist = (wordlistId: string) => {
  return http.post(`${apiEndpoint}/${wordlistId}`);
};

export const updateWordlist = (wordlistId: string, formData: FormData) => {
  return http.put(`${apiEndpoint}/${wordlistId}`, formData);
};

export const blockWordlist = (wordlistId: string) => {
  return http.put(`${apiEndpoint}/${wordlistId}/block`);
};

export const deleteWordlists = (
  wordlistIds: string[],
  shouldDeleteDictionaryWords: boolean,
) => {
  return http.delete(apiEndpoint, {
    data: {
      wordlistsToDelete: wordlistIds,
      shouldDeleteDictionaryWords,
    },
  });
};

export const getWordlistWords = (wordlistId: string) => {
  return http.get(`${apiEndpoint}/${wordlistId}/words`);
};

export const getWordlistWord = (wordlistId: string, wordId: string) => {
  return http.get(`${apiEndpoint}/${wordlistId}/words/${wordId}`);
};

export const addWordlistWord = (wordlistId: string, formData: FormData) => {
  return http.post(`${apiEndpoint}/${wordlistId}/words`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateWordlistWord = (
  wordlistId: string,
  wordId: string,
  formData: FormData,
) => {
  return http.put(`${apiEndpoint}/${wordlistId}/words/${wordId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteWordlistWords = (
  wordlistId: string,
  wordIds: string[],
  shouldDeleteDictionaryWords: boolean,
) => {
  return http.delete(`${apiEndpoint}/${wordlistId}/words`, {
    data: {
      wordsToDelete: wordIds,
      shouldDeleteDictionaryWords,
    },
  });
};
