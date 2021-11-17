import { http } from './http-service';

const apiEndpoint = `/reset-password`;

export const sendResetLink = async (email: string) => {
  return await http.post(`${apiEndpoint}/email`, { email });
};

export const validateToken = async (token: string) => {
  return await http.post(`${apiEndpoint}/verify/${token}`, {});
};

export const resetPassword = async (password: string, token: string) => {
  return await http.post(apiEndpoint, { password, token });
};
