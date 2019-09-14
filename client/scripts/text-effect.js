import TextEffect from 'text-effect';

// 首页文本动画效果
export default function () {
  new TextEffect('.text-animate').textillate({
    
    // enable looping
    loop: false,
    
    // sets the minimum display time for each text before it is replaced
    minDisplayTime: 2000,
    
    // sets the initial delay before starting the animation
    // (note that depending on the in effect you may need to manually apply
    // visibility: hidden to the element before running this plugin)
    initialDelay: 0,
    
    // set whether or not to automatically start animating
    autoStart: true,
    
    // in animation settings
    in: {
      // set the effect name
      effect: 'fadeInDown',
      
      // set the delay between each character
      delay: 7,
      
      // set to true to animate all the characters at the same time
      sync: false,
      
      // randomize the character sequence
      // (note that shuffle doesn't make sense with sync = true)
      shuffle: false,
      
      // reverse the character sequence
      // (note that reverse doesn't make sense with sync = true)
      reverse: false,
      
      // callback that executes once the animation has finished
      callback: function () {}
    },
    
    // out animation settings.
    // out: {
    //   // set the effect name
    //   effect: 'fadeOutUp',
    //
    //   // set the delay between each character
    //   delay: 3,
    //   sync: false,
    //   shuffle: false,
    //   reverse: false,
    //   callback: function () {}
    // },
    
    // callback that executes once textillate has finished
    callback: function () {},
    
    // set the type of token to animate (available types: 'char' and 'word')
    type: 'char'
  });
};
