import swiper from './swiper';
import textEffect from './text-effect';
import splashEffect from './splash-effect';
import '../scss/home.scss';

// 首页效果
class Site {
  constructor () {
    this.init();
    this.splashEffectStart();
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
   * TODO
   */
  showSplash () {
    return true;
    // if (typeof window.performance !== 'undefined' && typeof window.performance.getEntriesByType !== 'undefined') {
    //   if (performance.getEntriesByType("navigation").length && typeof performance.getEntriesByType("navigation") !== 'undefined') {
    //     if (performance.getEntriesByType("navigation")[0].type && typeof performance.getEntriesByType("navigation")[0].type != 'undefined') {
    //       if (performance.getEntriesByType("navigation")[0].type == 'reload'){
    //         load_type = 'reload';
    //       }
    //     }
    //   }
    // }
  }
  
  // 首次进入页面动画效果
  splashEffectStart () {
    splashEffect().then(() => {
      this.splashEffectEnd();
    });
  }
  
  // 动画效果结束后
  splashEffectEnd () {
    swiper();
    textEffect();
  }
}

new Site();
