import throttle from './throttle';
import { parseThreshold, ThresholdUnits } from './threshold';
import { doc, win } from '../../utils/perfect';
import { getElement } from '../../utils/dom-class';

// 参考 https://github.com/ankeetmaini/react-infinite-scroll-component
class LoadMore {
  constructor ({
    scrollThreshold = '200px', hasMore = true, loader = () => {
    }, pageContainer, listContainer, loadPageData = () => {},
    pageNum = 1, pageSize = 10, loadMoreMax = 50
  }) {
    const _pageContainer = getElement(pageContainer);
    if (!_pageContainer) {
      return;
    }
  
    const _listContainer = getElement(listContainer);
    if (!_listContainer) {
      return;
    }
    // 是否在加载中
    this.loading = false;
  
    // 是否已初始化
    this.inited = false;
    
    // 是否有更多数据
    this._hasMore = hasMore;
    // 滑动到底部什么部分开始加载更多
    this.scrollThreshold = scrollThreshold;
    // 显示 loader 效果
    this.loader = loader;
    // 分页页码容器
    this.pageContainer = _pageContainer;
    // 列表容器
    this.listContainer = _listContainer;
    // 加载数据函数
    this.loadPageData = loadPageData;
  
    // 当前页，从1开始，默认1
    this.pageNum = pageNum;
  
    // 每页条数，默认10
    this.pageSize = pageSize;
    
    // 加载更多最大值
    this.loadMoreMax = loadMoreMax;
    
    // 滑动事件
    this.onScrollListener = this.onScrollListener.bind(this);
    // 防止抖动
    this.throttledOnScrollListener = throttle(this.onScrollListener, 150).bind(
      this
    );
    this.handleSwitchPage = this.handleSwitchPage.bind(this);
    
    this.init();
  }
  
  set hasMore (more) {
    this._hasMore = more;
  }
  
  get hasMore () {
    return this._hasMore;
  }
  
  init () {
    this.loadData();
    this.initEvent();
  }
  
  initEvent () {
    win.addEventListener('scroll', this.throttledOnScrollListener);
    this.pageContainer.addEventListener('click', this.handleSwitchPage);
  }
  
  // 滑轮滚动事件
  onScrollListener (event) {
    // 防止多次重复加载更多
    if (this.loading) {
      return;
    }
  
    // 如果没有初始化完成，则不滑动
    if (!this.inited) {
      return;
    }
    
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
    
    // 是否到底部
    const atBottom = this.isElementAtBottom(target);
    
    // 调用 loadData 方法加载更多
    if (atBottom && this.hasMore) {
      this.loading = true;
      this.loadData(this.pageNum + 1);
    }
  }
  
  // 加载数据
  loadData (_pageNum = 1) {
    if (this.loadPageData && typeof this.loadPageData === 'function') {
      if (typeof this.loader === 'function') {
        this.loader(true);
      }
      
      this.loadPageData(_pageNum, this.pageSize, !this.hasMore).then(json => {
        this.loading = false;
        setTimeout(() => {
          this.inited = true;
        }, 300);
        
        const { totalCount, totalPages } = json.data;
        this.totalPages = totalPages;
        this.pageNum = _pageNum;
        this.totalCount = totalCount;
        this.renderPaging();
  
        // 只处理一次，如果是最后一页数据，或者是超过最大可滑动展示的数据，则 this.hashMore 设为 true
        if (this.hasMore && (this.pageNum >= totalPages || this.pageNum * this.pageSize > this.loadMoreMax)) {
          this.hasMore = false;
          if (this.pageNum * this.pageSize > this.loadMoreMax) {
            this.pageContainer.classList.add('show');
          }
        }
  
        if (typeof this.loader === 'function') {
          this.loader(false);
        }
      }).catch(() => {
        this.loading = false;
        setTimeout(() => {
          this.inited = true;
        }, 300);
        if (typeof this.loader === 'function') {
          this.loader(false);
        }
      });
    }
  }
  
  // 切换页码
  handleSwitchPage (evt) {
    evt.preventDefault();
    // 防止多次重复加载
    if (this.loading) {
      return;
    }
    
    const { target } = evt;

    const { classList } = target;

    if (classList.contains('paging-item')) {
      // 切换下一页逻辑
      let pageNum = parseInt(target.dataset.pagenum, 10);
      if (this.totalPages === 1) {
        return;
      }
      if (pageNum <= 1) {
        pageNum = 1;
      }

      if (pageNum >= this.totalPages) {
        pageNum = this.totalPages;
      }

      this.loadData(pageNum);
    }
  };
  
  /**
   * 计算页码显示算法，返回一个页码数组
   * @returns {[]}
   */
  calculatePage () {
    const pageArray = [];
    if (this.totalPages < 8) {
      for (let i = 1; i <= this.totalPages; i++) {
        pageArray.push(i);
      }
    } else {
      pageArray.push(1);
      if (this.pageNum > 4) {
        pageArray.push('...');
      }
      
      if (this.pageNum < 4) {
        for (let i = 2; i <= 6; i++) {
          pageArray.push(i);
        }
      } else if (this.pageNum >= 4 && this.totalPages - this.pageNum >= 3) {
        for (let i = this.pageNum - 2; i <= this.pageNum + 2; i++) {
          pageArray.push(i);
        }
      } else {
        for (let i = this.totalPages - 4; i < this.totalPages; i++) {
          pageArray.push(i);
        }
      }
      
      // 总页码 - 当前页 大于 3 显示
      if (this.totalPages - this.pageNum > 3) {
        pageArray.push('...');
      }
      pageArray.push(this.totalPages);
    }
    
    return pageArray;
  }
  
  // 渲染分页
  renderPaging () {
    const pageArray = this.calculatePage();
    
    let html = '<ul class="paging-items">';
    html += `<li class="paging-item prev${
      this.pageNum === 1 ? ' disabled' : ''
    }" data-pagenum="${this.pageNum - 1}"></li>`;
    const pageItems = pageArray.map((item, index) => {
      if (item === '...') {
        return '<li class="paging-item more"></li>';
      }
      return `<li class="paging-item${
        this.pageNum === item ? ' active' : ''
      }" data-pagenum="${item}">${item}</li>`;
    });
    html += pageItems.join('');
    html += `<li class="paging-item next${
      this.pageNum === this.totalPages ? ' disabled' : ''
    }" data-pagenum="${this.pageNum + 1}"></li>`;
    html += '</ul>';
  
    this.pageContainer.innerHTML = html;
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
