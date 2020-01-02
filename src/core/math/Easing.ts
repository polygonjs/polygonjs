// https://gist.github.com/gre/1650294

// const ease_in = function(t:number, power:number){return Math.pow(t, power)}
// const ease_on = function(t:number, power:number){return 1 - Math.abs(Math.pow(t-1, power))}
// const ease_ion = function(t:number, power:number){return t<.5 ? ease_i(power)(t*2)/2 : ease_o(power)(t*2 - 1)/2+0.5}

const ease_i = function(power:number){return function(t:number){return Math.pow(t, power)}};
const ease_o = function(power:number){return function(t:number){return 1 - Math.abs(Math.pow(t-1, power))}};
const ease_io = function(power:number){return function(t:number){return t<.5 ? ease_i(power)(t*2)/2 : ease_o(power)(t*2 - 1)/2+0.5}}

export const Easing = {
  linear: ease_io(1),

  ease_i: function(t:number, power:number){ return ease_i(power)(t) },
  ease_o: function(t:number, power:number){ return ease_o(power)(t) },
  ease_io: function(t:number, power:number){ return ease_io(power)(t) },

  ease_i2: ease_i(2),
  ease_o2: ease_o(2),
  ease_io2: ease_io(2),

  ease_i3: ease_io(3),
  ease_o3: ease_io(3),
  ease_io3: ease_io(3),

  ease_i4: ease_io(4),
  ease_o4: ease_io(4),
  ease_io4: ease_io(4),
  // easeInQuart: EaseIn(4),
  // easeOutQuart: EaseOut(4),
  // easeInOutQuart: EaseInOut(4),
  // easeInQuint: EaseIn(5),
  // easeOutQuint: EaseOut(5),
  // easeInOutQuint: EaseInOut(5)

  ease_i_sin: function(t:number){ return 1 + Math.sin(Math.PI / 2 * t - Math.PI / 2); },
  ease_o_sin: function(t:number){ return Math.sin(Math.PI / 2 * t); },
  ease_io_sin: function(t:number){ return (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2; },

  ease_i_elastic: function (t:number) { return (.04 - .04 / t) * Math.sin(25 * t) + 1 },
  ease_o_elastic: function (t:number) { return .04 * t / (--t) * Math.sin(25 * t) },
  ease_io_elastic: function (t:number) { return (t -= .5) < 0 ? (.02 + .01 / t) * Math.sin(50 * t) : (.02 - .01 / t) * Math.sin(50 * t) + 1 }
}

// export class Easing {
//   // no easing, no acceleration
//   static linear(t:number):number{ return t }
//   // accelerating from zero velocity
//   static easeinquad (t:number):number{ return t*t }
//   // decelerating to zero velocity
//   static easeoutquad (t:number):number{ return t*(2-t) }
//   // acceleration until halfway, then deceleration
//   static easeinoutquad (t:number):number{ return t<.5 ? 2*t*t : -1+(4-2*t)*t }
//   // accelerating from zero velocity
//   static easeincubic (t:number):number{ return t*t*t }
//   // decelerating to zero velocity
//   static easeoutcubic (t:number):number{ return (--t)*t*t+1 }
//   // acceleration until halfway, then deceleration
//   static easeinoutcubic (t:number):number{ return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 }
//   // accelerating from zero velocity
//   static easeinquart (t:number):number{ return t*t*t*t }
//   // decelerating to zero velocity
//   static easeoutquart (t:number):number{ return 1-(--t)*t*t*t }
//   // acceleration until halfway, then deceleration
//   static easeinoutquart (t:number):number{ return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t }
//   // accelerating from zero velocity
//   static easeinquint (t:number):number{ return t*t*t*t*t }
//   // decelerating to zero velocity
//   static easeoutquint (t:number):number{ return 1+(--t)*t*t*t*t }
//   // acceleration until halfway, then deceleration
//   static easeinoutquint (t:number):number{ return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
// }