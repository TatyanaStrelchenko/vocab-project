import React, { useContext } from 'react';
import { Label, Form, ListGroup, ListGroupItem, Input } from 'reactstrap';
import { Role, UserData, texts } from '@vocab/shared';
import { SettingsContext } from '../../context/settings';
import styles from './styles.module.scss';

interface Props {
  user: UserData;
  onChange: (role: Role) => void;
}

const roles: Role[] = ['admin', 'teacher', 'student', 'blocked'];

export const EditUserRoleForm: React.FC<Props> = ({ user, onChange }) => {
  const { interfaceLanguage } = useContext(SettingsContext).settings;

  return (
    <Form>
      <ListGroup flush>
        {roles.map((role) => (
          <ListGroupItem key={role}>
            <Label check className={styles.roleLabel}>
              <Input
                type="radio"
                name="role"
                defaultChecked={user.role === role}
                onChange={() => onChange(role)}
              />
              {texts[interfaceLanguage].components.usersTable[role]}
            </Label>
          </ListGroupItem>
        ))}
      </ListGroup>
    </Form>
  );
};
