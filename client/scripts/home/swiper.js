import Swiper from 'swiper';
import textEffect from './text-effect';
import { win, doc } from '../utils/perfect';

export default function () {
  const pagination = doc.querySelector('.swiper-pagination');
  let tabs = pagination.dataset.tabs;
  if (tabs) {
    tabs = tabs.split(',');
  } else {
    tabs = ['关于我们', '项目概览', '新闻中心', '联系我们'];
  }
  
  let te;
  
  const swiper = new Swiper('.swiper-container', {
    direction: 'vertical',
    autoplay: {
      delay: 3000,
      stopOnLastSlide: false,
      disableOnInteraction: true,
      reverseDirection: false,
      waitForTransition: true
    },
    loop: true,
    speed: 300,
    allowTouchMove: true,
    touchAngle: 45,
    mousewheel: {
      sensitivity: 10
    },
    effect: 'fade',
    fadeEffect: {
      crossFade: true
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      type: 'bullets',
      renderBullet: function (index, className) {
        return '<div class="' + className + '">' + tabs[index] + '</div>';
      }
    },
    on: {
      init () {
        te = textEffect();
      },
      slideChange () {
        if (te) {
          te.textillate('start');
        }
      }
    }
  });
  
  win.addEventListener('wheel', () => {
    swiper.autoplay.stop();
  }, false);
  
  const swiperSlide = doc.querySelectorAll('.swiper-slide');
  
  [].forEach.call(swiperSlide, (el) => {
    el.addEventListener('click', function (e) {
      const { currentTarget } = e;
      const href = currentTarget.dataset.href;
      location.href = href;
    });
  });
};
