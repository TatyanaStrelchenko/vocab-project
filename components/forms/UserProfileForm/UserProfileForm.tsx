import React, { ChangeEvent, FormEvent, ContextType } from 'react';
import {
  Form,
  Label,
  FormGroup,
  CustomInput,
  FormFeedback,
  Button,
} from 'reactstrap';
import { noop } from 'lodash';
import {
  Language,
  texts,
  nameValidationSchema,
  emailValidationSchema,
  FILE_SIZE_LIMIT,
} from '@vocab/shared';
import { BaseForm } from '../BaseForm';
import { SettingsContext } from '../../../context/settings';
import { updateUser } from '../../../services/user-service';
import { Alert } from '../../Alert';
import { Loader } from '../../../components/Loader';
import styles from './styles.module.scss';

interface Props {
  name: string;
  email: string;
  img: string;
  id: string;
  onSubmit: (name: string, email: string, img: string) => void;
}

interface Errors {
  [key: string]: string;
}
interface FormData {
  [key: string]: string;
}
interface States {
  data: FormData;
  errors: Errors;
  isAlertShown: boolean;
  loading: boolean;
  theInputFileKey: string;
}

export class UserProfileForm extends BaseForm<Props> {
  static contextType = SettingsContext;
  context!: ContextType<typeof SettingsContext>;

  state: States = {
    data: { name: '', email: '', img: '' },
    errors: {},
    theInputFileKey: '',
    isAlertShown: false,
    loading: false,
  };

  lang!: Language;
  errFileSize!: string;
  errFileFormat!: string;
  errLoad!: string;

  componentDidMount() {
    const { name, email } = this.props;
    this.lang = this.context.settings.interfaceLanguage;
    this.errFileSize = texts[this.lang].components.forms.errFileSize;
    this.errFileFormat = texts[this.lang].components.forms.errFileFormat;
    this.errLoad = texts[this.lang].components.forms.errLoad;
    this.setState({ data: { name, email } });
  }

  schema = {
    name: nameValidationSchema,
    email: emailValidationSchema,
  };

  doSubmit = noop;

  onHandleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (Object.entries(this.state.errors).length > 0) return;
    try {
      const { data } = this.state;
      this.setState({
        loading: true,
      });
      const user = await updateUser(new FormData(e.currentTarget));

      this.showAlert(true);
      this.setState({
        theInputFileKey: Date.now(),
        loading: false,
      });
      this.props.onSubmit(data.name, data.email, user.profilePicture);
    } catch (ex) {
      if (ex.response) {
        this.setState({
          errors: {
            ...this.state.errors,
            email:
              ex.response.data ||
              texts[this.lang].components.forms.somethingWentWrong,
          },
        });
      }
    }
  };

  showAlert = (isShown: boolean) => {
    this.setState({ ...this.state, isAlertShown: isShown });
  };

  handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { files, value } = event.currentTarget;

    if (files && files.length) {
      if (files[0].size > FILE_SIZE_LIMIT) {
        this.setState({
          errors: {
            ...this.state.errors,
            img: this.errFileSize,
          },
        });
      } else if (
        !files[0].name.endsWith('.jpg') &&
        !files[0].name.endsWith('.png')
      ) {
        this.setState({
          errors: {
            ...this.state.errors,
            img: this.errFileFormat,
          },
        });
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(files[0]);

        reader.onload = (e) => {
          this.setState({
            data: { ...this.state.data, img: value },
            imgPreview: e.target?.result,
          });
        };

        reader.onerror = () => {
          this.setState({
            errors: {
              ...this.state.errors,
              img: this.errLoad,
            },
          });
        };
      }
    }
  };

  render() {
    const { errors, loading } = this.state;
    const { interfaceLanguage } = this.context.settings;

    return (
      <div className={styles.wrapper}>
        {this.state.isAlertShown && (
          <Alert
            message={texts[interfaceLanguage].components.forms.profileSaved}
            color="success"
            onHide={() => this.showAlert(false)}
          />
        )}
        <Form onSubmit={this.onHandleSubmit} encType="multipart/form-data">
          {this.renderInputField(
            'name',
            texts[interfaceLanguage].components.inputFields.nameLabel,
            texts[interfaceLanguage].components.inputFields.namePlaceholder,
          )}
          {this.renderInputField(
            'email',
            texts[interfaceLanguage].components.inputFields.emailLabel,
            texts[interfaceLanguage].components.inputFields.emailPlaceholder,
          )}
          <FormGroup>
            <Label for="pickImage">
              {
                texts[interfaceLanguage].components.inputFields
                  .profileImageLabel
              }
            </Label>
            <CustomInput
              type="file"
              className={styles.customFileInput}
              id="pickImage"
              name="img"
              label={texts[interfaceLanguage].components.inputFields.pickFile}
              key={this.state.theInputFileKey}
              onChange={this.handleFileChange}
              accept=".jpg, .jpeg, .png"
              invalid={errors.img ? true : false}
            >
              <FormFeedback>{errors.img}</FormFeedback>
            </CustomInput>
          </FormGroup>
          <div className={styles.controls}>
            <Button
              color="primary"
              className="btn btn-block"
              disabled={Boolean(Object.keys(errors).length)}
            >
              {texts[interfaceLanguage].components.forms.save}
            </Button>
          </div>
        </Form>
        {loading && <Loader />}
      </div>
    );
  }
}
