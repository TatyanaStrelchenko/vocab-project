import React from 'react';
import { WordType } from '@vocab/shared';
import { Image } from './../Image/index';
import styles from './styles.module.scss';

interface Props {
  words: WordType[];
  onPick: (index: number) => void;
}

export const ImagePicker: React.FC<Props> = ({ words, onPick }) => (
  <div className={styles.container}>
    {words.map((word, index) => (
      <button
        className={styles.button}
        key={index}
        onClick={() => onPick(index)}
      >
        <Image img={word.img} alt="" />
      </button>
    ))}
  </div>
);
