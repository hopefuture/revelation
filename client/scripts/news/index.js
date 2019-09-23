import nunjucks from 'nunjucks';
import headerEffect from '../common/header-effect';
import headerMenu from '../common/header-menu';
import ScrollTop from './scroll-top';
import qrcode from '../common/qrcode';
import LoadMore from '../common/load-more';
import { addClass, removeClass } from '../utils/dom-class';
import { doc } from '../utils/perfect';
import '../../scss/main.scss';

// let num = 0;

headerEffect();
headerMenu();
new ScrollTop();
qrcode();

// const loadMore = new LoadMore({
//   next: () => {
//     if (num === 5) {
//       loadMore.hasMore = false;
//     }
//
//     num++;
//     return fetch('/data/news.json', {
//       method: 'get',
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json; charset=utf-8'
//       }
//     })
//       .then(response => response.json().then(json => ({ json, response })))
//       .then(({ json, response }) => {
//         if (!response.ok) {
//           const error = new Error('获取数据出错');
//           return Promise.reject(error);
//         }
//         // 处理页面渲染
//         renderHtml(json);
//         return Promise.resolve();
//       })
//       .catch((error) => {
//         return Promise.reject(error);
//       });
//   },
//   loader: (show) => {
//     let loadingMask = doc.querySelector('.loading-mask');
//     if (show) {
//       if (!loadingMask) {
//         loadingMask = doc.createElement('div');
//         loadingMask.classList.add('loading-mask');
//         loadingMask.innerHTML = '<div class="loading-icon"></div>';
//         doc.body.appendChild(loadingMask);
//       }
//       setTimeout(() => {
//         loadingMask.classList.add('show');
//       });
//       addClass(doc.body, 'loading-open');
//     } else {
//       doc.body.removeChild(doc.querySelector('.loading-mask'));
//       removeClass(doc.body, 'loading-open');
//     }
//   }
// });
//
// function renderHtml (data) {
//   const tmpl = doc.getElementById('newsListTmpl').innerHTML;
//   if (data && data.length > 0) {
//     data.forEach((item) => {
//       const content = nunjucks.renderString(tmpl, item);
//       /* eslint-disable */
//       $('#newsList').append(content);
//     });
//   }
// }
