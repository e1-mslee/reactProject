import { useEffect } from 'react';

export const useRemoveWijmoLink = () => {
  useEffect(() => {
    const link = document.querySelector('a[href="https://www.mescius.co.kr/wijmo#price"]');
    if (link) {
      link.remove();
    }
  }, []);
};
