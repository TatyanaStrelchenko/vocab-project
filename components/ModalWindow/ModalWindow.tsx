import React, { useContext } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { texts } from '@vocab/shared';
import { SettingsContext } from '../../context/settings';
import styles from './styles.module.scss';

type ModalProps = {
  isShown: boolean;
  title: React.ReactNode;
  children: React.ReactNode;
  onCancel?(): void;
  onConfirm(): void;
  confirmColor?: string;
  isDisabled?: boolean;
  modalSize?: string;
  confirmButtonText?: string;
};

export const ModalWindow: React.FC<ModalProps> = (props) => {
  const {
    isShown,
    title,
    children,
    onCancel,
    onConfirm,
    isDisabled = false,
    modalSize,
    confirmColor = 'primary',
    confirmButtonText,
  } = props;
  const { interfaceLanguage } = useContext(SettingsContext).settings;

  return (
    <Modal isOpen={isShown} toggle={onCancel} centered size={modalSize || 'sm'}>
      <ModalHeader toggle={onCancel} className={styles.modalHeader}>
        {title}
      </ModalHeader>
      <ModalBody>{children}</ModalBody>
      <ModalFooter>
        {onCancel && (
          <Button color="secondary" onClick={onCancel}>
            {texts[interfaceLanguage].components.modalWindow.cancel}
          </Button>
        )}
        <Button color={confirmColor} onClick={onConfirm} disabled={isDisabled}>
          {confirmButtonText ||
            texts[interfaceLanguage].components.modalWindow.confirm}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
