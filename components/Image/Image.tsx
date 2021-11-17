import React from 'react';
import classnames from 'classnames';
import { Image as ImageModel } from '@vocab/shared';
import { IMAGE_HOLDER } from '../../constants';
import styles from './styles.module.scss';

interface Props {
  img?: ImageModel;
  alt: string;
  className?: string;
}

export const Image: React.FC<Props> = (props: Props) => {
  const { img, alt, className } = props;

  return (
    <div className={classnames(styles.wrapper, className)}>
      {img && img.x1 ? (
        <img
          src={img.x1}
          srcSet={img.x2 && `${img.x2} 2x`}
          alt={alt}
          className={styles.image}
        />
      ) : (
        <img src={IMAGE_HOLDER} alt={alt} className={styles.image} />
      )}
    </div>
  );
};
