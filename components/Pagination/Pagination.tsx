import React, { MouseEvent, useEffect, useState } from 'react';
import {
  Pagination as PaginationReactstrap,
  PaginationItem,
  PaginationLink,
} from 'reactstrap';
import styles from './styles.module.scss';

interface Props {
  pagesCount: number;
  currentPage: number;
  onSetCurrentPage(event: MouseEvent, indx: number): void;
}

const getRangeArray = (
  startNumber: number,
  endNumber: number,
): Array<number> => {
  const newArray = [];
  startNumber = endNumber - startNumber + 1;
  while (startNumber--) newArray[startNumber] = endNumber--;
  return newArray;
};

export const Pagination: React.FC<Props> = (props) => {
  const { pagesCount, currentPage, onSetCurrentPage } = props;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      const newIsMobile = window.innerWidth <= 850;
      if (isMobile !== newIsMobile) {
        setIsMobile(newIsMobile);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  const lastPageIndex: number = pagesCount - 1;
  const currentRangeLength = 10;
  const offset = 1;
  let currentRangeStart: number;
  let currentRangeEnd: number;

  if (isMobile) {
    currentRangeStart = currentPage;
    currentRangeEnd = currentPage;
  } else {
    const possibleStart: number = Math.floor((currentPage - offset) / 10) * 10;
    currentRangeStart = possibleStart > 0 ? possibleStart : 0;
    const possibleRangeEnd: number =
      currentRangeStart + currentRangeLength + offset;
    currentRangeEnd =
      pagesCount <= possibleRangeEnd ? pagesCount : possibleRangeEnd;
  }

  const rangeArray: Array<number> = getRangeArray(
    currentRangeStart,
    currentRangeEnd,
  );

  const minusLength = currentRangeStart - currentRangeLength;
  const minusDoubleLength = currentRangeStart - currentRangeLength * 2;
  const plusLength = currentRangeEnd + currentRangeLength;
  const plusDoubleLength = currentRangeEnd + currentRangeLength * 2;

  return (
    <PaginationReactstrap
      aria-label="Page navigation"
      className={styles.customPagination}
    >
      <PaginationItem disabled={currentPage <= 0}>
        <PaginationLink
          onClick={(e) => onSetCurrentPage(e, currentPage - 1)}
          previous
          href="#"
        />
      </PaginationItem>
      {currentRangeStart > 0 && currentPage !== 0 && (
        <PaginationItem>
          <PaginationLink onClick={(e) => onSetCurrentPage(e, 0)} href="#">
            1
          </PaginationLink>
        </PaginationItem>
      )}
      {minusDoubleLength > 0 && !isMobile && (
        <PaginationItem active={minusDoubleLength === currentPage}>
          <PaginationLink
            onClick={(e) => onSetCurrentPage(e, minusDoubleLength)}
            href="#"
          >
            {minusDoubleLength + 1}
          </PaginationLink>
        </PaginationItem>
      )}
      {minusLength > 0 && (
        <PaginationItem active={minusLength === currentPage}>
          <PaginationLink
            onClick={(e) => onSetCurrentPage(e, minusLength)}
            href="#"
          >
            {minusLength + 1}
          </PaginationLink>
        </PaginationItem>
      )}

      {rangeArray.map((curValueIndex, curentPageIndex) => (
        <PaginationItem
          active={curValueIndex === currentPage}
          key={curValueIndex}
        >
          {curValueIndex < pagesCount && (
            <PaginationLink
              onClick={(e) => onSetCurrentPage(e, curValueIndex)}
              href="#"
            >
              {curValueIndex + 1}
            </PaginationLink>
          )}
        </PaginationItem>
      ))}

      {plusLength < pagesCount && (
        <PaginationItem active={plusLength === currentPage}>
          <PaginationLink
            onClick={(e) => onSetCurrentPage(e, plusLength)}
            href="#"
          >
            {plusLength + 1}
          </PaginationLink>
        </PaginationItem>
      )}
      {plusDoubleLength < pagesCount && !isMobile && (
        <PaginationItem active={plusDoubleLength === currentPage}>
          <PaginationLink
            onClick={(e) => onSetCurrentPage(e, plusDoubleLength)}
            href="#"
          >
            {plusDoubleLength + 1}
          </PaginationLink>
        </PaginationItem>
      )}
      {currentRangeEnd < pagesCount && currentPage !== lastPageIndex && (
        <PaginationItem>
          <PaginationLink
            onClick={(e) => onSetCurrentPage(e, lastPageIndex)}
            href="#"
          >
            {pagesCount}
          </PaginationLink>
        </PaginationItem>
      )}
      <PaginationItem disabled={currentPage >= lastPageIndex}>
        <PaginationLink
          onClick={(e) => onSetCurrentPage(e, currentPage + 1)}
          next
          href="#"
        />
      </PaginationItem>
    </PaginationReactstrap>
  );
};
