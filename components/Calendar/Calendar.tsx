import React, { useContext } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { texts } from '@vocab/shared';
import { SettingsContext } from '../../context/settings';
import styles from './styles.module.scss';

interface Props {
  startDate?: Date | null;
  endDate?: Date | null;
  setStartDate(startDate: Date | null): void;
  setEndDate(endDate: Date | null): void;
}

export const Calendar: React.FC<Props> = (props) => {
  const { startDate, endDate, setStartDate, setEndDate } = props;
  const { interfaceLanguage } = useContext(SettingsContext).settings;

  return (
    <div className={styles.calendarWrapper}>
      <DatePicker
        className={styles.calendarInput}
        selected={startDate}
        onChange={(date) => {
          date ? setStartDate(date) : setStartDate(null);
        }}
        selectsStart
        isClearable
        placeholderText={
          texts[interfaceLanguage].components.calendar.selectStartDate
        }
        startDate={startDate}
        endDate={endDate}
        maxDate={new Date()}
      />
      <DatePicker
        className={styles.calendarInput}
        selected={endDate}
        onChange={(date) => {
          if (date) {
            date.setHours(23, 59, 59, 999);
            setEndDate(date);
          } else {
            setEndDate(null);
          }
        }}
        selectsEnd
        isClearable
        placeholderText={
          texts[interfaceLanguage].components.calendar.selectEndDate
        }
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
        maxDate={new Date()}
      />
    </div>
  );
};
