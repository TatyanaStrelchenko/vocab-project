import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { logout } from '../../services/auth-service';

interface Props {
  onResetUserData(): void;
}

export const Logout: React.FC<Props> = (props: Props) => {
  const { onResetUserData } = props;

  useEffect(() => {
    onResetUserData();
    logout();
  });

  return <Redirect to="/" />;
};
