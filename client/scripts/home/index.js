import swiper from './swiper';
import splashEffect from '../common/splash-effect';
import qrcode from '../common/qrcode';
import { win } from '../utils/perfect';
import { removeClass } from '../utils/dom-class';
import '../../scss/home.scss';

// 首页效果
class Site {
  constructor () {
    this.init();
  }
  
  // 初始化
  init () {
    const open = this.showSplash();
    if (open) {
      this.splashEffectStart();
    } else {
      this.splashEffectEnd();
    }
  }
  
  /**
   * 通过判断页面打开方式是否是通过输入 url 或跳转打开来开启 splash 动画效果
   * 如果是 reload 方式则不处理动画效果
   */
  showSplash () {
    if (win.performance && win.performance.getEntriesByType) {
      const navigation = performance.getEntriesByType('navigation');
      if (navigation && navigation.length > 0) {
        const type = navigation[0].type;
        if (type === 'reload') {
          return false;
        }
      }
    }
    return true;
  }
  
  // 首次进入页面动画效果
  splashEffectStart () {
    splashEffect().then(() => {
      this.splashEffectEnd();
    });
  }
  
  // 动画效果结束后
  splashEffectEnd () {
    removeClass('body', 'main-content-hide');
    swiper();
    qrcode();
  }
}

new Site();
