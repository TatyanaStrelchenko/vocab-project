import React, { useState, useContext } from 'react';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import { Language, SocialData } from '@vocab/shared';
import { LoginForm } from '../../components/forms/LoginForm';
import { SocialButtons } from '../../components/SocialsButtons';
import { CreatePasswordForm } from '../../components/forms/CreatePasswordForm';
import { Alert } from '../../components/Alert';
import { SettingsContext } from '../../context/settings';
import { getSettings } from '../../services/settings-service';
import { SOCIALS_ERROR_MESSAGE } from '../../constants';
import { check } from '../../services/user-service';
import {
  loginOauth,
  getCurrentUser,
  isLoggedInAndConfirmed,
} from '../../services/auth-service';

interface Props extends RouteComponentProps {
  initialInterfaceLanguage: Language;
  onGetUserData(): void;
}

export const SignIn: React.FC<Props> = (props) => {
  const { onGetUserData, history, initialInterfaceLanguage } = props;
  const { setSettings } = useContext(SettingsContext);
  const [isCreatePasswordForm, setIsCreatePasswordForm] = useState(false);
  const [data, setData] = useState({});
  const [isAlertShown, setIsAlertShown] = useState(false);

  const detectUser = async (socialData: SocialData) => {
    if (!socialData.email) {
      return;
    }

    const user = await check({ email: socialData.email });
    if (user.data) {
      handleOauthLogin(socialData);
    } else {
      setData(socialData);
      setIsCreatePasswordForm(true);
    }
  };

  const handleOauthLogin = async (data: SocialData) => {
    try {
      await loginOauth(data);
      const userId = getCurrentUser()._id || '';
      setNewSettingsContext(userId);
      history.push('/');
    } catch (ex) {
      if (ex.response && ex.response.status === 401) {
        setIsAlertShown(true);
      }
    }
  };

  const setNewSettingsContext = async (userId: string) => {
    onGetUserData();
    try {
      const response = await getSettings(userId);
      setSettings(response.data);
      return response;
    } catch (ex) {
      if (ex.response && ex.response.status === 401) {
        return ex.response;
      }
    }
  };

  return (
    <>
      {isAlertShown && (
        <Alert
          message={SOCIALS_ERROR_MESSAGE}
          color="danger"
          onHide={() => setIsAlertShown(false)}
        />
      )}
      {isLoggedInAndConfirmed() && <Redirect to="/" />}

      {isCreatePasswordForm && (
        <CreatePasswordForm
          userData={data}
          history={history}
          initialInterfaceLanguage={initialInterfaceLanguage}
          setSettingsContext={setNewSettingsContext}
        />
      )}

      {!isCreatePasswordForm && (
        <>
          <LoginForm
            history={history}
            initialInterfaceLanguage={initialInterfaceLanguage}
            setSettingsContext={setNewSettingsContext}
          />
          <SocialButtons
            initialInterfaceLanguage={initialInterfaceLanguage}
            detectUser={detectUser}
          />
        </>
      )}
    </>
  );
};
