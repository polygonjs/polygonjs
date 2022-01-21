/**
 * generates an easing function
 *
 *
 * @remarks
 *
 * Easing are powerful functions and can be used in many use cases, such as:
 * - when animating objects, vertices, or any value
 * - when interpolating between values, such as colors
 * - when modifying the shape of an object
 *
 */

import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';

// https://github.com/glslify/glsl-easings
import CircularInOut from './gl/easing/circular-in-out.glsl';
import ExponentialInOut from './gl/easing/exponential-in-out.glsl';
import CircularIn from './gl/easing/circular-in.glsl';
import ElasticOut from './gl/easing/elastic-out.glsl';
import CubicIn from './gl/easing/cubic-in.glsl';
import ExponentialOut from './gl/easing/exponential-out.glsl';
import QuinticOut from './gl/easing/quintic-out.glsl';
import ElasticInOut from './gl/easing/elastic-in-out.glsl';
import Linear from './gl/easing/linear.glsl';
import CircularOut from './gl/easing/circular-out.glsl';
import BackInOut from './gl/easing/back-in-out.glsl';
import BackIn from './gl/easing/back-in.glsl';
import SineIn from './gl/easing/sine-in.glsl';
import BackOut from './gl/easing/back-out.glsl';
import QuarticInOut from './gl/easing/quartic-in-out.glsl';
import QuadraticIn from './gl/easing/quadratic-in.glsl';
import CubicInOut from './gl/easing/cubic-in-out.glsl';
import ElasticIn from './gl/easing/elastic-in.glsl';
import BounceOut from './gl/easing/bounce-out.glsl';
import QuadraticInOut from './gl/easing/quadratic-in-out.glsl';
import ExponentialIn from './gl/easing/exponential-in.glsl';
import QuinticInOut from './gl/easing/quintic-in-out.glsl';
import SineInOut from './gl/easing/sine-in-out.glsl';
import CubicOut from './gl/easing/cubic-out.glsl';
import QuadraticOut from './gl/easing/quadratic-out.glsl';
import BounceInOut from './gl/easing/bounce-in-out.glsl';
import QuinticIn from './gl/easing/quintic-in.glsl';
import QuarticIn from './gl/easing/quartic-in.glsl';
import QuarticOut from './gl/easing/quartic-out.glsl';
import BounceIn from './gl/easing/bounce-in.glsl';
import SineOut from './gl/easing/sine-out.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {PolyDictionary} from '../../../types/GlobalTypes';

const EASE_NAMES = [
	'back-in-out',
	'back-in',
	'back-out',
	'bounce-in-out',
	'bounce-in',
	'bounce-out',
	'circular-in-out',
	'circular-in',
	'circular-out',
	'cubic-in-out',
	'cubic-in',
	'cubic-out',
	'elastic-in-out',
	'elastic-in',
	'elastic-out',
	'exponential-in-out',
	'exponential-in',
	'exponential-out',
	'linear',
	'quadratic-in-out',
	'quadratic-in',
	'quadratic-out',
	// "quartic-in-out",
	// "quartic-in",
	// "quartic-out",
	// "quintic-in-out",
	// "quintic-in",
	// "quintic-out",
	'sine-in-out',
	'sine-in',
	'sine-out',
];

