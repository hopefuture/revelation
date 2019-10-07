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
    // autoplay: {
    //   delay: 6000,
    //   stopOnLastSlide: false,
    //   disableOnInteraction: true,
    //   reverseDirection: false,
    //   waitForTransition: true
    // },
    loop: true,
    speed: 300,
    allowTouchMove: true,
    touchAngle: 45,
    mousewheel: {
      sensitivity: 1
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
  
  // 自动播放
  let interVal, timer, isPlay;
  
  function autoPlay () {
    if (isPlay === true) {
      return;
    }
    isPlay = true;
    clearInterval(interVal);
    clearTimeout(timer);
    interVal = setInterval(function () {
      swiper.slideNext();
    }, 6000);
  }
  
  function resetPlay () {
    if (isPlay === false) {
      return;
    }
    clearInterval(interVal);
    clearTimeout(timer);
    isPlay = false;
    timer = setTimeout(function () {
      autoPlay();
    }, 100);
  }
  
  ['touchstart', 'wheel', 'click'].forEach((item) => {
    win.addEventListener(item, () => {
      resetPlay();
    }, false);
  });
  
  autoPlay();
  
  // 设置 href
  const swiperSlide = doc.querySelectorAll('.swiper-slide');
  
  [].forEach.call(swiperSlide, (el) => {
    el.addEventListener('click', function (e) {
      const { currentTarget } = e;
      const href = currentTarget.dataset.href;
      location.href = href;
    });
  });
};
