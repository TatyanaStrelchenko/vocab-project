import React, { MouseEvent } from 'react';
import { Button } from 'reactstrap';
import styles from './styles.module.scss';

interface Props {
  inputRef: React.RefObject<HTMLInputElement>;
}

export const UmlautKeyboard: React.FC<Props> = ({ inputRef }) => {
  const onButtonClick = (e: MouseEvent) => {
    if (inputRef.current) {
      const input = inputRef.current;
      const character = e.currentTarget.innerHTML;
      const cursorStartPosition = inputRef.current.selectionStart;
      const cursorEndPosition = inputRef.current.selectionEnd;

      if (cursorStartPosition && cursorEndPosition) {
        const beforeCursor = input.value.slice(0, cursorStartPosition);
        const afterCursor = input.value.slice(cursorEndPosition);
        input.value = `${beforeCursor}${character}${afterCursor}`;
        input.focus();

        inputRef.current.setSelectionRange(
          cursorStartPosition + 1,
          cursorStartPosition + 1,
        );
      } else {
        input.value = character;
        input.focus();
      }
    }
  };

  return (
    <div className={styles.UmlautKeyboard}>
      {['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'].map((umlaut, index) => (
        <Button color="success" onClick={onButtonClick} key={index}>
          {umlaut}
        </Button>
      ))}
    </div>
  );
};
