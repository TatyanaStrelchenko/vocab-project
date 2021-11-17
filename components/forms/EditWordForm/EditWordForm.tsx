import React, { FormEvent, ChangeEvent, ContextType } from 'react';
import {
  Alert,
  Form,
  Label,
  FormGroup,
  CustomInput,
  FormFeedback,
  Button,
} from 'reactstrap';
import Joi from 'joi';
import 'pretty-checkbox';
import { Radio } from 'pretty-checkbox-react';
import { MdClear } from 'react-icons/md';
import { noop } from 'lodash';
import {
  texts,
  CHARACTER_REGEXP,
  FILE_SIZE_LIMIT,
  WordStateField,
} from '@vocab/shared';
import {
  ADD_EDIT_ERROR_MESSAGES,
  IMAGE_HOLDER,
  STATES,
} from '../../../constants';
import { BaseForm } from '../BaseForm';
import { SettingsContext } from '../../../context/settings';
import { getUserWord } from '../../../services/word-service';
import { getWordlistWord } from '../../../services/wordlist-service';
import styles from './styles.module.scss';

interface Props {
  setFormData: (formData: FormData) => void;
  setIsEditFormDisabled: (newValue: boolean) => void;
}

interface Errors {
  [key: string]: string;
}

interface States {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  errors: Errors;
  imgPreview: string | undefined;
  theInputKey: string;
  oldImage: string;
}

export class EditWordForm extends BaseForm<Props> {
  static contextType = SettingsContext;
  context!: ContextType<typeof SettingsContext>;

  form = React.createRef<HTMLFormElement>();

  state: States = {
    data: {
      _id: '',
      en: '',
      ru: '',
      de: '',
      img: '',
      hint: '',
      state: 'to distribute',
    },
    errors: {},
    imgPreview: '',
    theInputKey: '',
    oldImage: '',
  };

  onChangeForm = (e: FormEvent<HTMLFormElement>) => {
    this.props.setFormData(new FormData(e.currentTarget));
  };

  schema = {};

  componentDidMount() {
    const { oldWordId, wordlistId } = this.props;
    if (!oldWordId) return;
    const getWordData = async () => {
      try {
        const word = wordlistId
          ? await getWordlistWord(wordlistId, oldWordId)
          : await getUserWord(oldWordId);
        const oldWord = {
          _id: word.data._id,
          en: word.data.en,
          ru: word.data.ru,
          de: word.data.de,
          hint: word.data.hint,
          state: word.data.state,
          img: word.data.img.x1 || IMAGE_HOLDER,
        };
        this.setState({
          data: oldWord,
          oldImage: word.data.img.x1,
          imgPreview: word.data.img.x1,
        });
      } catch (ex) {
        this.setState({
          errors: ex.response,
        });
      }
    };
    getWordData();
  }

  emptyString = Joi.string()
    .allow('')
    .error(() => ADD_EDIT_ERROR_MESSAGES.atLeastTwoOutOfThreeWordsRequired);
  notEmptyString = Joi.string()
    .required()
    .error(() => ADD_EDIT_ERROR_MESSAGES.atLeastTwoOutOfThreeWordsRequired);

  withOptionalDe = Joi.object().keys({
    de: this.emptyString
      .regex(CHARACTER_REGEXP.onlyGerman)
      .error(() => ADD_EDIT_ERROR_MESSAGES.onlyCertainCharacters),
    en: this.notEmptyString
      .regex(CHARACTER_REGEXP.onlyEnglish)
      .error(() => ADD_EDIT_ERROR_MESSAGES.onlyCertainCharacters),
    ru: this.notEmptyString
      .regex(CHARACTER_REGEXP.onlyRussian)
      .error(() => ADD_EDIT_ERROR_MESSAGES.onlyCertainCharacters),
  });
  withOptionalEn = Joi.object().keys({
    de: this.notEmptyString
      .regex(CHARACTER_REGEXP.onlyGerman)
      .error(() => ADD_EDIT_ERROR_MESSAGES.onlyCertainCharacters),
    en: this.emptyString
      .regex(CHARACTER_REGEXP.onlyEnglish)
      .error(() => ADD_EDIT_ERROR_MESSAGES.onlyCertainCharacters),
    ru: this.notEmptyString
      .regex(CHARACTER_REGEXP.onlyRussian)
      .error(() => ADD_EDIT_ERROR_MESSAGES.onlyCertainCharacters),
  });
  withOptionalRu = Joi.object().keys({
    de: this.notEmptyString
      .regex(CHARACTER_REGEXP.onlyGerman)
      .error(() => ADD_EDIT_ERROR_MESSAGES.onlyCertainCharacters),
    en: this.notEmptyString
      .regex(CHARACTER_REGEXP.onlyEnglish)
      .error(() => ADD_EDIT_ERROR_MESSAGES.onlyCertainCharacters),
    ru: this.emptyString
      .regex(CHARACTER_REGEXP.onlyRussian)
      .error(() => ADD_EDIT_ERROR_MESSAGES.onlyCertainCharacters),
  });

