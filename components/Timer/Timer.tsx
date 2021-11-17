import React, { useEffect, useState } from 'react';
import { SettingsContext } from '../../context/settings';
import { TIME_EXERCISES } from '../../constants';
import styles from './styles.module.scss';

const READ_RATIO = 0.1;
const WRITE_RATIO = 1;
const RED_TIME_INTERVAL = 3;
const UMLAUT_TIME_RATIO = 1;
const ON_SEC_IN_MS = 1000;

interface Props {
  correctWord: string;
  userInput: string;
  onExpiration?: () => void;
}

export const Timer: React.FC<Props> = ({
  correctWord,
  userInput,
  onExpiration,
}) => {
  const { minTimeForExercises } = React.useContext(SettingsContext).settings;
  const minTime = minTimeForExercises / TIME_EXERCISES.divider;

  const readTime = correctWord.length * READ_RATIO;
  const writeTime = userInput.length * WRITE_RATIO;
  const umlautCharactersQuantity = userInput.match(/ä|ö|ü|ß|Ä|Ö|Ü/g) || [];
  const umlautTimeCorrection =
    umlautCharactersQuantity.length * UMLAUT_TIME_RATIO;
  let computedTime = Math.ceil(readTime + writeTime) + umlautTimeCorrection;
  computedTime = computedTime < minTime ? minTime : computedTime;
  const [counter, setCounter] = useState(computedTime);

  useEffect(() => {
    let timer: NodeJS.Timer;
    if (counter > 0) {
      timer = setInterval(() => setCounter(counter - 1), ON_SEC_IN_MS);
    } else if (onExpiration) {
      onExpiration();
    }
    return () => clearInterval(timer);
  }, [counter, onExpiration]);

  const currentStyle = counter > RED_TIME_INTERVAL ? styles.green : styles.red;

  return (
    <div className={currentStyle}>
      <b>{counter}</b>
    </div>
  );
};
