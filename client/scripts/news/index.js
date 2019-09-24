import headerEffect from '../common/header-effect';
import headerMenu from '../common/header-menu';
import ScrollTop from './scroll-top';
import qrcode from '../common/qrcode';
import '../../scss/main.scss';

/* eslint-disable */
// if (process.env.NODE_ENV) {
//   import('eruda').then(eruda => eruda.default.init());
// }

headerEffect();
headerMenu();
new ScrollTop();
qrcode();
