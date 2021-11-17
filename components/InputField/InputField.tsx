import React from 'react';
import { FormGroup, Label, Input, FormFeedback, InputProps } from 'reactstrap';

export const InputField: React.FC<InputProps> = ({
  name,
  label,
  error,
  ...rest
}) => (
  <FormGroup>
    <Label for={name}>{label}</Label>
    <Input
      {...rest}
      name={name}
      id={name}
      invalid={error !== undefined}
    ></Input>
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
);
