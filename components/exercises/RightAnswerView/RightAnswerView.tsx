import React from 'react';
import { Button } from 'reactstrap';
import { AiFillSound } from 'react-icons/ai';
import { IoIosArrowRoundForward } from 'react-icons/io';
import { Image as ImageType, Language } from '@vocab/shared';
import { Image } from '../../Image';
import exercisesStyles from '../exercises.module.scss';

interface Props {
  isSuccess: boolean;
  userInput: string;
  correctText: string;
  helpLanguageText: string;
  img: ImageType;
  handleSynthesis: (language?: Language) => void;
}

export const RightAnswerView: React.FC<Props> = (props) => {
  const {
    isSuccess,
    userInput,
    correctText,
    helpLanguageText,
    img,
    handleSynthesis,
  } = props;

  return (
    <>
      <div className={exercisesStyles.imageWrapper}>
        <Image img={img} alt={correctText} />
        <Button
          color="secondary"
          className={exercisesStyles.soundButtonResult}
          onClick={() => handleSynthesis()}
        >
          <AiFillSound />
        </Button>
      </div>
      <div className={exercisesStyles.answersBlock}>
        <h2>
          <span className={isSuccess ? 'text-success' : 'text-danger'}>
            {userInput}{' '}
          </span>
          {!isSuccess && <IoIosArrowRoundForward />}
          {!isSuccess && <> {correctText}</>}
        </h2>
        <div className="text-center">({helpLanguageText})</div>
      </div>
    </>
  );
};
