import { addClass, removeClass, containsClass } from '../utils/dom-class';
import { doc } from '../utils/perfect';

export default function () {
  window.addEventListener('wheel', (event) => {
    if (containsClass('body', 'header-menu-open')) {
      return;
    }
    const { deltaX, deltaY } = event;
    const detail = deltaX || deltaY;
    const direction = (
      detail < -1 ? 'up' : (
        detail > 1 ? 'down' : ''
      )
    );
  
    const { scrollTop } = doc.documentElement;
    
    if (direction === 'up') {
      removeClass('header.header', 'hide');
    } else if (direction === 'down' && scrollTop > 100) {
      addClass('header.header', 'hide');
    }
  }, false);
};
