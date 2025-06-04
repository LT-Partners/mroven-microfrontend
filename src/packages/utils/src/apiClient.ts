import axios from 'axios';
import * as qs from 'qs';
import { authFirebase } from './firebase.config';

const apiClient = axios.create({
  baseURL: "https://api.dev.lift.newengen.com/dev",
  headers: {
    'Content-Type': 'application/json',
    'x-skip-auth-end':'dev'
  },
  paramsSerializer: (params) => {
    // Use qs.stringify for more complex encoding
    return qs.stringify(params, { encode: true });
    // return new URLSearchParams(params).toString();
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const user = authFirebase.currentUser;

    if (user) {
      try {
        const idToken = await user.getIdToken();
        config.headers.Authorization = `Bearer ${idToken}`;
      } catch (error) {
        try {
          const refreshedIdToken = await user.getIdToken(true);
          config.headers.Authorization = `Bearer ${refreshedIdToken}`;
        } catch (refreshError) {
          console.log(refreshError, 'error refreshing Firebase token');
          throw refreshError;
        }
        console.log(error, 'error getting Firebase token');
        throw error;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

authFirebase.onAuthStateChanged(async (user) => {
  if (user) {
    const idToken = await user.getIdToken(true);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;
  }
});

export default apiClient;
