jquery.pulsate
==============

Adds a pulsating effect to elements. It started out as an experiment with 
outline-offset by [Kilian Valkhof](http://kilianvalkhof.com/). By animating it you can create 
a pulsating effect that's useful for focussing attention to a certain part of your webpage 
in a subtle way.

See the [examples](http://kilianvalkhof.com/jquerypulsate/).

## Installation

    $ bower install jquery.pulsate
    
## Example
```js
$(element).pulsate({
  color: $(this).css("background-color"), // set the color of the pulse
  reach: 20,                              // how far the pulse goes in px
  speed: 1000,          // how long one pulse takes in ms
  pause: 0,             // how long the pause between pulses is in ms
  glow: true,           // if the glow should be shown too
  repeat: true,         // will repeat forever if true, if given a number will repeat for that many times
  onHover: false        // if true only pulsate if user hovers over the element
});
```

## License

Dual licensed under the MIT and GPL licenses.

