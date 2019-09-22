import headerEffect from '../common/header-effect';
import headerMenu from '../common/header-menu';
import ScrollTop from './scroll-top';
import LoadMore from '../common/load-more';
import '../../scss/main.scss';

headerEffect();
headerMenu();
new ScrollTop();

new LoadMore({
  next: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.info('next');
        resolve('next');
      }, 1000);
    });
  },
  loader: () => {
    console.info('loader');
  }
});
