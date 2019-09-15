// 进入首页时动画效果
import { addClass, removeClass } from '../utils/dom-class';

const doc = document;

// 是否是 pc 端
let isDesktop;

function animationRun () {
  const splashContainer = doc.querySelector(`.splash-container ${isDesktop ? '.transition-logo-desktop' : '.transition-logo-mobile'}`);
  const curSpan = splashContainer.querySelector('.active');
  removeClass(curSpan, 'active');
  const nextSpan = curSpan.nextElementSibling ? curSpan.nextElementSibling : splashContainer.firstElementChild;
  addClass(nextSpan, 'active');
}

export default function () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      addClass('.splash-bg', 'open');
    }, 500);
    
    let width;
    if (window.screen) {
      width = window.screen.width;
    } else {
      width = document.documentElement.clientWidth || document.body.clientWidth;
    }
  
    isDesktop = width > 768;
    const firstSpanSelector = isDesktop ? '.splash-container .transition-logo-desktop span' : '.splash-container .transition-logo-mobile span';
    
    const firstSpan = document.querySelectorAll(firstSpanSelector)[0];
    addClass(firstSpan, 'active');
    
    const interval = setInterval(() => {
      animationRun();
    }, isDesktop ? 65 : 80);
    
    addClass('body', 'splash-open');
    
    setTimeout(() => {
      removeClass('.splash-bg', 'open');
    }, 2000);
    
    setTimeout(() => {
      clearInterval(interval);
      removeClass('body', 'main-content-hide');
      resolve();
    }, 2500);
  });
};
