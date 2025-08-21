declare global {
  interface Window {
    handlePopChange?: () => void;
    popupRef?: Window | null;
  }
}

const openPop = (url: string, func: () => void) => {
  const popupWidth = 1000;
  const popupHeight = 600;
  const left = window.screenX + (window.outerWidth - popupWidth) / 2;
  const top = window.screenY + (window.outerHeight - popupHeight) / 2;

  if (window.popupRef && !window.popupRef.closed) {
    window.popupRef.close();
  }

  window.popupRef = window.open(
    url,
    '_blank', // 같은 이름을 쓰면 기존 창 재활용됨
    `width=${window.outerWidth},height=${window.outerHeight},left='0',top='0',resizable=yes,scrollbars=yes`
  );

  window.handlePopChange = () => {
    console.log('callBack Func');
    if (typeof func == 'function') {
      func();
    }
  };
};

export default openPop;