const IMPORT_BY_EASE_NAME: PolyDictionary<string> = {
	'circular-in-out': CircularInOut,
	'exponential-in-out': ExponentialInOut,
	'circular-in': CircularIn,
	'elastic-out': ElasticOut,
	'cubic-in': CubicIn,
	'exponential-out': ExponentialOut,
	'quintic-out': QuinticOut,
	'elastic-in-out': ElasticInOut,
	linear: Linear,
	'circular-out': CircularOut,
	'back-in-out': BackInOut,
	'back-in': BackIn,
	'sine-in': SineIn,
	'back-out': BackOut,
	'quartic-in-out': QuarticInOut,
	'quadratic-in': QuadraticIn,
	'cubic-in-out': CubicInOut,
	'elastic-in': ElasticIn,
	'bounce-out': BounceOut,
	'quadratic-in-out': QuadraticInOut,
	'exponential-in': ExponentialIn,
	'quintic-in-out': QuinticInOut,
	'sine-in-out': SineInOut,
	'cubic-out': CubicOut,
	'quadratic-out': QuadraticOut,
	'bounce-in-out': BounceInOut,
	'quintic-in': QuinticIn,
	'quartic-in': QuarticIn,
	'quartic-out': QuarticOut,
	'bounce-in': BounceIn,
	'sine-out': SineOut,
};
const IMPORT_DEPENDENCIES_BY_EASE_NAME: PolyDictionary<string[]> = {
	'bounce-in': [BounceOut],
	'bounce-in-out': [BounceOut],
};

const METHOD_NAMES_BY_EASE_NAME: PolyDictionary<string> = {
	'circular-in-out': 'circularInOut',
	'exponential-in-out': 'exponentialInOut',
	'circular-in': 'circularIn',
	'elastic-out': 'elasticOut',
	'cubic-in': 'cubicIn',
	'exponential-out': 'exponentialOut',
	'quintic-out': 'quinticOut',
	'elastic-in-out': 'elasticInOut',
	linear: 'linear',
	'circular-out': 'circularOut',
	'back-in-out': 'backInOut',
	'back-in': 'backIn',
	'sine-in': 'sineIn',
	'back-out': 'backOut',
	'quartic-in-out': 'quarticInOut',
	'quadratic-in': 'quadraticIn',
	'cubic-in-out': 'cubicInOut',
	'elastic-in': 'elasticIn',
	'bounce-out': 'bounceOut',
	'quadratic-in-out': 'quadraticInOut',
	'exponential-in': 'exponentialIn',
	'quintic-in-out': 'quinticInOut',
	'sine-in-out': 'sineInOut',
	'cubic-out': 'cubicOut',
	'quadratic-out': 'quadraticOut',
	'bounce-in-out': 'bounceInOut',
	'quintic-in': 'quinticIn',
	'quartic-in': 'quarticIn',
	'quartic-out': 'quarticOut',
	'bounce-in': 'bounceIn',
	'sine-out': 'sineOut',
};

const OUTPUT_NAME = 'out';
const default_ease_type = EASE_NAMES.indexOf('sine-in-out');
class EasingGlParamsConfig extends NodeParamsConfig {
	type = ParamConfig.INTEGER(default_ease_type, {
		menu: {
			entries: EASE_NAMES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	input = ParamConfig.FLOAT(0);
}
const ParamsConfig = new EasingGlParamsConfig();
export class EasingGlNode extends TypedGlNode<EasingGlParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'easing';
	}

	initializeNode() {
		super.initializeNode();

		this.io.connection_points.spare_params.set_inputless_param_names(['type']);

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);
	}

	setLines(shaders_collection_controller: ShadersCollectionController) {
		const ease_name = EASE_NAMES[this.pv.type];
		const method_name = METHOD_NAMES_BY_EASE_NAME[ease_name];
		const glsl_function_code = IMPORT_BY_EASE_NAME[ease_name];

		let ease_functions = [new FunctionGLDefinition(this, glsl_function_code)];
		const function_dependencies = (IMPORT_DEPENDENCIES_BY_EASE_NAME[ease_name] || []).map(
			(f) => new FunctionGLDefinition(this, f)
		);
		if (function_dependencies) {
			ease_functions = function_dependencies.concat(ease_functions);
		}
		// ease_functions.forEach(ease_function=>{
		// 	function_declaration_lines.push(ease_function)
		// })

		const in_value = ThreeToGl.float(this.variableForInputParam(this.p.input));
		const out_value = this.glVarName(OUTPUT_NAME);

		const body_line = `float ${out_value} = ${method_name}(${in_value})`;
		shaders_collection_controller.addDefinitions(this, ease_functions);
		shaders_collection_controller.addBodyLines(this, [body_line]);
	}
}
