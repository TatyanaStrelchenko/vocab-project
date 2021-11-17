import React, { useState, useContext, useEffect } from 'react';
import {
  NavLink,
  Link,
  RouteComponentProps,
  withRouter,
} from 'react-router-dom';
import {
  Container,
  Navbar,
  NavbarToggler,
  Nav,
  NavItem,
  Collapse,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import Avatar, { ConfigProvider } from 'react-avatar';
import classnames from 'classnames';
import { FaArrowLeft } from 'react-icons/fa';
import { isMobile, MobileView } from 'react-device-detect';
import {
  UserData,
  WordStateField,
  MODE_TO_PATH,
  Language,
  texts,
} from '@vocab/shared';
import { SettingsContext } from '../../context/settings';
import { getExercisesList, AVATAR_REDIRECT_URL_LINK } from '../../constants';
import { isLoggedInAndConfirmed } from '../../services/auth-service';
import styles from './styles.module.scss';

interface Props extends RouteComponentProps {
  initialInterfaceLanguage: Language;
  user: UserData;
}

export const NavigationBar = withRouter((props: Props) => {
  const { user, initialInterfaceLanguage } = props;
  const { pathname } = props.location;
  const { helpLanguage, learnLanguage, interfaceLanguage } = useContext(
    SettingsContext,
  ).settings;
  const [language, setLanguage] = useState<Language>(initialInterfaceLanguage);

  useEffect(() => {
    setLanguage(initialInterfaceLanguage);
    return () => {
      setLanguage('en');
    };
  }, [initialInterfaceLanguage]);

  useEffect(() => {
    setLanguage(interfaceLanguage);
    return () => {
      setLanguage('en');
    };
  }, [interfaceLanguage]);

  const [isOpenNavbar, setIsOpenNavbar] = useState(false);
  const toggleNavbar = () => setIsOpenNavbar(!isOpenNavbar);

  const [learningOpen, setLearningOpen] = useState(false);
  const toggleLearning = () => {
    setLearningOpen((prevState) => !prevState);
    if (learningOpen && isMobile) {
      toggleNavbar();
    }
  };

  const [repeatingOpen, setRepeatingOpen] = useState(false);
  const toggleRepeating = () => {
    setRepeatingOpen((prevState) => !prevState);
    if (repeatingOpen && isMobile) {
      toggleNavbar();
    }
  };

  const exercisesList = getExercisesList(
    helpLanguage,
    learnLanguage,
    interfaceLanguage,
  );

  const renderExercises = (
    mode: WordStateField,
    isOpen: boolean,
    toggleSubMenu: (e: React.SyntheticEvent) => void,
  ) => {
    const localizedState = texts[language].constants.wordState[mode];
    return (
      <UncontrolledDropdown nav inNavbar toggle={toggleSubMenu} isOpen={isOpen}>
        <DropdownToggle
          nav
          caret={!isMobile ? true : !isOpen}
          className={classnames(styles.navlink, {
            [styles.active]: pathname.includes(
              `/exercises/${MODE_TO_PATH[mode]}`,
            ),
          })}
        >
          {!isMobile && localizedState}
          {isMobile && isOpen && (
            <>
              <div>
                <FaArrowLeft />
                {texts[language].components.navigationBar.back}
              </div>
              <div className="text-light">{localizedState}</div>
            </>
          )}
          {isMobile && !isOpen && localizedState}
        </DropdownToggle>
        <DropdownMenu className={classnames(styles.dropdown, 'bg-dark py-0')}>
          <DropdownItem
            tag={() => (
              <div className={styles.dropdown__header}>
                {texts[language].components.navigationBar.exercises}
              </div>
            )}
          />
          <DropdownItem tag={() => <div className={styles.divider}></div>} />
          {exercisesList.map((item, index) => {
            return (
              <DropdownItem
                key={index}
                tag={() => (
                  <NavLink
                    exact
                    to={`/exercises/${MODE_TO_PATH[mode]}${item.path}`}
                    role="menuitem"
                    onClick={toggleSubMenu}
                    activeClassName={styles.dropdown__link__active}
                    className={classnames(
                      styles.tabTitle,
                      styles.dropdown__link,
                    )}
                  >
                    {item.name}
                  </NavLink>
                )}
              />
            );
          })}
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  };

  const isUserConfirmed = isLoggedInAndConfirmed();
  const registerLink = isUserConfirmed ? '/me' : '/register';
  const registerText = isUserConfirmed
    ? user.name
    : texts[language].components.navigationBar.signUp;
  const loginLink = isUserConfirmed ? '/logout' : '/login';
  const loginText = isUserConfirmed
    ? texts[language].components.navigationBar.logOut
    : texts[language].components.navigationBar.signIn;

  const handleNavLinkClick = () => {
    if (isMobile) {
      toggleNavbar();
    }
  };
  const [isMenuVisible, setIsMenuVisible] = useState(true);

  useEffect(() => {
    if (!isMobile) {
      setIsMenuVisible(true);
    } else if (!learningOpen && !repeatingOpen) {
      setIsMenuVisible(true);
    } else {
      setIsMenuVisible(false);
    }
  }, [repeatingOpen, learningOpen]);

  return (
    <Navbar color="dark" dark expand="md">
      <Container fluid={true}>
        <div className="navbar-brand">
          <Link to="/" className={styles.homelink}>
            {texts[language].components.navigationBar.home}
          </Link>
        </div>
        <NavbarToggler onClick={toggleNavbar} />
        <Collapse isOpen={isOpenNavbar} navbar>
          <Nav className="w-100 align-items-center" navbar>
            {isUserConfirmed && (
              <>
                {user.role === 'admin' && (
                  <NavItem>
                    <NavLink
                      exact
                      to="/users"
                      activeClassName={styles.active}
                      className={styles.navlink}
                      onClick={handleNavLinkClick}
                    >
                      {texts[language].components.navigationBar.users}
                    </NavLink>
                  </NavItem>
                )}
                {isMenuVisible && (
                  <>
                    <NavItem>
                      <NavLink
                        exact
                        to="/wordlists/public"
                        activeClassName={styles.active}
                        className={styles.navlink}
                        onClick={handleNavLinkClick}
                      >
                        {
                          texts[language].components.navigationBar
                            .publicWordlists
                        }
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        exact
                        to="/wordlists/my"
                        activeClassName={styles.active}
                        className={styles.navlink}
                        onClick={handleNavLinkClick}
                      >
                        {texts[language].components.navigationBar.myWordlists}
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        exact
                        to="/dictionary"
                        activeClassName={styles.active}
                        className={styles.navlink}
                        onClick={handleNavLinkClick}
                      >
                        {texts[language].components.navigationBar.myDictionary}
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        exact
                        to="/distributing"
                        activeClassName={styles.active}
                        className={styles.navlink}
                        onClick={handleNavLinkClick}
                      >
                        {texts[language].components.navigationBar.toDistribute}
                      </NavLink>
                    </NavItem>
                  </>
                )}

                <MobileView>
                  {!repeatingOpen &&
                    renderExercises('to learn', learningOpen, toggleLearning)}
                  {!learningOpen &&
                    renderExercises(
                      'to repeat',
                      repeatingOpen,
                      toggleRepeating,
                    )}
                </MobileView>
                {!isMobile &&
                  renderExercises('to learn', learningOpen, toggleLearning)}
                {!isMobile &&
                  renderExercises('to repeat', repeatingOpen, toggleRepeating)}
              </>
            )}

            {isMenuVisible && (
              <>
                {isUserConfirmed && (
                  <NavItem className="ml-md-auto">
                    <NavLink
                      exact
                      to="/settings"
                      activeClassName={styles.active}
                      className={styles.navlink}
                      onClick={handleNavLinkClick}
                    >
                      {texts[language].components.navigationBar.settings}
                    </NavLink>
                  </NavItem>
                )}
                <NavItem>
                  <NavLink
                    exact
                    to={registerLink}
                    activeClassName={styles.active}
                    className={styles.navlink}
                    onClick={handleNavLinkClick}
                  >
                    {isMobile &&
                      (isUserConfirmed && user.name
                        ? texts[language].components.navigationBar.profile
                        : registerText)}

                    {!isMobile && (
                      <span className={styles.navAvatarWrapper}>
                        {isUserConfirmed && user.name && (
                          <ConfigProvider
                            avatarRedirectUrl={AVATAR_REDIRECT_URL_LINK}
                          >
                            <Avatar
                              className={styles.navAvatar}
                              name={user.name}
                              googleId={
                                user.profilePicture?.x1
                                  ? ''
                                  : user.oauth.googleId
                              }
                              facebookId={
                                user.profilePicture?.x1
                                  ? ''
                                  : user.oauth.facebookId
                              }
                              size="24"
                              round={true}
                              src={user.profilePicture?.x1}
                            />
                          </ConfigProvider>
                        )}
                        <span className={styles.navAvatarText}>
                          {registerText}
                        </span>
                      </span>
                    )}
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    exact
                    to={loginLink}
                    activeClassName={styles.active}
                    className={styles.navlink}
                    onClick={handleNavLinkClick}
                  >
                    {loginText}
                  </NavLink>
                </NavItem>
              </>
            )}
          </Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
});
