declare global {
  interface Window {
    handlePopChange?: () => void;
  }
}

const openPop = (url: string, func: () => void) => {
  const popupWidth = 1000;
  const popupHeight = 600;
  const left = window.screenX + (window.outerWidth - popupWidth) / 2;
  const top = window.screenY + (window.outerHeight - popupHeight) / 2;
  window.open(
    url,
    '_blank',
    `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
  );

  window.handlePopChange = () => {
    console.log('callBack Func');
    if (typeof func == 'function') {
      func();
    }
  };
};

export default openPop;
