import React, { createContext, useState, useEffect } from 'react';
import { Settings, DEFAULT_SETTINGS } from '@vocab/shared';
import { noop } from 'lodash';
import { getSettings } from '../services/settings-service';
import { doesCurrentUserExists } from '../services/user-service';
import { getCurrentUser } from '../services/auth-service';

const blankSettings: Settings = {
  ...DEFAULT_SETTINGS,
};

export interface UserSettingsContext {
  settings: Settings;
  setSettings: (settings: Settings) => void;
}

export const SettingsContext = createContext<UserSettingsContext>({
  settings: blankSettings,
  setSettings: noop,
});

export const SettingsContextProvider: React.FC = (props) => {
  const [userSettings, setUserSettings] = useState(blankSettings);

  const userId = getCurrentUser()._id || '';

  useEffect(() => {
    const runEffect = async () => {
      try {
        const userExist = await doesCurrentUserExists();
        if (userExist) {
          const { data } = await getSettings(userId);
          setUserSettings(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    runEffect();
  }, [userId]);

  const setSettings = (settings: Settings) => {
    const newSettings: Settings = settings;
    setUserSettings(newSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings: userSettings, setSettings }}>
      {props.children}
    </SettingsContext.Provider>
  );
};
