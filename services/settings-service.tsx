import { Settings, SettingsForUpdate } from '@vocab/shared';
import { http } from './http-service';

interface UpdateSettingsResponse {
  token: string;
  settings: Settings;
}

const apiEndpoint = `/settings`;

export const getSettings = (userId: string) => {
  return http.get<Settings>(`${apiEndpoint}`);
};

export const updateSettings = (userId: string, settings: SettingsForUpdate) => {
  return http.put<UpdateSettingsResponse>(`${apiEndpoint}`, settings);
};
