import jwtDecode from 'jwt-decode';
import { Language, UserData, SocialData } from '@vocab/shared';
import { blankUser } from '../constants';
import { http } from './http-service';

const apiEndpoint = `/authorization`;
const tokenKey = 'token';

export const getJwt = () => localStorage.getItem(tokenKey);

http.setJwt(getJwt());

export const login = async (email: string, password: string) => {
  const interfaceLanguage = localStorage.getItem(
    'interfaceLanguage',
  ) as Language;
  const { data: jwt } = await http.post(apiEndpoint, {
    email,
    password,
    interfaceLanguage,
  });
  loginWithJwt(jwt);
};

export const loginOauth = async (socialData: SocialData) => {
  const interfaceLanguage = localStorage.getItem(
    'interfaceLanguage',
  ) as Language;
  const { data: jwt } = await http.post(`${apiEndpoint}/oauth`, {
    ...socialData,
    interfaceLanguage,
  });
  loginWithJwt(jwt);
};

export const loginWithJwt = (jwt: string) => {
  localStorage.setItem(tokenKey, jwt);
  http.setJwt(jwt);
};

export const logout = () => localStorage.removeItem(tokenKey);

export const getCurrentUser = (): UserData => {
  try {
    const jwt = localStorage.getItem(tokenKey);
    if (jwt) return jwtDecode<UserData>(jwt);
    else return { ...blankUser };
  } catch (ex) {
    return { ...blankUser };
  }
};

export const isLoggedIn = () => {
  return getCurrentUser().email !== '';
};

export const isLoggedInAndConfirmed = () => {
  return process.env.NODE_ENV === 'production'
    ? isLoggedIn() && !!getCurrentUser().isConfirmed
    : isLoggedIn();
};
