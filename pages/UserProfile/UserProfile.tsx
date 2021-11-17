import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import Avatar, { ConfigProvider } from 'react-avatar';
import { Badge, Button } from 'reactstrap';
import { UserData, Image, texts } from '@vocab/shared';
import { SettingsContext } from '../../context/settings';
import { UserProfileForm } from '../../components/forms/UserProfileForm';
import { sendConfirmation } from '../../services/confirmation-service';
import { Alert } from '../../components/Alert';
import { AVATAR_REDIRECT_URL_LINK } from '../../constants';
import styles from './styles.module.scss';

interface Props {
  user: UserData;
  onChangeUserData(user: UserData): void;
}

export const UserProfile: React.FC<Props> = (props) => {
  const { user, onChangeUserData } = props;
  const [isAlertShown, setIsAlertShown] = useState(false);
  const { interfaceLanguage } = useContext(SettingsContext).settings;

  const handleConfirm = () => {
    sendConfirmation(user.email);
    setIsAlertShown(true);
  };

  const handleSubmit = (name: string, email: string, profilePicture: Image) => {
    const updatedUser = { ...user, name, email, profilePicture };
    onChangeUserData(updatedUser);
  };

  return (
    <ConfigProvider avatarRedirectUrl={AVATAR_REDIRECT_URL_LINK}>
      <div className={styles.wrapper}>
        {isAlertShown && (
          <Alert
            message={
              texts[interfaceLanguage].pages.userProfile.confirmationHasBeenSent
            }
            color="success"
            onHide={() => setIsAlertShown(false)}
          />
        )}
        <div className={styles.user_info}>
          <Avatar
            name={user.name}
            googleId={user.profilePicture?.x1 ? '' : user.oauth.googleId}
            facebookId={user.profilePicture?.x1 ? '' : user.oauth.facebookId}
            size="110"
            round={true}
            src={user.profilePicture?.x1}
          />
          <div className={styles.credentials}>
            <p className={styles.name}>{user.name}</p>
            <p className="mb-2 mr-2 text-muted">{user.email}</p>
            {user.isConfirmed ? (
              <Badge color="success align-middle mr-2">
                {texts[interfaceLanguage].pages.userProfile.emailConfirmed}
              </Badge>
            ) : (
              <Button onClick={handleConfirm} className="mr-2" color="link p-0">
                {texts[interfaceLanguage].pages.userProfile.confirmButton}
              </Button>
            )}
            <Link className="align-middle" to="/forgot_password">
              {texts[interfaceLanguage].pages.userProfile.resetPassword}
            </Link>
          </div>
        </div>
        <UserProfileForm
          name={user.name}
          email={user.email}
          id={user._id ? user._id : ''}
          onSubmit={handleSubmit}
        />
      </div>
    </ConfigProvider>
  );
};
