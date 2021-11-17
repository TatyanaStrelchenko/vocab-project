import React, { useContext, useEffect } from 'react';
import { Alert as AlertReactstrap } from 'reactstrap';
import { SettingsContext } from '../../context/settings';
import styles from './styles.module.scss';

interface Props {
  message: string;
  color: string;
  onHide(): void;
}

export const Alert: React.FC<Props> = ({ message, onHide, color }) => {
  const { timeForTheAlertMessage } = useContext(SettingsContext).settings;

  useEffect(() => {
    const timeout = setTimeout(() => {
      onHide();
    }, timeForTheAlertMessage);

    return () => clearTimeout(timeout);
  }, [onHide, timeForTheAlertMessage]);

  return (
    <AlertReactstrap
      className={styles.alert}
      color={color}
      toggle={() => onHide()}
    >
      {message}
    </AlertReactstrap>
  );
};
