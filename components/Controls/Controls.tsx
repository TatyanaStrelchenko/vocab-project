import React, { useContext } from 'react';
import { Button } from 'reactstrap';
import classnames from 'classnames';
import { CancelContext } from '../../context/controls';
import styles from './styles.module.scss';

interface Props {
  disabled: boolean;
  cancelLabel: string;
  submitLabel: string;
}

export const Controls: React.FC<Props> = ({
  submitLabel,
  cancelLabel,
  disabled,
}) => {
  const handleCancel = useContext(CancelContext);

  return (
    <div className={styles.controls}>
      <Button onClick={handleCancel}>{cancelLabel}</Button>
      <Button color="primary" className={classnames({ disabled })}>
        {submitLabel}
      </Button>
    </div>
  );
};
