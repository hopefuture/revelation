import { addClass, removeClass } from '../utils/dom-class';
import throttle from '../utils/throttle';
import { parseThreshold, ThresholdUnits } from '../utils/threshold';
import { doc, win } from '../utils/perfect';

class LoadMore {
  constructor ({
    scrollThreshold = '100px', hasMore = true, next = () => {
    }, loader = () => {
    }
  }) {
    // 上一次滑动位置
    this.lastScrollTop = 0;
    // 初始
    this._hasMore = hasMore;
    // 是否已再加载更过
    this.actionTriggered = false;
    // 滑动到底部什么部分开始加载更多
    this.scrollThreshold = scrollThreshold;
    // 加载下一页函数
    this.next = next;
    // 显示 loader 效果
    this.loader = loader;
    // 滑动事件
    this.onScrollListener = this.onScrollListener.bind(this);
    // 防止抖动
    this.throttledOnScrollListener = throttle(this.onScrollListener, 150).bind(
      this
    );
    this.initEvent();
  }
  
  set hasMore (more) {
    this._hasMore = more;
  }
  
  get hasMore () {
    return this._hasMore;
  }
  
  initEvent () {
    win.addEventListener('scroll', this.throttledOnScrollListener);
  }
  
  onScrollListener (event) {
    const { deltaX } = event;
    const detail = deltaX;
    const direction = detail < -1;
    // 向上滑动不处理
    if (direction) {
      return;
    }
    
    const target = doc.documentElement.scrollTop
      ? doc.documentElement
      : doc.body;
    
    // 防止多次重复加载更多
    if (this.actionTriggered) {
      return;
    }
    
    // 是否到底部
    const atBottom = this.isElementAtBottom(target);
    
    // 调用 next 方法加载更多
    if (atBottom && this.hasMore) {
      this.actionTriggered = true;
      if (typeof this.loader === 'function') {
        this.loader(true);
      }
      this.next().then(() => {
        this.actionTriggered = false;
        if (typeof this.loader === 'function') {
          this.loader(false);
        }
      }).catch(() => {
        this.actionTriggered = false;
        if (typeof this.loader === 'function') {
          this.loader(false);
        }
      });
    }
    
    this.lastScrollTop = target.scrollTop;
  }
  
  // 是否滑动到底部
  isElementAtBottom (target) {
    const clientHeight =
      target === doc.body || target === doc.documentElement
        ? win.screen.availHeight
        : target.clientHeight;
    
    const threshold = parseThreshold(this.scrollThreshold);
    
    if (threshold.unit === ThresholdUnits.Pixel) {
      return (
        target.scrollTop + clientHeight >= target.scrollHeight - threshold.value
      );
    }
    
    return (
      target.scrollTop + clientHeight >= threshold.value / 100 * target.scrollHeight
    );
  }
}

export default LoadMore;
