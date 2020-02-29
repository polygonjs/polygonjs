// import {BaseNodeGl} from './_Base';
// import {ParamType} from 'src/Engine/Param/_Module';
// import {Connection} from './GlData';
// import {ThreeToGl} from 'src/Core/ThreeToGl';
// import {Definition} from './Definition/_Module';

// // https://github.com/glslify/glsl-easings
// import CircularInOut from './Gl/easing/circular-in-out.glsl';
// import ExponentialInOut from './Gl/easing/exponential-in-out.glsl';
// import CircularIn from './Gl/easing/circular-in.glsl';
// import ElasticOut from './Gl/easing/elastic-out.glsl';
// import CubicIn from './Gl/easing/cubic-in.glsl';
// import ExponentialOut from './Gl/easing/exponential-out.glsl';
// import QuinticOut from './Gl/easing/quintic-out.glsl';
// import ElasticInOut from './Gl/easing/elastic-in-out.glsl';
// import Linear from './Gl/easing/linear.glsl';
// import CircularOut from './Gl/easing/circular-out.glsl';
// import BackInOut from './Gl/easing/back-in-out.glsl';
// import BackIn from './Gl/easing/back-in.glsl';
// import SineIn from './Gl/easing/sine-in.glsl';
// import BackOut from './Gl/easing/back-out.glsl';
// import QuarticInOut from './Gl/easing/quartic-in-out.glsl';
// import QuadraticIn from './Gl/easing/quadratic-in.glsl';
// import CubicInOut from './Gl/easing/cubic-in-out.glsl';
// import ElasticIn from './Gl/easing/elastic-in.glsl';
// import BounceOut from './Gl/easing/bounce-out.glsl';
// import QuadraticInOut from './Gl/easing/quadratic-in-out.glsl';
// import ExponentialIn from './Gl/easing/exponential-in.glsl';
// import QuinticInOut from './Gl/easing/quintic-in-out.glsl';
// import SineInOut from './Gl/easing/sine-in-out.glsl';
// import CubicOut from './Gl/easing/cubic-out.glsl';
// import QuadraticOut from './Gl/easing/quadratic-out.glsl';
// import BounceInOut from './Gl/easing/bounce-in-out.glsl';
// import QuinticIn from './Gl/easing/quintic-in.glsl';
// import QuarticIn from './Gl/easing/quartic-in.glsl';
// import QuarticOut from './Gl/easing/quartic-out.glsl';
// import BounceIn from './Gl/easing/bounce-in.glsl';
// import SineOut from './Gl/easing/sine-out.glsl';

// const IMPORT_BY_EASE_NAME = {
// 	'circular-in-out': CircularInOut,
// 	'exponential-in-out': ExponentialInOut,
// 	'circular-in': CircularIn,
// 	'elastic-out': ElasticOut,
// 	'cubic-in': CubicIn,
// 	'exponential-out': ExponentialOut,
// 	'quintic-out': QuinticOut,
// 	'elastic-in-out': ElasticInOut,
// 	linear: Linear,
// 	'circular-out': CircularOut,
// 	'back-in-out': BackInOut,
// 	'back-in': BackIn,
// 	'sine-in': SineIn,
// 	'back-out': BackOut,
// 	'quartic-in-out': QuarticInOut,
// 	'quadratic-in': QuadraticIn,
// 	'cubic-in-out': CubicInOut,
// 	'elastic-in': ElasticIn,
// 	'bounce-out': BounceOut,
// 	'quadratic-in-out': QuadraticInOut,
// 	'exponential-in': ExponentialIn,
// 	'quintic-in-out': QuinticInOut,
// 	'sine-in-out': SineInOut,
// 	'cubic-out': CubicOut,
// 	'quadratic-out': QuadraticOut,
// 	'bounce-in-out': BounceInOut,
// 	'quintic-in': QuinticIn,
// 	'quartic-in': QuarticIn,
// 	'quartic-out': QuarticOut,
// 	'bounce-in': BounceIn,
// 	'sine-out': SineOut,
// };
// const IMPORT_DEPENDENCIES_BY_EASE_NAME = {
// 	'bounce-in': [BounceOut],
// 	'bounce-in-out': [BounceOut],
// };

