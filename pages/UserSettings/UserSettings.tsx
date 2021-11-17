import React, { useContext } from 'react';
import { Container } from 'reactstrap';
import { SettingsForUpdate, texts } from '@vocab/shared';
import { updateSettings } from '../../services/settings-service';
import { SettingsTable } from '../../components/SettingsTable';
import { SettingsContext } from '../../context/settings';
import { getCurrentUser } from '../../services/auth-service';
import { socket } from '../../services/socket-service';

export const UserSettings: React.FC = () => {
  const userId = getCurrentUser()._id || '';
  const { settings, setSettings } = useContext(SettingsContext);
  const { interfaceLanguage } = settings;
  const updateUserSettings = async (data: SettingsForUpdate) => {
    if (data.helpLanguage) {
      data.helpLanguageVoice =
        texts[interfaceLanguage].pages.userSettings.default;
    } else if (data.learnLanguage) {
      data.learnLanguageVoice =
        texts[interfaceLanguage].pages.userSettings.default;
    }
    const { data: updatedSettings } = await updateSettings(userId, data);
    const payload = {
      userId,
      newToken: updatedSettings.token,
    };
    socket.emit('changeUserSettings', payload);
    setSettings(updatedSettings.settings);
  };

  return (
    <Container fluid={true} className="pb-5">
      <h1>{texts[interfaceLanguage].pages.userSettings.title}</h1>
      <SettingsTable settings={settings} updateSettings={updateUserSettings} />
    </Container>
  );
};
