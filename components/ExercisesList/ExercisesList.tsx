import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import { MODE_TO_PATH, WordStateField } from '@vocab/shared';
import { SettingsContext } from '../../context/settings';
import { getExercisesList, ExercisesObject } from '../../constants';
import { getAvailableExercises } from '../../services/state-service';

import styles from './styles.module.scss';

interface Props {
  mode: WordStateField;
  completed?: string[];
}

export const ExercisesList: React.FC<Props> = (props) => {
  const { mode, completed = [] } = props;
  const { helpLanguage, learnLanguage, interfaceLanguage } = useContext(
    SettingsContext,
  ).settings;
  const exercisesList = getExercisesList(
    helpLanguage,
    learnLanguage,
    interfaceLanguage,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [filteredExercises, setFilteredExercises] = useState<ExercisesObject[]>(
    [],
  );

  useEffect(() => {
    let didCancel = false;

    const getAvailableExercise = async () => {
      const exerciseIds = await getAvailableExercises(mode);
      const result = exercisesList.filter((exercise) => {
        return exerciseIds.data.some((availableExercise: string) => {
          return availableExercise === exercise.path.slice(1);
        });
      });
      if (!didCancel) {
        setFilteredExercises(result);
        setIsLoading(false);
      }
    };
    getAvailableExercise();

    return () => {
      didCancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <div className={styles.btnHolder}>
      {!isLoading &&
        filteredExercises &&
        filteredExercises.map((item, index) => (
          <Link
            key={index}
            to={`/exercises/${MODE_TO_PATH[mode]}${item.path}`}
            className={classnames('btn', 'btn-outline-info', 'mx-1', 'mb-2', {
              'd-none': completed.some(
                (elem) => elem.includes(mode) && elem.includes(item.path),
              ),
            })}
          >
            {item.name}
          </Link>
        ))}
    </div>
  );
};
