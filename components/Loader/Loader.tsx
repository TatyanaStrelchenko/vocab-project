import React from 'react';
import { Spinner } from 'reactstrap';
import styles from './styles.module.scss';

export const Loader: React.FC = () => (
  <div className={styles.divLoader}>
    <Spinner color="info" />
  </div>
);
