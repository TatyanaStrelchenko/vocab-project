import React from 'react';
import { Form } from 'reactstrap';
import { History } from 'history';
import {
  Language,
  UserData,
  passwordValidationSchema,
  repeatPasswordValidationSchema,
  texts,
  SocialData,
} from '@vocab/shared';
import { BaseForm } from '../BaseForm';
import { register } from '../../../services/user-service';
import { getCurrentUser, loginWithJwt } from '../../../services/auth-service';
import styles from './styles.module.scss';

interface Props {
  history: History;
  userData: SocialData;
  initialInterfaceLanguage: Language;
  setSettingsContext: (userId: string) => void;
}
export class CreatePasswordForm extends BaseForm<Props> {
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
    const { password } = this.state.data;
    const { name, email, oauth } = this.props.userData;
    const user: Pick<UserData, 'email' | 'password' | 'name' | 'oauth'> = {
      name,
      email: email ?? '',
      password,
      oauth,
    };
    try {
      const response = await register(user);
      loginWithJwt(response.headers['x-auth-token']);
      const userId = getCurrentUser()._id || '';
      this.props.setSettingsContext(userId);
      this.props.history.push('/');
    } catch (ex) {
      if (ex.response && ex.response.status === 409) {
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
        <h1>
          {texts[interfaceLanguage].components.forms.hello}{' '}
          {this.props.userData.name}! <br />
          {texts[interfaceLanguage].components.forms.continue}
        </h1>
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
            {this.renderButton(
              texts[interfaceLanguage].components.forms.createAccountButton,
            )}
          </div>
        </Form>
      </div>
    );
  }
}
