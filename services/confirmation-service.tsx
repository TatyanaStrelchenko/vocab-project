import { http } from './http-service';

const apiEndpoint = `/confirmation`;

export const confirm = async (token: string) => {
  return await http.post(`${apiEndpoint}/${token}`, {});
};

export const sendConfirmation = async (email: string) => {
  return await http.post(apiEndpoint, { email });
};
