// 进入首页时动画效果
import { addClass, removeClass } from '../utils/dom-class';

const doc = document;

function animationRun () {
  const splashContainer = doc.querySelector('.splash-container .transition-logo-desktop');
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
  
    const firstSpan = document.querySelectorAll('.splash-container .transition-logo-desktop span')[0];
    addClass(firstSpan, 'active');
  
    const interval = setInterval(() => {
      animationRun();
    }, 65);
  
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
