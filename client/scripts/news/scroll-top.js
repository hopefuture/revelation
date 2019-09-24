import detectPassiveEvents from 'detect-passive-events';
import TweenFunctions from 'tween-functions';
import { addClass, removeClass } from '../utils/dom-class';
import { doc, win } from '../utils/perfect';

class ScrollTop {
  constructor () {
    this.show = false;
    this.showUnder = 100; // 滚动条滑动多少显示 scroll top
    this.topPosition = 0; // 滚动到最顶部位置
    this.duration = 250; // 动画持续时间
    
    /**
     * 动画效果，见 tween-functions 支持以下
     * 'linear', 'easeInQuad', 'easeOutQuad', 'easeInOutQuad', 'easeInCubic',
        'easeOutCubic', 'easeInOutCubic', 'easeInQuart', 'easeOutQuart', 'easeInOutQuart', 'easeInQuint',
        'easeOutQuint', 'easeInOutQuint', 'easeInSine', 'easeOutSine', 'easeInOutSine', 'easeInExpo', 'easeOutExpo',
        'easeInOutExpo', 'easeInCirc', 'easeOutCirc', 'easeInOutCirc', 'easeInElastic', 'easeOutElastic',
         'easeInOutElastic', 'easeInBack', 'easeOutBack', 'easeInOutBack', 'easeInBounce', 'easeOutBounce', 'easeInOutBounce'
     * @type {string}
     */
    this.easing = 'easeOutCubic';
    
    // 默认数据
    this.data = {
      startValue: 0,
      currentTime: 0, // 动画当前时间
      startTime: null,
      rafId: null
    };
  
    // bind
    this.handleClick = this.handleClick.bind(this);
    this.stopScrolling = this.stopScrolling.bind(this);
    this.scrollStep = this.scrollStep.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    
    this.initEvent();
  }
  
  initEvent () {
    win.addEventListener('scroll', this.handleScroll);
  
    win.addEventListener('wheel', this.stopScrolling, detectPassiveEvents.hasSupport ? { passive: true } : false);
    win.addEventListener('touchstart', this.stopScrolling, detectPassiveEvents.hasSupport ? { passive: true } : false);
    
    doc.querySelector('.go-top').addEventListener('click', this.handleClick, false);
  }
  
  handleScroll () {
    if (win.pageYOffset > this.showUnder) {
      if (!this.show) {
        addClass(doc.querySelector('.go-top'), 'show');
        this.show = true;
      }
    } else {
      removeClass(doc.querySelector('.go-top'), 'show');
      this.show = false;
    }
  }
  
  handleClick () {
    this.stopScrolling();
    this.data.startValue = window.pageYOffset;
    this.data.currentTime = 0;
    this.data.startTime = null;
    this.data.rafId = win.requestAnimationFrame(this.scrollStep);
  }
  
  // 停止动画
  stopScrolling () {
    win.cancelAnimationFrame(this.data.rafId);
  }
  
  /**
   * 计算新的动画位置并且滚动的新的位置
   * @param timestamp
   */
  scrollStep (timestamp) {
    if (!this.data.startTime) {
      this.data.startTime = timestamp;
    }
    
    this.data.currentTime = timestamp - this.data.startTime;
    
    const position = TweenFunctions[this.easing](
      this.data.currentTime,
      this.data.startValue,
      this.topPosition,
      this.duration
    );
    
    if (win.pageYOffset <= this.topPosition) {
      this.stopScrolling();
    } else {
      win.scrollTo(win.pageYOffset, position);
      this.data.rafId = win.requestAnimationFrame(this.scrollStep);
    }
  }
}

export default ScrollTop;
