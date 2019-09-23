import qrcode from 'qrcode';
import { addClass, removeClass, containsClass } from '../utils/dom-class';
import { doc, win } from '../utils/perfect';

export default class Share {
  constructor () {
    this.weixinShare = this.weixinShare.bind(this);
    this.hideQrcode = this.hideQrcode.bind(this);
  
    this.init();
    this.shareEvent();
  }
  
  init () {
    const qrcodeEl = doc.querySelector('.news-share-qrcode canvas');
    if (qrcodeEl) {
      qrcode.toCanvas(qrcodeEl, win.location.href, {
        width: 160,
        margin: 1,
        scale: 2
      }, function (error) {
        if (error) console.error(error);
        console.log('success!');
      });
    }
  }
  
  shareEvent () {
    const weixinButton = doc.querySelector('.news-share-icon.weixin');
    if (weixinButton) {
      weixinButton.addEventListener('click', this.weixinShare, false);
    }
    
    const weiboButton = doc.querySelector('.news-share-icon.weibo');
    if (weiboButton) {
      weiboButton.addEventListener('click', this.sinaShare, false);
    }
  }
  
  // 微信分享
  weixinShare (e) {
    e.stopPropagation();
    
    const qrcodeEl = doc.querySelector('.news-share-qrcode');
    if (qrcodeEl) {
      if (containsClass(qrcodeEl, 'show')) {
        removeClass('.news-share-qrcode', 'show');
        win.removeEventListener('click', this.hideQrcode, false);
      } else {
        addClass('.news-share-qrcode', 'show');
        win.addEventListener('click', this.hideQrcode, false);
      }
    }
  }
  
  // 微博分享
  sinaShare () {
    const title = `【${doc.title}】`;
    const descriptionEl = doc.querySelector('meta[name="description"]');
    const description = descriptionEl ? descriptionEl.getAttribute('content') : '';
    const url = win.location.href;
    
    const _t = title + ' ' + description;
    const appkey = '2806082167'; // 你从微薄获得的appkey
    const ralateUid = '1752825395';
    const shareUrl = 'http://service.weibo.com/share/share.php?url=' + url + '&appkey=' + appkey + '&title=' + _t + '&ralateUid=' + ralateUid + '&searchPic=false';
    
    win.open(shareUrl, '', 'width=700, height=680, top=0, left=0, toolbar=no, menubar=no, scrollbars=no, location=yes, resizable=no, status=no');
  }
  
  hideQrcode () {
    removeClass('.news-share-qrcode', 'show');
    win.removeEventListener('click', this.hideQrcode, false);
  }
}
