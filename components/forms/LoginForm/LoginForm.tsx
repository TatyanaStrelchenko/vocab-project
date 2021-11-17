import React from 'react';
import { Form } from 'reactstrap';
import { History } from 'history';
import { Link } from 'react-router-dom';
import {
  Language,
  texts,
  emailValidationSchema,
  passwordValidationSchema,
} from '@vocab/shared';
import { BaseForm } from '../BaseForm';
import { login, getCurrentUser } from '../../../services/auth-service';
import styles from './styles.module.scss';

interface Props {
  history: History;
  initialInterfaceLanguage: Language;
  setSettingsContext: (userId: string) => void;
}
export class LoginForm extends BaseForm<Props> {
  state = {
    data: { email: '', password: '' },
    errors: {},
  };

  schema = {
    email: emailValidationSchema,
    password: passwordValidationSchema,
  };

  doSubmit = async () => {
    try {
      const { data } = this.state;
      await login(data.email, data.password);
      const userId = getCurrentUser()._id || '';
      this.props.setSettingsContext(userId);
      this.props.history.push('/');
    } catch (ex) {
      if (ex.response && ex.response.status === 401) {
        this.setState({
          errors: { ...this.state.errors, email: ex.response.data },
        });
      }
    }
  };

  render() {
    const interfaceLanguage: Language = this.props.initialInterfaceLanguage;
    return (
      <div className={styles.wrapper}>
        <h1>{texts[interfaceLanguage].components.forms.login}</h1>
        <Form onSubmit={this.handleSubmit}>
          {this.renderInputField(
            'email',
            texts[interfaceLanguage].components.inputFields.emailLabel,
            texts[interfaceLanguage].components.inputFields.emailPlaceholder,
          )}
          {this.renderInputField(
            'password',
            texts[interfaceLanguage].components.inputFields.passwordLabel,
            texts[interfaceLanguage].components.inputFields.passwordPlaceholder,
            'password',
          )}
          <div className={styles.controls}>
            {this.renderButton(
              texts[interfaceLanguage].components.forms.signIn,
            )}
          </div>
        </Form>
        <div className={styles.secondaryControls}>
          <Link
            to="/forgot_password"
            className="btn btn-outline-secondary btn-block mr-3"
          >
            {texts[interfaceLanguage].components.forms.forgotPassword}
          </Link>
          <Link
            to="/register"
            className="btn btn-outline-secondary btn-block mt-0 m-0"
          >
            {texts[interfaceLanguage].components.forms.signUp}
          </Link>
        </div>
      </div>
    );
  }
}
