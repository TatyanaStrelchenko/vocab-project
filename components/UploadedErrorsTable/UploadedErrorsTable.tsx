import React, { useContext } from 'react';
import { Table, Button } from 'reactstrap';
import { Image, texts } from '@vocab/shared';
import { SettingsContext } from '../../context/settings';
import styles from './styles.module.scss';

export interface ErrorReport {
  en: string;
  de: string;
  ru: string;
  hint: string;
  img: Image;
  error: string;
}

interface Props {
  errors: ErrorReport[];
  confirmButtonText: string;
  handleConfirm(): void;
}

export const UploadedErrorsTable: React.FC<Props> = (props: Props) => {
  const { errors, confirmButtonText, handleConfirm } = props;
  const { interfaceLanguage } = useContext(SettingsContext).settings;

  return (
    <>
      <div className={styles.btnWrapper}>
        <Button color="primary" onClick={handleConfirm}>
          {confirmButtonText}
        </Button>
      </div>
      <Table size="sm" responsive={true} bordered hover>
        <thead>
          <tr>
            <td>
              {texts[interfaceLanguage].components.uploadedErrorsTable.error}
            </td>
            <td>
              {texts[interfaceLanguage].components.uploadedErrorsTable.english}
            </td>
            <td>
              {texts[interfaceLanguage].components.uploadedErrorsTable.russian}
            </td>
            <td>
              {texts[interfaceLanguage].components.uploadedErrorsTable.german}
            </td>
            <td>
              {texts[interfaceLanguage].components.uploadedErrorsTable.hint}
            </td>
            <td>
              {texts[interfaceLanguage].components.uploadedErrorsTable.image}
            </td>
          </tr>
        </thead>
        <tbody>
          {errors.map((word: ErrorReport, index: number) => (
            <tr key={index}>
              <td>{word.error}</td>
              <td>{word.en}</td>
              <td>{word.ru}</td>
              <td>{word.de}</td>
              <td>{word.hint}</td>
              <td>{word.img.originalUrl}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};
