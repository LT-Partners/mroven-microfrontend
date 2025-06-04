import axios from 'axios';
import apiClient from './apiClient';

export interface UserPayload {
  id: number;
  email: string;
  name: string;
}

export const actionLogTrack = async (
  payload: any,
  isError: boolean,
  user: UserPayload
) => {
  try {
    // console.log(isError, token);
    if (payload.response) {
      delete payload.response;
    }

    const finalPayload = {
      isError: isError,
      payload: payload,
    };
    console.log(JSON.stringify(finalPayload), 'payload');
    const res = await apiClient.post(`/user/v1/admin/log/add`, {
      log: JSON.stringify(finalPayload),
      user: user.id,
      email: user.email,
      name: user.name,
    });
    return res;
  } catch (error) {
    console.log(error, 'log error');
  }
};

export interface UserPayload {
  id: number;
  email: string;
  name: string;
}

export class ActionLogTrack {
  user: UserPayload | null;
  constructor(user: UserPayload) {
    this.user = user;
  }

  currentUser() {
    return this.user;
  }

  async actionLogTrack(payload: any, isError: boolean) {
    try {
      console.log('from actionLogTrack class');

      if (!this.user) {
        console.log('action log error: No user data');
        return;
      }

      const user = this.user;
      if (payload.response) {
        delete payload.response;
      }

      const res = await apiClient.post(`/user/v1/admin/log/add`, {
        type: !isError ? 'INFO' : 'ERROR',
        details: {
          payload,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        },
      });
      return res;
    } catch (error) {
      console.log('action log error:', error);
    }
  }
}
