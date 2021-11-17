import React, {
  useState,
  useRef,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import { Table, Badge, Button, Spinner } from 'reactstrap';
import { FaSortAlphaDownAlt, FaSortAlphaDown, FaEdit } from 'react-icons/fa';
import ReactAvatar, { ConfigProvider } from 'react-avatar';
import { UserData, UserFields, texts } from '@vocab/shared';
import { isMobile } from 'react-device-detect';
import { orderBy } from 'lodash';
import { AVATAR_REDIRECT_URL_LINK } from '../../constants';
import { getCurrentUser } from '../../services/auth-service';
import { LazyRenderItems } from '../LazyRender/LazyRenderItems';
import { SettingsContext } from '../../context/settings';
import styles from './styles.module.scss';

interface Props {
  users: UserData[];
  showUserRoleEditModal(user: UserData): void;
}

export const UsersTable: React.FC<Props> = (props) => {
  const { users, showUserRoleEditModal } = props;
  const [sortField, setSortField] = useState<UserFields>('name');
  const [isDescending, setIsDescending] = useState<boolean>(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = useContext(SettingsContext).settings
    .dictionaryWordsPerPage;
  const { interfaceLanguage } = useContext(SettingsContext).settings;
  const [isLoading, setIsLoading] = useState(!isMobile);
  const [sortedUsers, setSortedUsers] = useState(users);
  const [visibleItemsNumber, setVisibleItemsNumber] = useState(0);

  const handleClick = (lang: UserFields) => {
    const order = sortField === lang ? !isDescending : false;
    setSortField(lang);
    setIsDescending(order);
  };

  const createSortableField = (
    key: UserFields,
    label: string,
    alignRight?: boolean,
  ) => {
    return (
      <th
        key={key}
        onClick={() => handleClick(key)}
        className={alignRight ? styles.sortColumnRight : styles.sortColumn}
      >
        {label}{' '}
        {sortField === key &&
          (isDescending ? (
            <FaSortAlphaDownAlt color="gray" />
          ) : (
            <FaSortAlphaDown color="gray" />
          ))}
      </th>
    );
  };

  useEffect(() => {
    setSortedUsers(orderBy(users, sortField, isDescending ? 'desc' : 'asc'));
  }, [isDescending, sortField, users]);

  const { _id: currentUserId } = getCurrentUser();

  const renderItem = useCallback(
    (user: UserData) => (
      <tr key={user._id}>
        <td>
          <ConfigProvider avatarRedirectUrl={AVATAR_REDIRECT_URL_LINK}>
            <ReactAvatar
              name={user.name}
              googleId={user.profilePicture?.x1 ? '' : user.oauth?.googleId}
              facebookId={user.profilePicture?.x1 ? '' : user.oauth?.facebookId}
              size="32"
              round={true}
              src={user.profilePicture?.x1}
            />
          </ConfigProvider>
        </td>
        <td>{user._id}</td>
        <td>{user.email} </td>
        <td>
          {currentUserId === user._id && (
            <Badge>{texts[interfaceLanguage].components.usersTable.you}</Badge>
          )}{' '}
          {user.name}
        </td>
        <td>
          {user.isConfirmed
            ? texts[interfaceLanguage].components.usersTable.yes
            : texts[interfaceLanguage].components.usersTable.no}
        </td>
        <td>
          <div className={styles.colBtn}>
            {texts[interfaceLanguage].components.usersTable[user.role]}
            {currentUserId !== user._id && user._id && (
              <Button
                color="link"
                id={user._id}
                title="Edit"
                onClick={() => showUserRoleEditModal(user)}
              >
                <FaEdit className={styles.icon} />
              </Button>
            )}
          </div>
        </td>
      </tr>
    ),
    [currentUserId, interfaceLanguage, showUserRoleEditModal],
  );

  const userMobileItem = useCallback(
    (user: UserData) => (
      <div className={styles.usersHolder} key={user._id}>
        <div className={styles.blockRow}>
          <div className={styles.col}>Profile Picture</div>
          <div className={styles.col}>
            <ConfigProvider avatarRedirectUrl={AVATAR_REDIRECT_URL_LINK}>
              <ReactAvatar
                name={user.name}
                googleId={user.profilePicture?.x1 ? '' : user.oauth?.googleId}
                facebookId={
                  user.profilePicture?.x1 ? '' : user.oauth?.facebookId
                }
                size="32"
                round={true}
                src={user.profilePicture?.x1}
              />
            </ConfigProvider>
          </div>
        </div>
        <div className={styles.blockRow}>
          <div className={styles.col}>id</div>
          <div className={styles.col}>{user._id}</div>
        </div>
        <div className={styles.blockRow}>
          <div className={styles.col}>email</div>
          <div className={styles.col}>{user.email}</div>
        </div>
        <div className={styles.blockRow}>
          <div className={styles.col}>name</div>
          <div className={styles.col}>
            {currentUserId === user._id && (
              <Badge>
                {texts[interfaceLanguage].components.usersTable.you}
              </Badge>
            )}{' '}
            {user.name}
          </div>
        </div>
        <div className={styles.blockRow}>
          <div className={styles.col}>confirmed</div>
          <div className={styles.col}>
            {user.isConfirmed
              ? texts[interfaceLanguage].components.usersTable.yes
              : texts[interfaceLanguage].components.usersTable.no}
          </div>
        </div>
        <div className={styles.blockRow}>
          <div className={styles.col}>role</div>
          <div className={styles.col}>
            <div className={styles.colBtn}>
              {texts[interfaceLanguage].components.usersTable[user.role]}
              {currentUserId !== user._id && user._id && (
                <Button
                  color="link"
                  id={user._id}
                  title="Edit"
                  onClick={() => showUserRoleEditModal(user)}
                >
                  <FaEdit className={styles.icon} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    ),
    [currentUserId, interfaceLanguage, showUserRoleEditModal],
  );

  return (
    <div ref={elementRef}>
      {isMobile ? (
        <LazyRenderItems
          data={sortedUsers}
          elementRef={elementRef}
          renderItem={userMobileItem}
          itemsPerPage={itemsPerPage}
          showSpinner={setIsLoading}
          isMobile={isMobile}
          isLoading={isLoading}
          setVisibleItemsNumber={setVisibleItemsNumber}
        />
      ) : (
        <Table className={styles.usersListTable} striped responsive bordered>
          <thead>
            <tr>
              <th>
                {texts[interfaceLanguage].components.usersTable.profilePicture}
              </th>
              <th>{texts[interfaceLanguage].components.usersTable.id}</th>
              {createSortableField(
                'email',
                texts[interfaceLanguage].components.usersTable.emailLabel,
              )}
              {createSortableField(
                'name',
                texts[interfaceLanguage].components.usersTable.nameLabel,
              )}
              {createSortableField(
                'isConfirmed',
                texts[interfaceLanguage].components.usersTable.confirmedLabel,
              )}
              {createSortableField(
                'role',
                texts[interfaceLanguage].components.usersTable.roleLabel,
              )}
            </tr>
          </thead>

          <LazyRenderItems
            data={sortedUsers}
            elementRef={elementRef}
            renderItem={renderItem}
            itemsPerPage={itemsPerPage}
            showSpinner={setIsLoading}
            isMobile={isMobile}
            isLoading={isLoading}
          />
        </Table>
      )}
      {isMobile ? (
        <>
          <div className="text-center">{isLoading && <Spinner />}</div>
          <div className="text-center">
            {!isLoading && sortedUsers.length > visibleItemsNumber && (
              <Button onClick={() => setIsLoading(true)}>
                {texts[interfaceLanguage].components.usersTable.showMore}
              </Button>
            )}
          </div>
        </>
      ) : (
        <div className="text-center">{isLoading && <Spinner />}</div>
      )}
    </div>
  );
};
