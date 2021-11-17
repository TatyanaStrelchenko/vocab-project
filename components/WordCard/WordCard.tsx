import React, { useContext } from 'react';
import { Jumbotron, Button } from 'reactstrap';
import { IoIosArrowRoundForward } from 'react-icons/io';
import { AiFillSound } from 'react-icons/ai';
import { WordType, WordStateField, texts } from '@vocab/shared';
import { SettingsContext } from '../../context/settings';
import { Image } from '../Image';
import { STATES } from '../../constants';
import styles from './styles.module.scss';

interface WordCardProps {
  word: WordType;
  stateChange: (wordId: string, state: string) => void;
  synthesizeWord: (word: string) => void;
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  stateChange,
  synthesizeWord,
}) => {
  const { learnLanguage, helpLanguage, interfaceLanguage } = useContext(
    SettingsContext,
  ).settings;

  const handleSynthesis = () => {
    synthesizeWord(word[learnLanguage]);
  };

  const toSentenceCase = (string: string) => {
    return string[0].toUpperCase() + string.slice(1);
  };

  const handleStateChange = (e: React.FormEvent<HTMLInputElement>) => {
    const status = e.currentTarget.value;
    stateChange(word._id, status);
  };

  if (word[learnLanguage]) handleSynthesis();

  const hint = word.hint && (
    <span className={styles.hint}>{` (${word.hint})`}</span>
  );

  return (
    <Jumbotron className={styles.wordCard}>
      <div className={styles.imageWrapper}>
        <Image img={word.img} alt={word[helpLanguage]} />
        <Button
          color="secondary"
          className={styles.soundButton}
          onClick={handleSynthesis}
        >
          <AiFillSound />
        </Button>
      </div>
      <h2 className="mt-0 mb-0 mt-md-2 mb-md-3">
        {word[learnLanguage]} <IoIosArrowRoundForward /> {word[helpLanguage]}
        <br />
        {hint}
      </h2>
      <div className="d-flex justify-content-center flex-wrap">
        {(Object.keys(STATES) as WordStateField[])
          .filter((state) => state !== 'to distribute')
          .map((key) => (
            <Button
              key={key}
              color={STATES[key]}
              value={key}
              className={styles.button}
              onClick={handleStateChange}
            >
              {toSentenceCase(
                texts[interfaceLanguage].components.wordCard[key],
              )}
            </Button>
          ))}
      </div>
    </Jumbotron>
  );
};
