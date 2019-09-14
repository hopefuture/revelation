import { addClass, removeClass } from '../utils/dom-class';

const doc = document;

export default function () {
  window.addEventListener('wheel', (event) => {
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
