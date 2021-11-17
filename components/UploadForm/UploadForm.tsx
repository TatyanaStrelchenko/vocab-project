import React, { SyntheticEvent, useState, useContext } from 'react';
import {
  Form,
  FormText,
  CustomInput,
  Button,
  InputGroup,
  InputGroupAddon,
  UncontrolledCollapse,
} from 'reactstrap';
import { texts } from '@vocab/shared';
import { SettingsContext } from '../../context/settings';
import styles from './styles.module.scss';

interface Props {
  uploadFile: (formData: FormData) => void;
}

export const UploadForm: React.FC<Props> = (props) => {
  const { uploadFile } = props;
  const [isInValid, setIsInValid] = useState(false);
  const { interfaceLanguage } = useContext(SettingsContext).settings;

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const file = form.elements.namedItem('wordsData') as HTMLFormElement;

    if (file.files.length === 0) {
      setIsInValid(true);
      return;
    }

    const formData = new FormData(form);
    uploadFile(formData);
  };

  const changeHandler = () => {
    setIsInValid(false);
  };

  return (
    <>
      <div className="text-center">
        <Button
          color="info"
          size="sm"
          outline
          className="mb-4"
          id="togglerImportForm"
        >
          {texts[interfaceLanguage].components.uploadForm.importWords}
        </Button>
      </div>
      <UncontrolledCollapse toggler="#togglerImportForm">
        <Form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="custom-container pt-1 mb-5 border rounded"
        >
          <h2>{texts[interfaceLanguage].components.uploadForm.importWords}</h2>
          <InputGroup>
            <CustomInput
              type="file"
              id="wordsData"
              name="wordsData"
              accept=".csv, .json"
              label={texts[interfaceLanguage].components.uploadForm.chooseFile}
              invalid={isInValid}
              onChange={changeHandler}
              className={styles.fileInput}
            />
            <InputGroupAddon addonType="append">
              <Button color="info" className={styles.addon}>
                {texts[interfaceLanguage].components.uploadForm.submit}
              </Button>
            </InputGroupAddon>
          </InputGroup>
          <FormText>
            {texts[interfaceLanguage].components.uploadForm.text1} <br />
            {texts[interfaceLanguage].components.uploadForm.text2} <br />
            {texts[interfaceLanguage].components.uploadForm.text3}
          </FormText>
        </Form>
      </UncontrolledCollapse>
    </>
  );
};
