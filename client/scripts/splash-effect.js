// 进入首页时动画效果
import { addClass, removeClass } from './utils/dom-class';

function animationRun () {
  const splashContainer = $('.splash-container .transition-logo-desktop');
  const $curSpan = splashContainer.find('.active').removeClass('active');
  const $next = $curSpan.next().length ? $curSpan.next() : splashContainer.children().eq(0);
  $next.addClass('active');
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
    }, 2400);
    
    setTimeout(() => {
      clearInterval(interval);
      removeClass('body', 'main-content-hide');
      resolve();
    }, 2500);
  });
};
