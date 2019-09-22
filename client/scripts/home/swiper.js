import Swiper from 'swiper';
import textEffect from './text-effect';

const doc = document;

export default function () {
  const pagination = doc.querySelector('.swiper-pagination');
  let tabs = pagination.dataset.tabs;
  if (tabs) {
    tabs = tabs.split(',');
  } else {
    tabs = ['关于我们', '项目概览', '联系我们'];
  }
  
  let te;
  
  const swiper = new Swiper('.swiper-container', {
    direction: 'vertical',
    autoplay: {
      delay: 3000,
      stopOnLastSlide: false,
      disableOnInteraction: true,
      reverseDirection: false,
      waitForTransition: false
    },
    loop: true,
    speed: 800,
    allowTouchMove: true,
    touchAngle: 90,
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
  
  const swiperSlide = doc.querySelectorAll('.swiper-slide');
  
  [].forEach.call(swiperSlide, (el) => {
    el.addEventListener('click', function (e) {
      const { currentTarget } = e;
      const href = currentTarget.dataset.href;
      location.href = href;
    });
  });
};
