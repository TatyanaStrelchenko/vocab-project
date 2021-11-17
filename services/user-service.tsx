import { Language, UserData, Image, Role } from '@vocab/shared';
import { http } from './http-service';
import { loginWithJwt, getCurrentUser } from './auth-service';

const apiEndpoint = '/users';

export const register = (
  user: Pick<UserData, 'email' | 'password' | 'name' | 'oauth'>,
) => {
  const interfaceLanguage = localStorage.getItem(
    'interfaceLanguage',
  ) as Language;
  return http.post(apiEndpoint, {
    email: user.email,
    password: user.password,
    name: user.name,
    oauth: user.oauth,
    interfaceLanguage,
  });
};

export const updateUserRole = async (id: string, role: Role) => {
  const { data } = await http.put<{ token: string }>(
    `${apiEndpoint}/role/${id}`,
    { role },
  );

  return data.token;
};

export const updateUser = async (formData: FormData | Partial<UserData>) => {
  const { data } = await http.put<{ token: string; profilePicture: Image }>(
    `${apiEndpoint}/me`,
    formData,
  );

  loginWithJwt(data.token);

  return getCurrentUser();
};

export const check = (data: { _id?: string; email?: string }) =>
  http.post<boolean>(`${apiEndpoint}/check`, data);

export const doesCurrentUserExists = async () => {
  const user = getCurrentUser();
  if (!user._id) return false;
  const { data } = await check({ _id: user._id });
  return data;
};

export const getUsers = () => http.get<UserData[]>(apiEndpoint);
