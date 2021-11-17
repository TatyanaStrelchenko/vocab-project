import React, {
  useEffect,
  ReactElement,
  RefObject,
  useState,
  useMemo,
  useCallback
} from 'react';
import { debounce } from 'lodash';
import { SCROLL_OFFSET, SCROLL_DEBOUNCE_TIME } from '../../constants';

interface Props<T> {
  data: T[];
  renderItem: (item: T, index: number) => ReactElement;
  elementRef: RefObject<HTMLDivElement>;
  itemsPerPage: number;
  showSpinner: (i: boolean) => void;
  isMobile: boolean;
  isLoading: boolean;
  setVisibleItemsNumber?: (visibleItemsNumber: number) => void;
}

export const LazyRenderItems = <T extends unknown>(props: Props<T>) => {
  const {
    data,
    renderItem,
    elementRef,
    itemsPerPage,
    showSpinner,
    isMobile,
    isLoading,
    setVisibleItemsNumber
  } = props;
  const [visibleElementsNumber, setVisibleElementsNumber] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const isBottomEdgeInViewport = useCallback(() => {
    const targetElement = elementRef.current;
    if (targetElement === null) return false;
    const { bottom } = targetElement.getBoundingClientRect();
    const bottomEdge = Math.floor(bottom - SCROLL_OFFSET);
    return bottomEdge <= window.innerHeight;
  }, [elementRef]);

  const setVisibleItemsNumbers = useCallback((visibleElementsNumber) => {
    if(setVisibleItemsNumber) {
      setVisibleItemsNumber(visibleElementsNumber);
    }
  },[]);

  useEffect(() => {
    const handleScroll = debounce(() => {
      if (!isMobile && hasMore && isBottomEdgeInViewport()) {
        setVisibleElementsNumber((prevNumber) => {
          let nextVisibleItemsNumber = prevNumber + itemsPerPage;
          if (nextVisibleItemsNumber > data.length) {
            nextVisibleItemsNumber = data.length;
          }

          return nextVisibleItemsNumber;
        });
      }
    }, SCROLL_DEBOUNCE_TIME);

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [itemsPerPage, hasMore, data, isMobile, elementRef, isBottomEdgeInViewport]);

  useEffect(() => {
    setVisibleElementsNumber(itemsPerPage);
  }, [itemsPerPage]);

  useEffect(() => {
    const nextHasMore = visibleElementsNumber < data.length;
    setHasMore(nextHasMore);
    setVisibleItemsNumbers(visibleElementsNumber);
    showSpinner(isMobile ? false : nextHasMore);
  }, [setHasMore, visibleElementsNumber, data, showSpinner, isMobile, setVisibleItemsNumbers]);

  useEffect(() => {
    if (isLoading && isBottomEdgeInViewport()) {
      setVisibleElementsNumber((prevNumber) => {
        let nextVisibleItemsNumber = prevNumber + itemsPerPage;
        if (nextVisibleItemsNumber > data.length) {
          nextVisibleItemsNumber = data.length;
        }

        return nextVisibleItemsNumber;
      });
    }
  }, [itemsPerPage, data, isLoading, visibleElementsNumber, isBottomEdgeInViewport]);

  const renderItemsRange = useMemo(
    () => () =>
      data
        .slice(0, visibleElementsNumber)
        .map((item, index) => renderItem(item, index)),

    [data, visibleElementsNumber, renderItem],
  );

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{renderItemsRange()}</>;
};
