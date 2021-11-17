import React, { ContextType } from 'react';
import { Form } from 'reactstrap';
import {
  texts,
  passwordValidationSchema,
  repeatPasswordValidationSchema,
} from '@vocab/shared';
import { BaseForm } from '../BaseForm';
import { SettingsContext } from '../../../context/settings';
import styles from './styles.module.scss';

interface Props {
  onSubmit: (password: string) => void;
}

export class ResetPasswordForm extends BaseForm<Props> {
  static contextType = SettingsContext;
  context!: ContextType<typeof SettingsContext>;

  state = {
    data: { password: '', repeatPassword: '' },
    errors: {},
  };

  schema = {
    password: passwordValidationSchema,
    repeatPassword: repeatPasswordValidationSchema(this.state.data.password),
  };

  componentDidUpdate() {
    this.schema.repeatPassword = repeatPasswordValidationSchema(
      this.state.data.password,
    );
  }

  doSubmit = async () => {
    this.props.onSubmit(this.state.data.password);
  };

  render() {
    const { interfaceLanguage } = this.context.settings;

    return (
      <div className={styles.wrapper}>
        <h1>{texts[interfaceLanguage].components.forms.enterPassword}</h1>
        <Form onSubmit={this.handleSubmit}>
          {this.renderInputField(
            'password',
            texts[interfaceLanguage].components.inputFields.passwordLabel,
            texts[interfaceLanguage].components.inputFields.passwordPlaceholder,
            'password',
          )}
          {this.renderInputField(
            'repeatPassword',
            texts[interfaceLanguage].components.inputFields.repeatPasswordLabel,
            texts[interfaceLanguage].components.inputFields.passwordPlaceholder,
            'password',
          )}
          <div className={styles.controls}>
            <button className="btn btn-primary btn-block">
              {texts[interfaceLanguage].components.forms.confirm}
            </button>
          </div>
        </Form>
      </div>
    );
  }
}
