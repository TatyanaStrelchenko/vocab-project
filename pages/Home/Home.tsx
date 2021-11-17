import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { WordStateField, texts } from '@vocab/shared';
import { get } from 'lodash';
import { getExercisesList } from '../../constants';
import { SettingsContext } from '../../context/settings';
import styles from './styles.module.scss';

interface Props {
  mode: WordStateField;
}

export const Home: React.FC<Props> = () => {
  const { helpLanguage, learnLanguage, interfaceLanguage } = useContext(
    SettingsContext,
  ).settings;

  const exercisesList = getExercisesList(
    helpLanguage,
    learnLanguage,
    interfaceLanguage,
  );

  const renderExercises = (mode: 'to learn' | 'to repeat') => (
    <div className={styles.exercises}>
      <span className={styles.title}>
        {get(texts, [interfaceLanguage, 'pages', 'home', mode])}
      </span>
      {exercisesList.map((item, index) => (
        <Link
          key={index}
          to={`/exercises/${mode}${item.path}`}
          className={styles.exercises__link}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );

  return (
    <div className={styles.home__body}>
      <h1>{texts[interfaceLanguage].pages.home.title}</h1>
      <h2>
        {texts[interfaceLanguage].pages.home.addWordsTo}{' '}
        <Link to="/dictionary">
          {texts[interfaceLanguage].pages.home.dictionary}
        </Link>
      </h2>
      <h2>
        <Link to="/distributing">
          {texts[interfaceLanguage].pages.home.distribute}
        </Link>{' '}
        {texts[interfaceLanguage].pages.home.theWords}
      </h2>
      <h2>{texts[interfaceLanguage].pages.home.exerciseWords}</h2>
      <div className={styles.exercises__container}>
        {renderExercises('to learn')}
        {renderExercises('to repeat')}
      </div>
    </div>
  );
};
