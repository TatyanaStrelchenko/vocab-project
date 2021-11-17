import React, { ChangeEvent, ContextType } from 'react';
import { Alert, Form, Label, FormGroup, FormFeedback } from 'reactstrap';
import { Checkbox } from 'pretty-checkbox-react';
import 'pretty-checkbox';
import Joi from 'joi';
import { noop } from 'lodash';
import { texts } from '@vocab/shared';
import { WORDLISTS_MESSAGES } from '../../../constants';
import { BaseForm } from '../BaseForm';
import { SettingsContext } from '../../../context/settings';
import { getWordlist } from '../../../services/wordlist-service';
import { getCurrentUser } from '../../../services/auth-service';

interface Props {
  oldWordlistId?: string;
  setFormData: (formData: FormData) => void;
  setIsEditFormDisabled: (newValue: boolean) => void;
  isPublic: boolean;
}

interface Errors {
  [key: string]: string;
}

interface States {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  errors: Errors;
}

export class EditWordlistForm extends BaseForm<Props> {
  static contextType = SettingsContext;
  context!: ContextType<typeof SettingsContext>;

  state: States = {
    data: { _id: '', name: '', isPublic: this.props.isPublic },
    errors: {},
  };

  schema = {};

  componentDidMount() {
    const { oldWordlistId } = this.props;

    if (!oldWordlistId) return;
    const getWordlistData = async () => {
      try {
        const { data } = await getWordlist(oldWordlistId);
        const oldWordlist = {
          _id: data.wordlist._id,
          name: data.wordlist.name,
          isPublic: data.wordlist.privacyType === 'public',
        };
        this.setState({
          data: oldWordlist,
        });
      } catch (ex) {
        this.setState({
          errors: ex.response,
        });
      }
    };
    getWordlistData();
  }

  emptyName = Joi.string()
    .required()
    .trim()
    .min(1)
    .max(20)
    .error(() => WORDLISTS_MESSAGES.invalidName);
  wordlistSchema = Joi.object().keys({
    name: this.emptyName,
    isPublic: Joi.boolean().required(),
  });

  handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    const data = { ...this.state.data };
    data[name] = value;
    this.setState({ data }, this.customValidate);
    this.onChangeForm(data);
  };

  customValidate = () => {
    const options = { abortEarly: false };
    const data = {
      name: this.state.data.name,
      isPublic: this.state.data.isPublic,
    };
    const valid = Joi.validate(data, this.wordlistSchema, options);
    const newErrors: Errors = {};

    if (valid.error) {
      for (const item of valid.error.details) {
        newErrors[item.path[0]] = item.message;
      }
      this.props.setIsEditFormDisabled(true);
    } else {
      this.props.setIsEditFormDisabled(false);
    }
    this.setState({ errors: newErrors });
  };

  doSubmit = noop;

  publishWordlist = (e: React.ChangeEvent<HTMLInputElement>) => {
    const data = { ...this.state.data };
    data.isPublic = e.currentTarget.checked;
    this.setState({ data }, this.customValidate);
    this.onChangeForm(data);
  };

  onChangeForm = (data: { name: string | Blob; isPublic: string }) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('privacyType', data.isPublic ? 'public' : 'private');
    this.props.setFormData(formData);
  };

  render() {
    const { errors, data } = this.state;
    const user = getCurrentUser();
    const { interfaceLanguage } = this.context.settings;

    return (
      <Form>
        {this.renderInputField(
          'name',
          texts[interfaceLanguage].components.inputFields.wordlistNameLabel,
          texts[interfaceLanguage].components.inputFields
            .wordlistNamePlaceholder,
        )}
        {['admin', 'teacher'].includes(user.role) && (
          <FormGroup>
            <Label for="isPublic" className="mr-2">
              {texts[interfaceLanguage].components.inputFields.publicLabel}
            </Label>
            <Checkbox
              id="isPublic"
              color="primary"
              name="isPublic"
              value={data.isPublic}
              state={data.isPublic}
              onChange={this.publishWordlist}
            />
          </FormGroup>
        )}
        <FormGroup>
          <FormFeedback>{errors.file}</FormFeedback>
        </FormGroup>
        {errors.img && <Alert color="warning">{errors.img}</Alert>}
      </Form>
    );
  }
}
