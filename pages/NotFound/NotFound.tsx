import React, { useContext } from 'react';
import { texts } from '@vocab/shared';
import { SettingsContext } from '../../context/settings';
import styles from './styles.module.scss';

export const NotFound: React.FC = () => {
  const { interfaceLanguage } = useContext(SettingsContext).settings;

  return (
    <div className={styles.wrapper}>
      <h2>{texts[interfaceLanguage].pages.notFound.title}</h2>
    </div>
  );
};
