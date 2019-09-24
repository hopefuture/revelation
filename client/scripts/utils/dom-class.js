import { doc } from '../utils/perfect';

export function getElement (selector) {
  let element;
  if (typeof selector === 'string') {
    element = doc.querySelector(selector);
  } else if (selector && selector instanceof Element) {
    element = selector;
  }
  
  return element;
}

// 添加 class
export function addClass (selector, className) {
  if (!selector || !className) {
    return;
  }
  
  const element = getElement(selector);
  
  if (element) {
    if (Array.isArray(className)) {
      className.forEach((item) => {
        element.classList.add(item);
      });
    } else if (typeof className === 'string') {
      element.classList.add(className);
    }
  }
}

// 删除 class
export function removeClass (selector, className) {
  if (!selector || !className) {
    return;
  }
  
  const element = getElement(selector);
  
  if (element) {
    if (Array.isArray(className)) {
      className.forEach((item) => {
        element.classList.remove(item);
      });
    } else if (typeof className === 'string') {
      element.classList.remove(className);
    }
  }
}

// 包含 class
export function containsClass (selector, className) {
  if (!selector || !className || typeof className !== 'string') {
    return false;
  }
  
  const element = getElement(selector);
  
  if (element) {
    return element.classList.contains(className);
  }
  
  return false;
}
