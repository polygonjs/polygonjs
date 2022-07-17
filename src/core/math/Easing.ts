// https://gist.github.com/gre/1650294

// const ease_in = function(t:number, power:number){return Math.pow(t, power)}
// const ease_on = function(t:number, power:number){return 1 - Math.abs(Math.pow(t-1, power))}
// const ease_ion = function(t:number, power:number){return t<.5 ? ease_i(power)(t*2)/2 : ease_o(power)(t*2 - 1)/2+0.5}

const easeI = function (power: number) {
	return function (t: number) {
		return Math.pow(t, power);
	};
};
const easeO = function (power: number) {
	return function (t: number) {
		return 1 - Math.abs(Math.pow(t - 1, power));
	};
};
const easeIO = function (power: number) {
	return function (t: number) {
		return t < 0.5 ? easeI(power)(t * 2) / 2 : easeO(power)(t * 2 - 1) / 2 + 0.5;
	};
};

type EasingFunction = (num: number) => number;
export interface EasingDictionary {
	easeI2: EasingFunction;
	easeO2: EasingFunction;
	easeIO2: EasingFunction;
	easeI3: EasingFunction;
	easeO3: EasingFunction;
	easeIO3: EasingFunction;
	easeI4: EasingFunction;
	easeO4: EasingFunction;
	easeIO4: EasingFunction;
	easeSinI: EasingFunction;
	easeSinO: EasingFunction;
	easeSinIO: EasingFunction;
	easeElasticI: EasingFunction;
	easeElasticO: EasingFunction;
	easeElasticIO: EasingFunction;
}
export const EASING_NAMES: Array<keyof EasingDictionary> = [
	'easeI2',
	'easeO2',
	'easeIO2',
	'easeI3',
	'easeO3',
	'easeIO3',
	'easeI4',
	'easeO4',
	'easeIO4',
	'easeSinI',
	'easeSinO',
	'easeSinIO',
	'easeElasticI',
	'easeElasticO',
	'easeElasticIO',
];

export const Easing: EasingDictionary = {
	// linear: ease_io(1),

	// ease_i: function (t: number, power: number) {
	// 	return ease_i(power)(t);
	// },
	// ease_o: function (t: number, power: number) {
	// 	return ease_o(power)(t);
	// },
	// ease_io: function (t: number, power: number) {
	// 	return ease_io(power)(t);
	// },

	easeI2: easeI(2),
	easeO2: easeO(2),
	easeIO2: easeIO(2),

	easeI3: easeI(3),
	easeO3: easeO(3),
	easeIO3: easeIO(3),

	easeI4: easeI(4),
	easeO4: easeO(4),
	easeIO4: easeIO(4),
	// easeInQuart: EaseIn(4),
	// easeOutQuart: EaseOut(4),
	// easeInOutQuart: EaseInOut(4),
	// easeInQuint: EaseIn(5),
	// easeOutQuint: EaseOut(5),
	// easeInOutQuint: EaseInOut(5)

	easeSinI: function (t: number) {
		return 1 + Math.sin((Math.PI / 2) * t - Math.PI / 2);
	},
	easeSinO: function (t: number) {
		return Math.sin((Math.PI / 2) * t);
	},
	easeSinIO: function (t: number) {
		return (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2;
	},

	easeElasticI: function (t: number) {
		return t == 0 ? 0 : (0.04 - 0.04 / t) * Math.sin(25 * t) + 1;
	},
	easeElasticO: function (t: number) {
		return t == 1 ? 1 : ((0.04 * t) / --t) * Math.sin(25 * t);
	},
	easeElasticIO: function (t: number) {
		return t == 0.5
			? 0
			: (t -= 0.5) < 0
			? (0.02 + 0.01 / t) * Math.sin(50 * t)
			: (0.02 - 0.01 / t) * Math.sin(50 * t) + 1;
	},
};

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
