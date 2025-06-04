import { authFirebase } from '@repo/utils/firebase-config';
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  UserCredential,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { Toastify } from '@repo/ui/toast';
import apiClient from '@repo/utils/apiClient';
import { actionLogTrack } from '@repo/utils/actionLogTrack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface AuthContextType {
  authUser: any;
  loginUserWithPasswordEmail: (email: string, password: string) => Promise<any>;
  signUpUserWithPasswordEmail: (
    email: string,
    password: string
  ) => Promise<any>;
  SSOSignIn: (redirectToken: string) => void;
  loginUserWithGoogleSignIn: (email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  handleLogout: () => Promise<void>;
  loading: boolean;
  willnavigate: boolean;
  willnavigateForWaiting: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Provide a default value for the context
const defaultContextValue: AuthContextType = {
  authUser: null,
  loginUserWithPasswordEmail: async (email: string, password: string) => {},
  signUpUserWithPasswordEmail: async (email: string, password: string) => {
    return;
  },
  SSOSignIn: async (redirectToken: string) => {},
  loginUserWithGoogleSignIn: async (email: string, password: string) => {},
  forgotPassword: async (email: string) => {},
  handleLogout: async () => {},
  loading: true,
  willnavigate: false,
  willnavigateForWaiting: false,
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // const navigate = useNavigate();
  const [willnavigate, setWillNavigate] = useState<boolean>(false);
  const [willnavigateForWaiting, setWillNavigateForWaiting] =
    useState<boolean>(false);
  const [authUser, setAuthUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const loginUserWithPasswordEmail = async (
    email: string,
    password: string
  ) => {
    return await signInWithEmailAndPassword(authFirebase, email, password);
  };

  const loginUserWithGoogleSignIn = async (email: string, password: string) => {
    try {
      const googleProvider = new GoogleAuthProvider();
      const result = await signInWithPopup(authFirebase, googleProvider);
      const googleUser: any = result.user;

      if (googleUser) {
        // Check if the user already has an email/password account
        const methods = await fetchSignInMethodsForEmail(
          authFirebase,
          googleUser.email
        );
        if (methods.includes('password')) {
          // Link the Google account with the existing email/password account
          const emailPasswordCredential = EmailAuthProvider.credential(
            email,
            password
          );
          await linkWithCredential(googleUser, emailPasswordCredential);
        }

        // setUser(googleUser);
      }
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };
  const signUpUserWithPasswordEmail = async (
    email: string,
    password: string
  ) => {
    const userCredential = await createUserWithEmailAndPassword(
      authFirebase,
      email,
      password
    );

    const res = await sendEmailVerification(userCredential.user);
    console.log(res, 'res');
    return userCredential.user.uid;
  };

  const forgotPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(authFirebase, email);
      Toastify('error', `Password reset sent to email ${email}`);
    } catch (error) {
      Toastify('error', 'Error sending password reset email');
      console.error('Error sending password reset email', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(authFirebase);
      setAuthUser(null);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const SSOSignIn = (redirectToken: string) => {
    console.log(redirectToken, 'redirectToken');

    signInWithCustomToken(authFirebase, redirectToken)
      .then(async (userCredential: any) => {
        console.log(userCredential.user, 'userCredential.user');
        setAuthUser(userCredential.user);
        setLoading(false);

        localStorage.clear();
        const userResult = await apiClient.get(
          `/user/v1/user/email/${userCredential.user.email}`
        );
        console.log(userResult, 'userResult');

        const userResponse = userResult.data.response;
        if (userResponse.verified) {
          const userData = {
            id: userResponse.id,
            name: userResponse.name,
            email: userCredential.user.email,
            user_hash: userResponse.user_hash,
            brand: userResponse.brand,
            brand_hash: userResponse.brand_hash,
            image: userResponse.image,
            track: userResponse.track_usage,
            team: userResponse.team,
            admin: userResponse.admin_verified,
            weights: userResponse.weights,
            fintech_brands: userResponse.fintech_brands,
            brand_pub_mapping: userResponse.brand_pub_mapping,
            brand_goals: userResponse.brand_goals,
            brand_images: userResponse.brand_images,
            notifications: userResponse.notifications,
            taxonomyNotifications: userResponse.taxonomyNotifications,
            mobile: userResponse.mobile,
            meeting_link: userResponse.meeting_link,
            position: userResponse.position,
            is_admin: userResponse.is_admin,
            verified: userResponse?.verified,
          };
          sessionStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('super_admin', JSON.stringify(userData));

          const desc = {
            message: `User with email ${userCredential.user.email} logged in`,
            status: userResult.status,
            method: userResult.config.method,
            url: userResult.config.url,
          };

          const user = JSON.parse(localStorage.getItem('user') as string);
          await actionLogTrack(JSON.stringify(desc), false, {
            id: user.id,
            email: user.email,
            name: user.name,
          });

          setWillNavigate(true);

          Toastify('success', 'Login Successfully');
        } else {
          setWillNavigateForWaiting(true);
        }
      })
      .catch((error) => {
        Toastify('error', error);
        console.error('Error signing in with token:', error);
      });
  };
  useEffect(() => {
    const unsubscribe = authFirebase.onAuthStateChanged((user) => {
      setAuthUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const contextValue: AuthContextType = {
    authUser,
    loginUserWithPasswordEmail,
    signUpUserWithPasswordEmail,
    loginUserWithGoogleSignIn,
    forgotPassword,
    handleLogout,
    SSOSignIn,
    willnavigate,
    willnavigateForWaiting,
    loading,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
