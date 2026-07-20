import { STYLES } from './generated/stylesContent';

const STYLE_ID = 'react-core-ts-styles';

(function injectReactCoreTsStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.setAttribute('data-react-core-ts', '');
  style.textContent = STYLES;
  document.head.appendChild(style);
})();
