import React from 'react';
import { Form, Alert } from 'reactstrap';
import { Language, emailValidationSchema, texts } from '@vocab/shared';
import { SettingsContext } from '../../context/settings';
import { BaseForm } from '../../components/forms/BaseForm';
import { isLoggedIn } from '../../services/auth-service';
import styles from './styles.module.scss';
import { sendResetLink } from './../../services/reset-password-service';

export class ForgotPassword extends BaseForm {
  state = {
    data: { email: '' },
    errors: {},
    success: false,
  };

  schema = {
    email: emailValidationSchema,
  };

  doSubmit = async () => {
    try {
      await sendResetLink(this.state.data.email);
      this.setState({ success: true });
    } catch (ex) {
      this.setState({
        errors: { ...this.state.errors, email: ex.response.data },
      });
    }
  };

  render() {
    const interfaceLanguage: Language = isLoggedIn() ? this.context.settings.interfaceLanguage : this.props.initialInterfaceLanguage;
    return this.state.success ? (
      <Alert color="success">
        {texts[interfaceLanguage].pages.forgotPassword.linkHasBeenSent}{' '}
        <b>{this.state.data.email}.</b>
      </Alert>
    ) : (
      <div className={styles.wrapper}>
        <h2>{texts[interfaceLanguage].pages.forgotPassword.title}</h2>
        <Form onSubmit={this.handleSubmit}>
          {this.renderInputField('email', 'Email', 'example@vocab.com')}
          <div className={styles.controls}>
            {this.renderButton(
              texts[interfaceLanguage].pages.forgotPassword.sendButton,
            )}
          </div>
        </Form>
      </div>
    );
  }
}
ForgotPassword.contextType = SettingsContext;
