import React from 'react';
import { Form } from 'reactstrap';
import { History } from 'history';
import { Link } from 'react-router-dom';
import {
  Language,
  texts,
  UserData,
  nameValidationSchema,
  emailValidationSchema,
  passwordValidationSchema,
  repeatPasswordValidationSchema,
} from '@vocab/shared';
import { BaseForm } from '../BaseForm';
import { register } from '../../../services/user-service';
import { loginWithJwt, getCurrentUser } from '../../../services/auth-service';
import styles from './styles.module.scss';

interface Props {
  history: History;
  initialInterfaceLanguage: Language;
  setSettingsContext: (userId: string) => void;
}
export class RegisterForm extends BaseForm<Props> {
  state = {
    data: { name: '', email: '', password: '', repeatPassword: '' },
    errors: {},
  };

  schema = {
    name: nameValidationSchema,
    email: emailValidationSchema,
    password: passwordValidationSchema,
    repeatPassword: repeatPasswordValidationSchema(this.state.data.password),
  };

  componentDidUpdate() {
    this.schema.repeatPassword = repeatPasswordValidationSchema(
      this.state.data.password,
    );
  }

  doSubmit = async () => {
    const { name, email, password } = this.state.data;
    const user: Pick<UserData, 'email' | 'password' | 'name' | 'oauth'> = {
      name,
      email,
      password,
      oauth: { googleId: '', facebookId: '' },
    };
    try {
      const response = await register(user);
      loginWithJwt(response.headers['x-auth-token']);
      const userId = getCurrentUser()._id || '';
      this.props.setSettingsContext(userId);
      this.props.history.push('/');
    } catch (ex) {
      const invalidField = ex.response.data.split(' ')[0].toLowerCase();
      this.setState({
        errors: { ...this.state.errors, [invalidField]: ex.response.data },
      });
    }
  };

  render() {
    const interfaceLanguage: Language = this.props.initialInterfaceLanguage;
    return (
      <div className={styles.wrapper}>
        <h1>{texts[interfaceLanguage].components.forms.register}</h1>
        <Form onSubmit={this.handleSubmit}>
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
            {this.renderButton(
              texts[interfaceLanguage].components.forms.signUp,
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
            to="/login"
            className="btn btn-outline-secondary btn-block mt-0"
          >
            {texts[interfaceLanguage].components.forms.signIn}
          </Link>
        </div>
      </div>
    );
  }
}
