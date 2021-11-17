import axios from 'axios';

const baseUrl = '/api';

axios.defaults.baseURL = baseUrl;

//Intercepts all possible errors,
//does additional logging for
//unexpected errors (code 500+)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const expectedError =
      error.response &&
      error.response.status >= 400 &&
      error.response.status < 500;

    if (!expectedError) {
      console.log('Logging the error', error);
      // TODO: replace with an alert component
    }

    if (
      expectedError &&
      error.response.data === 'Invalid token. Access denied.'
    ) {
      localStorage.removeItem('token');
    }

    return Promise.reject(error);
  },
);

const setJwt = (jwt: string | null) => {
  axios.defaults.headers.common['x-auth-token'] = jwt;
};

export const http = {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete,
  setJwt,
};
