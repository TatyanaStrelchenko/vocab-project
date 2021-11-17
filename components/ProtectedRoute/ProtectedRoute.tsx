import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { Role } from '@vocab/shared';
import {
  getCurrentUser,
  isLoggedIn,
  isLoggedInAndConfirmed,
} from '../../services/auth-service';

interface Props extends RouteProps {
  isConfirmed?: boolean;
  isLogged?: boolean;
  allowedRoles: Role[];
}

export const ProtectedRoute: React.FC<Props> = ({
  isConfirmed = isLoggedInAndConfirmed(),
  isLogged = isLoggedIn(),
  allowedRoles,
  ...props
}) => {
  const { role } = getCurrentUser();

  if (!isLogged) {
    return <Redirect to="/login" />;
  }

  if (!allowedRoles.includes(role)) {
    return <Redirect to="/blocked" />;
  }

  if (!isConfirmed) {
    return <Redirect to="/confirm-email" />;
  }

  return <Route {...props} />;
};
