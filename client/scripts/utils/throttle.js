// https://remysharp.com/2010/07/21/throttling-function-calls
export default function throttle (fn, threshhold = 250) {
  let last,
    deferTimer;
  
  return function (...args) {
    const now = Date.now();
    
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(() => {
        last = now;
        fn(args);
      }, threshhold);
    } else {
      last = now;
      fn(args);
    }
  };
}