// const METHOD_NAMES_BY_EASE_NAME = {
// 	'circular-in-out': 'circularInOut',
// 	'exponential-in-out': 'exponentialInOut',
// 	'circular-in': 'circularIn',
// 	'elastic-out': 'elasticOut',
// 	'cubic-in': 'cubicIn',
// 	'exponential-out': 'exponentialOut',
// 	'quintic-out': 'quinticOut',
// 	'elastic-in-out': 'elasticInOut',
// 	linear: 'linear',
// 	'circular-out': 'circularOut',
// 	'back-in-out': 'backInOut',
// 	'back-in': 'backIn',
// 	'sine-in': 'sineIn',
// 	'back-out': 'backOut',
// 	'quartic-in-out': 'quarticInOut',
// 	'quadratic-in': 'quadraticIn',
// 	'cubic-in-out': 'cubicInOut',
// 	'elastic-in': 'elasticIn',
// 	'bounce-out': 'bounceOut',
// 	'quadratic-in-out': 'quadraticInOut',
// 	'exponential-in': 'exponentialIn',
// 	'quintic-in-out': 'quinticInOut',
// 	'sine-in-out': 'sineInOut',
// 	'cubic-out': 'cubicOut',
// 	'quadratic-out': 'quadraticOut',
// 	'bounce-in-out': 'bounceInOut',
// 	'quintic-in': 'quinticIn',
// 	'quartic-in': 'quarticIn',
// 	'quartic-out': 'quarticOut',
// 	'bounce-in': 'bounceIn',
// 	'sine-out': 'sineOut',
// };

// const EASE_NAMES = [
// 	'back-in-out',
// 	'back-in',
// 	'back-out',
// 	'bounce-in-out',
// 	'bounce-in',
// 	'bounce-out',
// 	'circular-in-out',
// 	'circular-in',
// 	'circular-out',
// 	'cubic-in-out',
// 	'cubic-in',
// 	'cubic-out',
// 	'elastic-in-out',
// 	'elastic-in',
// 	'elastic-out',
// 	'exponential-in-out',
// 	'exponential-in',
// 	'exponential-out',
// 	'linear',
// 	'quadratic-in-out',
// 	'quadratic-in',
// 	'quadratic-out',
// 	// "quartic-in-out",
// 	// "quartic-in",
// 	// "quartic-out",
// 	// "quintic-in-out",
// 	// "quintic-in",
// 	// "quintic-out",
// 	'sine-in-out',
// 	'sine-in',
// 	'sine-out',
// ];

// export class Easing extends BaseNodeGl {
// 	static type() {
// 		return 'easing';
// 	}

// 	_param_type: number;
// 	_param_in: number;

// 	constructor() {
// 		super();

// 		this.set_named_outputs([new Connection.Float('out')]);
// 	}

// 	create_params() {
// 		const default_ease_type = EASE_NAMES.indexOf('sine-in-out');
// 		this.add_param(ParamType.INTEGER, 'type', default_ease_type, {
// 			menu: {
// 				type: 'radio',
// 				entries: EASE_NAMES.map((name, i) => {
// 					return {name: name, value: i};
// 				}),
// 			},
// 		});

// 		this.add_param(ParamType.FLOAT, 'in', 0);
// 	}
// 	set_lines() {
// 		const function_declaration_lines = [];
// 		const body_lines = [];

// 		const ease_name = EASE_NAMES[this._param_type];
// 		const method_name = METHOD_NAMES_BY_EASE_NAME[ease_name];
// 		const glsl_function_code = IMPORT_BY_EASE_NAME[ease_name];

// 		let ease_functions = [new Definition.Function(this, glsl_function_code)];
// 		const function_dependencies = (IMPORT_DEPENDENCIES_BY_EASE_NAME[ease_name] || []).map(
// 			(f) => new Definition.Function(this, f)
// 		);
// 		if (function_dependencies) {
// 			ease_functions = function_dependencies.concat(ease_functions);
// 		}
// 		// ease_functions.forEach(ease_function=>{
// 		// 	function_declaration_lines.push(ease_function)
// 		// })

// 		const in_value = ThreeToGl.float(this.variable_for_input('in'));
// 		const out_value = this.gl_var_name('out');

// 		body_lines.push(`float ${out_value} = ${method_name}(${in_value})`);
// 		this.set_definitions(ease_functions);
// 		this.set_body_lines(body_lines);
// 	}
// }
