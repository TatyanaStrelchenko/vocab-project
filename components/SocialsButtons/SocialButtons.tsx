import React from 'react';
import {
  GoogleLogin,
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
} from 'react-google-login';
import FacebookLogin, {
  ReactFacebookLoginInfo,
  ReactFacebookFailureResponse,
} from 'react-facebook-login';
import classnames from 'classnames';
import { IoLogoFacebook, IoLogoGoogle } from 'react-icons/io';
import { SocialData, Language, texts } from '@vocab/shared';
import { googleClientID, fbAppID } from '../../config.json';
import styles from './styles.module.scss';

interface Props {
  initialInterfaceLanguage: Language;
  detectUser: (socialData: SocialData) => void;
}

export const SocialButtons = ({
  detectUser,
  initialInterfaceLanguage,
}: Props) => {
  const interfaceLanguage = initialInterfaceLanguage;

  const handleGoogleLogin = (
    response: GoogleLoginResponse | GoogleLoginResponseOffline,
  ) => {
    if ('googleId' in response) {
      const data: SocialData = {
        email: response.profileObj.email,
        name: response.profileObj.name,
        oauth: { googleId: response.googleId },
      };
      detectUser(data);
    }
  };

  const handleFacebookLogin = (
    userInfo: ReactFacebookLoginInfo | ReactFacebookFailureResponse,
  ) => {
    if ('id' in userInfo) {
      const data: SocialData = {
        email: userInfo.email,
        name: userInfo.name ?? '',
        oauth: { facebookId: userInfo.id },
      };
      detectUser(data);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className="text-center">
        <p>{texts[interfaceLanguage].components.socialButtons.or}</p>
      </div>
      <div className={styles.btnHolder}>
        <GoogleLogin
          clientId={googleClientID}
          buttonText={
            texts[interfaceLanguage].components.socialButtons.continueGoogle
          }
          onSuccess={handleGoogleLogin}
          onFailure={handleGoogleLogin}
          render={(renderProps) => (
            <button
              onClick={renderProps.onClick}
              className={classnames(styles.button, 'mb-3')}
            >
              <IoLogoGoogle className={styles.button__google} />
              {texts[interfaceLanguage].components.socialButtons.continueGoogle}
            </button>
          )}
        />
        <FacebookLogin
          appId={fbAppID}
          autoLoad={false}
          fields="email,name"
          callback={handleFacebookLogin}
          onFailure={handleFacebookLogin}
          returnScopes={true}
          icon={<IoLogoFacebook className={styles.button__facebook} />}
          textButton={
            texts[interfaceLanguage].components.socialButtons.continueFacebook
          }
          cssClass={classnames(styles.button)}
        />
      </div>
    </div>
  );
};
