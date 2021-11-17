import React, { useState, useEffect, useContext } from 'react';
import { RouteComponentProps, Link } from 'react-router-dom';
import { Alert } from 'reactstrap';
import { texts } from '@vocab/shared';
import { SettingsContext } from '../../context/settings';
import { ResetPasswordForm } from '../../components/forms/ResetPasswordForm';
import {
  validateToken,
  resetPassword,
} from '../../services/reset-password-service';
import { logout } from '../../services/auth-service';
import { Loader } from './../../components/Loader/';

export interface Params {
  token: string;
}

export const ResetPassword: React.FC<RouteComponentProps<Params>> = ({
  match,
}) => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setMessage] = useState('');
  const { interfaceLanguage } = useContext(SettingsContext).settings;

  useEffect(() => {
    const runEffect = async () => {
      try {
        await validateToken(match.params.token);
        setSuccess(true);
      } catch (ex) {
        setMessage(ex.response.data);
      } finally {
        setLoading(false);
      }
    };
    runEffect();
  }, [match.params.token]);

  const handleSubmit = async (password: string) => {
    try {
      await resetPassword(password, match.params.token);
      logout();
    } catch (ex) {
      setMessage(ex.response.data);
    } finally {
      setSuccess(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      {!loading && success && <ResetPasswordForm onSubmit={handleSubmit} />}
      {!loading && !success && errorMessage !== '' && (
        <Alert color="danger">{errorMessage}</Alert>
      )}
      {!loading && !success && errorMessage === '' && (
        <Alert color="success">
          {texts[interfaceLanguage].pages.resetPassword.message}{' '}
          <Link to="/login">
            {texts[interfaceLanguage].pages.resetPassword.signIn}
          </Link>
        </Alert>
      )}
    </>
  );
};
