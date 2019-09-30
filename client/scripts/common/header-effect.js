import { addClass, removeClass, containsClass } from '../utils/dom-class';
import { doc } from '../utils/perfect';

export default function () {
  window.addEventListener('scroll', (event) => {
    if (containsClass('body', 'header-menu-open')) {
      return;
    }
  
    const { scrollTop } = doc.documentElement;
    
    if (scrollTop > 100) {
      addClass('header.header', 'hide');
    } else {
      removeClass('header.header', 'hide');
    }
  }, false);
};
