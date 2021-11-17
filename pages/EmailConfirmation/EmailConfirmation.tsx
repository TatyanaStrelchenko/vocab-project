import React, { useState, useEffect, useContext } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Alert } from 'reactstrap';
import { texts } from '@vocab/shared';
import { SettingsContext } from '../../context/settings';
import { isLoggedIn } from '../../services/auth-service';
import { Loader } from './../../components/Loader/';
import { confirm } from './../../services/confirmation-service';

export interface Params {
  token: string;
}

export const EmailConfirmation: React.FC<RouteComponentProps<Params>> = (
  props,
) => {
  const { interfaceLanguage } = useContext(SettingsContext).settings;
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setMessage] = useState(
    texts[interfaceLanguage].pages.emailConfirmation.somethingWentWrong,
  );

  useEffect(() => {
    const runEffect = async () => {
      try {
        await confirm(props.match.params.token);
        setSuccess(true);
      } catch (ex) {
        setSuccess(false);
        setMessage(ex.response.data);
      } finally {
        setLoading(false);
      }
    };
    runEffect();
  }, [props.match.params.token]);

  return (
    <>
      {loading && <Loader />}
      {!loading && success && (
        <Alert color="success">
          {
            texts[interfaceLanguage].pages.emailConfirmation
              .accountHasBeenVerified
          }{' '}
          {!isLoggedIn() && (
            <a href="/login" className="alert-link">
              {texts[interfaceLanguage].pages.emailConfirmation.signIn}
            </a>
          )}
        </Alert>
      )}
      {!loading && !success && <Alert color="danger">{errorMessage}</Alert>}
    </>
  );
};
