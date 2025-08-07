import { useEffect } from 'react';

export const useRemoveWijmoLink = () => {
    useEffect(() => {
        const link = document.querySelector('a[href="https://www.mescius.co.kr/wijmo#price"]');
        const link2 = document.querySelector('body>div:last-child');

        if (link) {
            link.remove();
        }

        if(link2) {
            link2.remove();
        }
    }, []);
};