  schemaWithAlternatives = Joi.alternatives().try(
    this.withOptionalDe,
    this.withOptionalEn,
    this.withOptionalRu,
  );

  handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    const data = { ...this.state.data };
    data[name] = value;
    this.setState({ data }, this.customValidate);
  };

  customValidate = () => {
    const options = { abortEarly: false };
    const data = {
      en: this.state.data.en,
      ru: this.state.data.ru,
      de: this.state.data.de,
    };
    const valid = Joi.validate(data, this.schemaWithAlternatives, options);
    let newErrors: Errors = {};

    if (valid.error) {
      for (const item of valid.error.details) {
        newErrors[item.path[0]] = item.message;
      }
      this.props.setIsEditFormDisabled(true);
    } else {
      this.props.setIsEditFormDisabled(false);
    }
    if (!this.state.data.img) {
      this.props.setIsEditFormDisabled(true);
      newErrors = { ...newErrors, img: ADD_EDIT_ERROR_MESSAGES.emptyImage };
    }
    this.setState({ errors: newErrors });
  };

  doSubmit = noop;

  handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { files, value } = event.currentTarget;

    if (files && files.length) {
      if (files[0].size > FILE_SIZE_LIMIT) {
        this.setState({
          errors: {
            ...this.state.errors,
            img: ADD_EDIT_ERROR_MESSAGES.fileSize,
          },
        });
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(files[0]);

        reader.onload = (e) => {
          this.setState({
            data: { ...this.state.data, img: value },
            errors: { ...this.state.errors, img: '' },
            imgPreview: e.target?.result,
          });
          this.customValidate();
        };

        reader.onerror = () => {
          this.setState({
            errors: {
              ...this.state.errors,
              img: ADD_EDIT_ERROR_MESSAGES.load,
            },
          });
        };
      }
    }
  };

  handleResetImage = () => {
    this.setState({
      imgPreview: this.state.oldImage,
      theInputKey: Date.now(),
      data: { ...this.state.data, img: this.state.oldImage },
    });
  };

  handleStateChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      data: { ...this.state.data, state: e.target.value as WordStateField },
    });
  };

  render() {
    const { errors, imgPreview, data } = this.state;
    const { interfaceLanguage } = this.context.settings;

    return (
      <Form
        onChange={this.onChangeForm}
        innerRef={this.form}
        encType="multipart/form-data"
      >
        {this.renderInputField(
          'en',
          texts[interfaceLanguage].components.inputFields.englishLabel,
          texts[interfaceLanguage].components.inputFields.englishPlaceholder,
        )}
        {this.renderInputField(
          'ru',
          texts[interfaceLanguage].components.inputFields.russianLabel,
          texts[interfaceLanguage].components.inputFields.russianPlaceholder,
        )}
        {this.renderInputField(
          'de',
          texts[interfaceLanguage].components.inputFields.germanLabel,
          texts[interfaceLanguage].components.inputFields.germanPlaceholder,
        )}
        {this.renderInputField(
          'hint',
          texts[interfaceLanguage].components.inputFields.hintLabel,
          texts[interfaceLanguage].components.inputFields.hintPlaceholder,
        )}
        <FormGroup>
          <Label for="pickImage">
            {texts[interfaceLanguage].components.inputFields.imageLabel}
          </Label>
          <CustomInput
            type="file"
            className={styles.customFileInput}
            id="pickImage"
            name="img"
            label="Pick a file"
            key={this.state.theInputKey}
            onChange={this.handleFileChange}
            accept=".jpg, .jpeg, .png, .gif"
            invalid={errors.img ? true : false}
          />
          <FormFeedback>{errors.file}</FormFeedback>
        </FormGroup>
        {imgPreview && (
          <FormGroup>
            <div className={styles.preview}>
              <img src={imgPreview} alt="" />
              <Button
                type="button"
                aria-label="Reset image"
                title="Reset image"
                className={styles.reset}
                size="sm"
                onClick={this.handleResetImage}
              >
                <MdClear />
              </Button>
            </div>
          </FormGroup>
        )}
        <FormGroup>
          <Label className="my-0">
            {texts[interfaceLanguage].components.inputFields.statusLabel}
          </Label>
          {Object.keys(STATES).map((key) => (
            <Radio
              className="d-block my-3"
              key={key}
              checked={key === data.state}
              value={key}
              name="state"
              color="primary"
              baseId={key}
              state={key}
              onChange={this.handleStateChange}
            >
              {
                texts[interfaceLanguage].components.wordCard[
                  key as WordStateField
                ]
              }
            </Radio>
          ))}
        </FormGroup>

        {errors.img && <Alert color="warning">{errors.img}</Alert>}
      </Form>
    );
  }
}
