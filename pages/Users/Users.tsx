import React, { useEffect, useState, useCallback, useContext } from 'react';
import { Container } from 'reactstrap';
import { UserData, Role, texts } from '@vocab/shared';
import { getUsers, updateUserRole } from '../../services/user-service';
import { ModalWindow } from '../../components/ModalWindow';
import { Loader } from '../../components/Loader';
import { UsersTable } from '../../components/UsersTable';
import { SearchForm } from '../../components/SearchForm';
import { socket } from '../../services/socket-service';
import { SettingsContext } from '../../context/settings';
import { EditUserRoleForm } from './EditUserRoleForm';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [userToEdit, setUserToEdit] = useState<UserData | null>(null);
  const [roleValue, setRoleValue] = useState<Role>('student');
  const [isEditRoleModalShown, setIsEditModalShown] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const { interfaceLanguage } = useContext(SettingsContext).settings;

  const fetchUsers = async () => {
    const { data } = await getUsers();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  const editUser = async () => {
    if (userToEdit && userToEdit._id) {
      const newToken = await updateUserRole(userToEdit._id, roleValue);
      const payload = { userId: userToEdit._id, newToken };
      socket.emit('changeUserRole', payload);
      setUserToEdit(null);
      await fetchUsers();
    }
  };

  const showEditRoleModal = useCallback((user?: UserData) => {
    if (user) {
      setIsEditModalShown(true);
      setUserToEdit(user);
    }
  }, []);

  const isLoading = users.length === 0;

  return (
    <>
      {userToEdit && (
        <ModalWindow
          isShown={isEditRoleModalShown}
          title={texts[interfaceLanguage].pages.users.editUserRoleModalTitle}
          onCancel={() => {
            setIsEditModalShown(false);
            setUserToEdit(null);
          }}
          onConfirm={editUser}
        >
          <EditUserRoleForm user={userToEdit} onChange={setRoleValue} />
        </ModalWindow>
      )}
      {isLoading ? (
        <Loader />
      ) : (
        <Container>
          <h1>{texts[interfaceLanguage].pages.users.title}</h1>
          <>
            <SearchForm
              items={users}
              setFilteredItems={setFilteredUsers}
              entity="users"
            />
            <UsersTable
              users={filteredUsers}
              showUserRoleEditModal={showEditRoleModal}
            />
          </>
        </Container>
      )}
    </>
  );
};
