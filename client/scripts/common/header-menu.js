import { addClass, removeClass } from '../utils/dom-class';
import { doc } from '../utils/perfect';

let num = 0;
const speed = 100;
function animationRun () {
  const menuLis = doc.querySelectorAll('.header .header-menu-list li');
  const len = menuLis ? menuLis.length : 0;
  if (menuLis && menuLis.length > 0) {
    addClass(menuLis[num++], 'visible');
    if (num >= len) {
      num = 0;
    } else {
      setTimeout(animationRun, speed);
    }
  }
}

export default function () {
  const headerMenu = doc.querySelector('.header .header-menu');
  const headerMenuNav = doc.querySelector('.header .header-menu-nav');
  const closeMenuNav = doc.querySelector('.header .header-menu-close');
  
  headerMenu.addEventListener('click', () => {
    addClass(headerMenuNav, 'open');
    setTimeout(() => {
      addClass(headerMenuNav, 'animating');
    }, 50);
    addClass('body', 'header-menu-open');
    // 延迟 1 秒添加动画效果
    setTimeout(() => {
      animationRun();
    }, 650);
  }, false);
  
  closeMenuNav.addEventListener('click', () => {
    removeClass(headerMenuNav, 'animating');
    setTimeout(() => {
      removeClass(headerMenuNav, 'open');
    }, 600);
    
    removeClass('body', 'header-menu-open');
    const menuLis = doc.querySelectorAll('.header .header-menu-list li');
    if (menuLis && menuLis.length > 0) {
      for (let i = 0, len = menuLis.length; i < len; i++) {
        removeClass(menuLis[i], 'visible');
      }
    }
  }, false);
};
