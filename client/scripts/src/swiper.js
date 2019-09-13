import Swiper from 'swiper';

const doc = document;

const tabs = ['关于我们', '项目概况', '联系我们'];

export default function () {
  new Swiper('.swiper-container', {
    direction: 'vertical',
    autoplay: true,
    loop: true,
    speed: 1000,
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
