import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalBody,
  Label,
  Input,
  ListGroup,
  ListGroupItem,
} from 'reactstrap';

import { Language } from '@vocab/shared';
import {
  INTERFACE_LANGUAGE_NAMES,
  INTERFACE_LANGUAGE_HINTS,
} from '../../constants/';
import { getCurrentUser, isLoggedIn } from '../../services/auth-service';
import { updateSettings } from '../../services/settings-service';
import styles from './styles.module.scss';

interface Props {
  setInitialInterfaceLanguage(language: Language): void;
}

export const InterfaceLanguageModal: React.FC<Props> = (props) => {
  const { setInitialInterfaceLanguage } = props;
  const isUserAuthenticated = isLoggedIn();
  const userId = getCurrentUser()._id || '';
  const languageInLocalStorage = localStorage.getItem('interfaceLanguage');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const saveLanguageSettings = useCallback(
    async (data: object) => {
      await updateSettings(userId, data);
    },
    [userId],
  );

  useEffect(() => {
    if (!isUserAuthenticated && !languageInLocalStorage) {
      setIsModalOpen(true);
    } else if (isUserAuthenticated && languageInLocalStorage) {
      setIsModalOpen(false);
      saveLanguageSettings({ interfaceLanguage: languageInLocalStorage });
      localStorage.removeItem('interfaceLanguage');
    }
  }, [isUserAuthenticated, languageInLocalStorage, saveLanguageSettings]);

  const languageOptions = (Object.keys(
    INTERFACE_LANGUAGE_NAMES,
  ) as Language[]).map((key) => ({
    value: key,
    html: (
      <div key={`language-${key}`}>
        <strong>{INTERFACE_LANGUAGE_NAMES[key]}</strong>
        {': '}
        {INTERFACE_LANGUAGE_HINTS[key]}
      </div>
    ),
  }));

  const handleChange = (e: React.SyntheticEvent) => {
    const target = e.target as HTMLInputElement;

    if (target && target.value) {
      localStorage.setItem('interfaceLanguage', target.value);
      setInitialInterfaceLanguage(target.value as Language);
      setIsModalOpen(false);
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      centered
      className={styles.modalDialog}
      color="info"
    >
      <ModalBody>
        <ListGroup flush>
          {languageOptions.map((item, index) => (
            <ListGroupItem key={index} action>
              <Label check className={styles.cursorPointer}>
                <Input
                  type="radio"
                  name={'interfaceLanguage'}
                  value={item.value}
                  onChange={handleChange}
                  className={styles.cursorPointer}
                />
                {item.html}
              </Label>
            </ListGroupItem>
          ))}
        </ListGroup>
      </ModalBody>
    </Modal>
  );
};
