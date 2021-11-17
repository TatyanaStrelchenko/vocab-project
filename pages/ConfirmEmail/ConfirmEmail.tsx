import React from 'react';
import { Form } from 'reactstrap';
import { Language, emailValidationSchema, texts } from '@vocab/shared';
import { BaseForm } from '../../components/forms/BaseForm';
import { Alert } from '../../components/Alert';
import styles from './styles.module.scss';
import { sendConfirmation } from './../../services/confirmation-service';

interface Props {
  initialInterfaceLanguage: Language;
}
export class ConfirmEmail extends BaseForm<Props> {
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
      await sendConfirmation(this.state.data.email);
      this.setState({ success: true });
      this.setState({ data: { email: '' } });
    } catch (ex) {
      this.setState({
        errors: { ...this.state.errors, email: ex.response.data },
      });
    }
  };

  render() {
    const interfaceLanguage: Language = this.props.initialInterfaceLanguage;
    return (
      <>
        {this.state.success && (
          <Alert
            message={
              texts[interfaceLanguage].pages.confirmationEmail
                .confirmationHasBeenSent
            }
            color="success"
            onHide={() => this.setState({ success: false })}
          />
        )}
        <div className={styles.wrapper}>
          <h2>{texts[interfaceLanguage].pages.confirmationEmail.title}</h2>
          <Form onSubmit={this.handleSubmit}>
            {this.renderInputField('email', 'Email', 'example@vocab.com')}
            <div className={styles.controls}>
              {this.renderButton(
                texts[interfaceLanguage].pages.confirmationEmail.confirmButton,
              )}
            </div>
          </Form>
        </div>
      </>
    );
  }
}
