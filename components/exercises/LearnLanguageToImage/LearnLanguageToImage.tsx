import React, { useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import { pick } from 'lodash';
import { AiFillSound } from 'react-icons/ai';
import { WordType, Language } from '@vocab/shared';
import { getRandomWords } from '../../../services/word-service';
import { ImagePicker } from '../../ImagePicker';
import { shuffleArray } from '../../../utils';
import { RANDOM_WORDS_NUMBER } from '../../../constants';
import exercisesStyles from '../exercises.module.scss';

interface Props {
  currentWord: WordType;
  wordText: string;
  handleSynthesis: (language?: Language) => void;
  handleSubmit: (word: WordType) => void;
}

export const LearnLanguageToImage: React.FC<Props> = (props) => {
  const { currentWord, wordText, handleSynthesis, handleSubmit } = props;
  const [wordsToRender, setWordsToRender] = useState<WordType[]>();

  useEffect(() => {
    handleSynthesis();
  }, [handleSynthesis]);

  useEffect(() => {
    let didCancel = false;

    const renderImages = async () => {
      const word = pick(
        currentWord,
        '_id',
        'ru',
        'de',
        'en',
        'img',
        'hint',
        'state',
      );
      const { data: words } = await getRandomWords(
        RANDOM_WORDS_NUMBER,
        word._id,
      );
      if (!didCancel) {
        setWordsToRender(shuffleArray([...words, word]));
      }
    };

    renderImages();

    return () => {
      didCancel = true;
    };
  }, [currentWord]);

  if (!wordsToRender) {
    return null;
  }

  return (
    <>
      <div className="text-center">
        <Button
          color="primary"
          onClick={() => handleSynthesis()}
          className={exercisesStyles.soundButton}
        >
          <AiFillSound />
        </Button>
        <h2>{wordText}</h2>
      </div>
      <ImagePicker
        words={wordsToRender}
        onPick={(index) => handleSubmit(wordsToRender[index])}
      />
    </>
  );
};
