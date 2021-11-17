import React, { useRef, useContext, useEffect } from 'react';
import { FormGroup, Label, Input } from 'reactstrap';
import { Image as ImageType, Language, texts } from '@vocab/shared';
import { FaTimes } from 'react-icons/fa';
import { SpeechConverter } from '../../SpeechConverter';
import { SettingsContext } from '../../../context/settings';
import { UmlautKeyboard } from '../../UmlautKeyboard';
import { Image } from '../../Image';
import exercisesStyles from '../exercises.module.scss';

interface Props {
  img: ImageType;
  wordText: string;
  learnLanguage: Language;
  placeholder: string;
  userInput?: string | number | readonly string[];
  handleUserInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  clearUserInput: (event: React.MouseEvent<SVGElement, MouseEvent>) => void;
}

export const ImageToLearnLanguage: React.FC<Props> = (props) => {
  const {
    img,
    wordText,
    handleUserInput,
    learnLanguage,
    placeholder,
    clearUserInput,
    userInput,
  } = props;

  const inputEl = useRef<HTMLInputElement>(null);
  const { interfaceLanguage } = useContext(SettingsContext).settings;

  useEffect(() => {
    if (inputEl && inputEl.current) inputEl.current.focus();
  });

  return (
    <div className={exercisesStyles.flexColumnEnd}>
      <div className={exercisesStyles.imageWrapper}>
        <Image img={img} alt={wordText} />
      </div>
      <div className={exercisesStyles.speachBtnHolder}>
        <SpeechConverter language={learnLanguage} />
      </div>
      <FormGroup className={exercisesStyles.formBlock}>
        <Label for="word" hidden>
          {texts[interfaceLanguage].components.exercises.inputTheWord}
        </Label>
        <Input
          type="text"
          name="Word"
          id="word"
          className="text-center"
          innerRef={inputEl}
          value={userInput}
          placeholder={placeholder}
          onChange={handleUserInput}
          autoFocus
        />
        {userInput && (
          <FaTimes
            className={exercisesStyles.clearBtn}
            onClick={(event) => {
              clearUserInput(event);
              if (inputEl && inputEl.current) inputEl.current.focus();
            }}
          />
        )}
      </FormGroup>

      {learnLanguage === 'de' && <UmlautKeyboard inputRef={inputEl} />}
    </div>
  );
};
