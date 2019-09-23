import { doc } from '../utils/perfect';
import { addClass, removeClass } from '../utils/dom-class';

export default function () {
  const qrcode = doc.querySelector('.qrcode');
  if (qrcode) {
    qrcode.addEventListener('mouseenter', (e) => {
      const x = e.currentTarget.offsetLeft || 0;
      
      const qrcodeImg = doc.querySelector('.qrcode-img');
      if (qrcodeImg) {
        // 48.5 = 176 / 2 - 30 / 2 二维码的宽度除以2 减去图标的宽度除以 2
        qrcodeImg.style.setProperty('left', `${x - 48.5}px`);
        // 显示并加动画效果
        setTimeout(() => {
          addClass(qrcodeImg, 'show');
        });
      }
    }, false);
    
    qrcode.addEventListener('mouseleave', (e) => {
      const qrcodeImg = doc.querySelector('.qrcode-img');
      if (qrcodeImg) {
        removeClass(qrcodeImg, 'show');
      }
    }, false);
  }
};
