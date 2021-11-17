import { http } from './http-service';

const apiEndpoint = `/upload`;

export const uploadWords = async (formData: FormData, wordlistId?: string) => {
  const url = wordlistId ? `${apiEndpoint}/${wordlistId}` : apiEndpoint;
  const result = await http.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return result;
};
