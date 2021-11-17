import React, { useEffect, useState } from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import { LastLocationProvider } from 'react-router-last-location';
import { Language, Role, UserData, UpdateUserParamsModel } from '@vocab/shared';
import { getCurrentUser, loginWithJwt, logout } from './services/auth-service';
import { doesCurrentUserExists } from './services/user-service';
import { SettingsContextProvider } from './context/settings';
import { NavigationBar } from './components/NavigationBar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Dictionary } from './pages/Dictionary';
import { Distributing } from './pages/Distributing';
import { Exercises } from './pages/Exercises';
import { Wordlists } from './pages/Wordlists';
import { UserProfile } from './pages/UserProfile';
import { UserSettings } from './pages/UserSettings';
import { Users } from './pages/Users';
import { EmailConfirmation } from './pages/EmailConfirmation';
import { ResetPassword } from './pages/ResetPassword';
import { ForgotPassword } from './pages/ForgotPassword';
import { Logout } from './components/Logout';
import { SignUp } from './pages/SignUp';
import { SignIn } from './pages/SignIn';
import { ConfirmEmail } from './pages/ConfirmEmail';
import { Blocked } from './pages/Blocked';
import { NotFound } from './pages/NotFound';
import { InterfaceLanguageModal } from './components/InterfaceLanguageModal';
import { history } from './history';
import { socket } from './services/socket-service';
import { blankUser } from './constants';

export const App: React.FC = () => {
  const [userExist, setUserExist] = useState(false);
  const [user, setUser] = useState(getCurrentUser());
  const [initialInterfaceLanguage, setInitialInterfaceLanguage] = useState<
    Language
  >('en');

  useEffect(() => {
    let cleanup = false;
    const runEffect = async () => {
      try {
        const result = await doesCurrentUserExists();
        if (!result) {
          logout();
        }
        if (!cleanup) setUserExist(result);
      } catch (e) {
        console.error(e);
      }
    };
    runEffect();
    return () => {
      cleanup = true;
    };
  }, [userExist]);

  const onChangeUserData = (changedUser: UserData) => {
    setUser(changedUser);
  };
  const onResetUserData = () => {
    setUser(blankUser);
  };
  const onGetUserData = () => {
    setUser(getCurrentUser());
  };

  const defaultAllowedRoles: Role[] = ['admin', 'teacher', 'student'];

  useEffect(() => {
    const userParamsChange = (payload: UpdateUserParamsModel) => {
      const { userId, newToken } = payload;
      if (user._id === userId) {
        logout();
        loginWithJwt(newToken);
        setUser(getCurrentUser());
      }
      if (user.role !== 'blocked' && history.location.pathname === '/blocked') {
        history.push('/');
      }
    };
    socket.on('changeUserRole', (payload: UpdateUserParamsModel) =>
      userParamsChange(payload),
    );
    socket.on('changeUserSettings', (payload: UpdateUserParamsModel) =>
      userParamsChange(payload),
    );
    return () => {
      socket.off('changeUserRole', userParamsChange);
      socket.off('changeUserSettings', userParamsChange);
    };
  }, [user._id, user.role]);

  return (
    <Router history={history}>
      <LastLocationProvider>
        <SettingsContextProvider>
          <div className="App">
            <NavigationBar
              initialInterfaceLanguage={initialInterfaceLanguage}
              user={user}
            />
            <Switch>
              <ProtectedRoute
                allowedRoles={defaultAllowedRoles}
                exact
                path="/"
                component={Home}
              />
              <ProtectedRoute
                allowedRoles={defaultAllowedRoles}
                exact
                path="/dictionary"
                component={Dictionary}
              />
              <ProtectedRoute
                allowedRoles={defaultAllowedRoles}
                exact
                path="/distributing"
                component={Distributing}
              />
              <ProtectedRoute
                allowedRoles={defaultAllowedRoles}
                exact
                path="/exercises/learning/:exerciseId"
                render={() => <Exercises mode="to learn" />}
              />
              <ProtectedRoute
                allowedRoles={defaultAllowedRoles}
                exact
                path="/exercises/repeating/:exerciseId"
                render={() => <Exercises mode="to repeat" />}
              />
              <ProtectedRoute
                allowedRoles={defaultAllowedRoles}
                exact
                path="/wordlists/public"
                render={() => <Wordlists type="public" />}
              />
              <ProtectedRoute
                allowedRoles={defaultAllowedRoles}
                exact
                path="/wordlists/my"
                render={() => <Wordlists type="my" />}
              />
              <ProtectedRoute
                allowedRoles={defaultAllowedRoles}
                exact
                path="/wordlists/:wordlistId"
                component={Dictionary}
              />
              <ProtectedRoute
                allowedRoles={defaultAllowedRoles}
                exact
                path="/me"
                render={() => (
                  <UserProfile
                    onChangeUserData={onChangeUserData}
                    user={user}
                  />
                )}
              />
              <ProtectedRoute
                allowedRoles={defaultAllowedRoles}
                exact
                path="/settings"
                component={UserSettings}
              />
              <ProtectedRoute
                exact
                path="/users"
                component={Users}
                allowedRoles={['admin']}
              />
              <Route
                path="/confirmation/:token"
                component={EmailConfirmation}
              />
              <Route
                exact
                path="/reset_password/:token"
                component={ResetPassword}
              />
              <Route
                exact
                path="/forgot_password"
                component={() => (
                  <ForgotPassword
                    initialInterfaceLanguage={initialInterfaceLanguage}
                  />
                )}
              />
              <Route
                exact
                path="/logout"
                render={() => <Logout onResetUserData={onResetUserData} />}
              />
              <Route
                exact
                path="/register"
                render={(props) => (
                  <SignUp
                    initialInterfaceLanguage={initialInterfaceLanguage}
                    onGetUserData={onGetUserData}
                    {...props}
                  />
                )}
              />
              <Route
                exact
                path="/login"
                render={(props) => (
                  <SignIn
                    initialInterfaceLanguage={initialInterfaceLanguage}
                    onGetUserData={onGetUserData}
                    {...props}
                  />
                )}
              />
              <Route
                exact
                path="/confirm-email"
                component={() => (
                  <ConfirmEmail
                    initialInterfaceLanguage={initialInterfaceLanguage}
                  />
                )}
              />
              <ProtectedRoute
                exact
                path="/blocked"
                component={Blocked}
                allowedRoles={['blocked']}
              />
              <Route exact path="/notfound" component={NotFound} />
              <Redirect to="/notfound" />
            </Switch>
            <InterfaceLanguageModal
              setInitialInterfaceLanguage={setInitialInterfaceLanguage}
            />
          </div>
        </SettingsContextProvider>
      </LastLocationProvider>
    </Router>
  );
};
