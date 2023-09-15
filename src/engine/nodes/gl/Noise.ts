/**
 * applies a noise
 *
 * @remark
 *
 * This node is very powerful and can be used to affect many parts of a shader, or even generate forces in a particle system.
 * It can also create fbm effects, where several layers of noise are added to each other, giving a fractal effect.
 *
 * Another very interesting use case is to use multiple noise nodes, where a first one is used to modify the input position of a second one.
 * This is called domain warping and can help you create very complex effect quickly.
 *
 *
 *
 */

import {range} from '../../../core/ArrayUtils';
import {TypedGlNode} from './_Base';
import {
	GlConnectionPoint,
	GlConnectionPointComponentsCountMap,
	GlConnectionPointType,
} from '../utils/io/connections/Gl';

// https://github.com/stegu/webgl-noise/
import NoiseCommon from './gl/noise/common.glsl';
// import cellular2D from './Gl/noise/cellular2D.glsl'
// import cellular2x2 from './Gl/noise/cellular2x2.glsl'
// import cellular2x2x2 from './Gl/noise/cellular2x2x2.glsl'
// import cellular3D from './Gl/noise/cellular3D.glsl'
import classicnoise2D from './gl/noise/classicnoise2D.glsl';
import classicnoise3D from './gl/noise/classicnoise3D.glsl';
import classicnoise4D from './gl/noise/classicnoise4D.glsl';
import noise2D from './gl/noise/noise2D.glsl';
import noise3D from './gl/noise/noise3D.glsl';
// import noise3Dgrad from './Gl/noise/noise3Dgrad.glsl'
import noise4D from './gl/noise/noise4D.glsl';

// import psrdnoise2D from './Gl/noise/psrdnoise2D.glsl'

export enum NoiseName {
	// 'cellular2D',
	// 'cellular2x2',
	// 'cellular2x2x2',
	// 'cellular3D',
	CLASSIC_PERLIN_2D = 'Classic Perlin 2D',
	// 'Classic Perlin 2D with periodic variant',
	CLASSIC_PERLIN_3D = 'Classic Perlin 3D',
	// 'Classic Perlin 3D with periodic variant',
	CLASSIC_PERLIN_4D = 'Classic Perlin 4D',
	// 'Classic Perlin 4D with periodic variant',
	NOISE_2D = 'noise2D',
	NOISE_3D = 'noise3D',
	// 'noise3Dgrad',
	NOISE_4D = 'noise4D',
	// 'Periodic Simplex Rotating Derivative', // psrdnoise
	// 'Periodic Simplex Derivative', // psdnoise
	// 'Periodic Simplex Rotating', // psrnoise
	// 'Periodic Simplex', // psnoise
	// 'Simplex Rotating Derivating', // srdnoise
	// 'Simplex Derivating', // sdnoise
	// 'Simplex Rotating', // srnoise
	// 'Simplex', // snoise
}
export const NOISE_NAMES: Array<NoiseName> = [
	NoiseName.CLASSIC_PERLIN_2D,
	NoiseName.CLASSIC_PERLIN_3D,
	NoiseName.CLASSIC_PERLIN_4D,
	NoiseName.NOISE_2D,
	NoiseName.NOISE_3D,
	NoiseName.NOISE_4D,
];

type StringByNoise = {[key in NoiseName]: string};
const IMPORT_BY_NOISE_NAME: StringByNoise = {
	[NoiseName.CLASSIC_PERLIN_2D]: classicnoise2D,
	[NoiseName.CLASSIC_PERLIN_3D]: classicnoise3D,
	[NoiseName.CLASSIC_PERLIN_4D]: classicnoise4D,
	[NoiseName.NOISE_2D]: noise2D,
	[NoiseName.NOISE_3D]: noise3D,
	[NoiseName.NOISE_4D]: noise4D,
};
type ConnectionTypeByNoise = {[key in NoiseName]: GlConnectionPointType};
const INPUT_TYPES_BY_NOISE_NAME: ConnectionTypeByNoise = {
	[NoiseName.CLASSIC_PERLIN_2D]: GlConnectionPointType.VEC2,
	[NoiseName.CLASSIC_PERLIN_3D]: GlConnectionPointType.VEC3,
	[NoiseName.CLASSIC_PERLIN_4D]: GlConnectionPointType.VEC4,
	[NoiseName.NOISE_2D]: GlConnectionPointType.VEC2,
	[NoiseName.NOISE_3D]: GlConnectionPointType.VEC3,
	[NoiseName.NOISE_4D]: GlConnectionPointType.VEC4,
};

const OUTPUT_TYPE_BY_NOISE_NAME: ConnectionTypeByNoise = {
	[NoiseName.CLASSIC_PERLIN_2D]: GlConnectionPointType.FLOAT,
	[NoiseName.CLASSIC_PERLIN_3D]: GlConnectionPointType.FLOAT,
	[NoiseName.CLASSIC_PERLIN_4D]: GlConnectionPointType.FLOAT,
	[NoiseName.NOISE_2D]: GlConnectionPointType.FLOAT,
	[NoiseName.NOISE_3D]: GlConnectionPointType.FLOAT,
	[NoiseName.NOISE_4D]: GlConnectionPointType.FLOAT,
};
const METHOD_NAMES_BY_NOISE_NAME: StringByNoise = {
	[NoiseName.CLASSIC_PERLIN_2D]: 'cnoise',
	[NoiseName.CLASSIC_PERLIN_3D]: 'cnoise',
	[NoiseName.CLASSIC_PERLIN_4D]: 'cnoise',
	[NoiseName.NOISE_2D]: 'snoise',
	[NoiseName.NOISE_3D]: 'snoise',
	[NoiseName.NOISE_4D]: 'snoise',
};

export enum NoiseOutputType {
	NoChange = 0,
	Float = 1,
	Vec2 = 2,
	Vec3 = 3,
	Vec4 = 4,
}
const OUTPUT_TYPES: Array<NoiseOutputType> = [
	NoiseOutputType.NoChange,
	NoiseOutputType.Float,
	NoiseOutputType.Vec2,
	NoiseOutputType.Vec3,
	NoiseOutputType.Vec4,
];
type StringByOutputType = {[key in NoiseOutputType]: string};
const OUTPUT_TYPE_LABEL: StringByOutputType = {
	[NoiseOutputType.NoChange]: 'Same as noise',
	[NoiseOutputType.Float]: 'Float',
	[NoiseOutputType.Vec2]: 'Vec2',
	[NoiseOutputType.Vec3]: 'Vec3',
	[NoiseOutputType.Vec4]: 'Vec4',
};
type ConnectionTypeByOutputType = {[key in NoiseOutputType]: GlConnectionPointType};
const CONNECTION_TYPE_BY_OUTPUT_TYPE: ConnectionTypeByOutputType = {
	[NoiseOutputType.NoChange]: GlConnectionPointType.FLOAT,
	[NoiseOutputType.Float]: GlConnectionPointType.FLOAT,
	[NoiseOutputType.Vec2]: GlConnectionPointType.VEC2,
	[NoiseOutputType.Vec3]: GlConnectionPointType.VEC3,
	[NoiseOutputType.Vec4]: GlConnectionPointType.VEC4,
};

const ALL_COMPONENTS = ['x', 'y', 'z', 'w'];
const OUTPUT_NAME = 'noise';
const default_noise_type = NOISE_NAMES.indexOf(NoiseName.NOISE_3D);
const default_output_type = NoiseOutputType.NoChange;

const DefaultValues: PolyDictionary<number> = {
	amp: 1,
	freq: 1,
};

enum NoiseGlNodeInputName {
	AMP = 'amp',
	POSITION = 'position',
	FREQ = 'freq',
	OFFSET = 'offset',
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {PolyDictionary} from '../../../types/GlobalTypes';
import {GlType} from '../../poly/registers/nodes/types/Gl';
class NoiseGlParamsConfig extends NodeParamsConfig {
	type = ParamConfig.INTEGER(default_noise_type, {
		menu: {
			entries: NOISE_NAMES.map((noise_name, i) => {
				const noise_output_type = OUTPUT_TYPE_BY_NOISE_NAME[noise_name];
				const name = `${noise_name} (output: ${noise_output_type})`;
				return {name: name, value: i};
			}),
		},
	});
	outputType = ParamConfig.INTEGER(default_output_type, {
		menu: {
			entries: OUTPUT_TYPES.map((output_type) => {
				const val = OUTPUT_TYPES[output_type];
				const name = OUTPUT_TYPE_LABEL[val];
				return {name: name, value: val};
			}),
		},
	});
	octaves = ParamConfig.INTEGER(3, {range: [1, 10], rangeLocked: [true, false]});
	ampAttenuation = ParamConfig.FLOAT(0.5, {range: [0, 1]});
	freqIncrease = ParamConfig.FLOAT(2, {
		range: [0, 10],
		separatorAfter: true,
	});
}
const ParamsConfig = new NoiseGlParamsConfig();
export class NoiseGlNode extends TypedGlNode<NoiseGlParamsConfig> {
	override paramsConfig = ParamsConfig;

	static override type() {
		return GlType.NOISE;
	}

	// public readonly gl_connections_controller: GlConnectionsController = new GlConnectionsController(this);
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.initializeNode();
		this.io.connection_points.spare_params.setInputlessParamNames(['octaves', 'ampAttenuation', 'freqIncrease']);

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);

		this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expected_output_types.bind(this));
		this.io.connection_points.set_input_name_function(this._gl_input_name.bind(this));
		this.io.connection_points.set_output_name_function(() => OUTPUT_NAME);
	}

	setNoiseName(noiseName: NoiseName) {
		this.p.type.set(NOISE_NAMES.indexOf(noiseName));
	}
	setOutputType(outputType: NoiseOutputType) {
		this.p.outputType.set(OUTPUT_TYPES.indexOf(outputType));
	}

	protected _gl_input_name(index: number) {
		return [
			NoiseGlNodeInputName.AMP,
			NoiseGlNodeInputName.POSITION,
			NoiseGlNodeInputName.FREQ,
			NoiseGlNodeInputName.OFFSET,
		][index];
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	private _expected_input_types(): GlConnectionPointType[] {
		const noise_name = NOISE_NAMES[this.pv.type];
		const amplitude_type = this._expected_output_types()[0];
		const type = INPUT_TYPES_BY_NOISE_NAME[noise_name];
		return [amplitude_type, type, type, type];
	}
	private _expected_output_types(): GlConnectionPointType[] {
		const noise_name = NOISE_NAMES[this.pv.type];
		const output_type = OUTPUT_TYPES[this.pv.outputType];
		if (output_type == NoiseOutputType.NoChange) {
			return [INPUT_TYPES_BY_NOISE_NAME[noise_name]];
		} else {
			return [CONNECTION_TYPE_BY_OUTPUT_TYPE[output_type]];
		}
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const function_declaration_lines = [];
		const body_lines = [];

		const noise_name = NOISE_NAMES[this.pv.type];
		const noise_function = IMPORT_BY_NOISE_NAME[noise_name];
		const noise_output_gl_type = OUTPUT_TYPE_BY_NOISE_NAME[noise_name];
		function_declaration_lines.push(new FunctionGLDefinition(this, NoiseCommon));
		function_declaration_lines.push(new FunctionGLDefinition(this, noise_function));
		function_declaration_lines.push(new FunctionGLDefinition(this, this.fbmFunction()));

		const output_gl_type = this._expected_output_types()[0];

		// if the requested output type matches the noise signature
		if (output_gl_type == noise_output_gl_type) {
			const line = this.singleNoiseLine();
			// body_lines.push( `${output_gl_type} ${noise} = ${amp}*${method_name}(${joined_args})` )
			body_lines.push(line);
		} else {
			// if the requested output type does not match the noise signature
			const requested_components_count = GlConnectionPointComponentsCountMap[output_gl_type];
			// const noise_output_components_count = OUTPUT_TYPE_BY_NOISE_NAME[output_gl_type]

			// if(requested_components_count < noise_output_components_count){
			// 	// not sure we ever go through here with the current noise set
			// 	let component = ArrayUtils.range(requested_components_count).map(i=>ALL_COMPONENTS[i]).join('')
			// 	const line = this.single_noise_line('', component)
			// 	body_lines.push(line)
			// } else {
			const lines_count_required = requested_components_count;
			const assembly_args: string[] = [];
			const noise = this.glVarName(OUTPUT_NAME);
			for (let i = 0; i < lines_count_required; i++) {
				const component = ALL_COMPONENTS[i];
				assembly_args.push(`${noise}${component}`);
				const input_type = INPUT_TYPES_BY_NOISE_NAME[noise_name];
				// if (CoreType.isArray(input_constructor)) {
				// TODO: for noise3Dgrad and other noises with 2 inputs
				// } else {
				const offset_gl_type = input_type;
				const offset_components_count = GlConnectionPointComponentsCountMap[offset_gl_type];
				const offset_values = range(offset_components_count)
					.map((j) => ThreeToGl.float(1000 * i))
					.join(', ');
				const offset2 = `${offset_gl_type}(${offset_values})`;
				const line = this.singleNoiseLine(component, component, offset2);
				body_lines.push(line);
				// }
			}
			const joined_args = assembly_args.join(', ');
			const assembly_line = `vec${lines_count_required} ${noise} = vec${lines_count_required}(${joined_args})`;
			body_lines.push(assembly_line);
			// }
		}

		shaders_collection_controller.addDefinitions(this, function_declaration_lines);
		shaders_collection_controller.addBodyLines(this, body_lines);
	}

	private fbmMethodName() {
		const noiseName = NOISE_NAMES[this.pv.type];
		const methodName = METHOD_NAMES_BY_NOISE_NAME[noiseName];
		return `fbm_${methodName}${this.path().replace(/\//g, '_')}`;
	}

	private fbmFunction() {
		const noiseName = NOISE_NAMES[this.pv.type];
		const methodName = METHOD_NAMES_BY_NOISE_NAME[noiseName];

		const inputType = INPUT_TYPES_BY_NOISE_NAME[noiseName];

		return `
float ${this.fbmMethodName()}(in ${inputType} st) {
	float value = 0.0;
	float amplitude = 1.0;
	for (int i = 0; i < ${ThreeToGl.integer(this.pv.octaves)}; i++) {
		value += amplitude * ${methodName}(st);
		st *= ${ThreeToGl.float(this.pv.freqIncrease)};
		amplitude *= ${ThreeToGl.float(this.pv.ampAttenuation)};
	}
	return value;
}
`;
	}

	private singleNoiseLine(output_name_suffix?: string, component?: string, offset2?: string) {
		// const noise_name = NOISE_NAMES[this.pv.type];
		// const method_name = METHOD_NAMES_BY_NOISE_NAME[noise_name]
		const method_name = this.fbmMethodName();

		const amp = ThreeToGl.any(this.variableForInput(NoiseGlNodeInputName.AMP));
		const position = ThreeToGl.any(this.variableForInput(NoiseGlNodeInputName.POSITION));
		const freq = ThreeToGl.any(this.variableForInput(NoiseGlNodeInputName.FREQ));
		let offset = ThreeToGl.any(this.variableForInput(NoiseGlNodeInputName.OFFSET));
		if (offset2) {
			offset = `(${offset}+${offset2})`;
		}
		const args = [`(${position}*${freq})+${offset}`];

		// we cannot use amp as is in all cases
		// if the noise outputs a vec2 and the amp is vec3, we cannot simply do vec3*vec2
		// therefore, in such a case, we must only take the required component of vec3
		// examples:
		// - noise is cellular 2D (outputs vec2) and requested output is float:
		//		nothing to do
		// - noise is cellular 2D (outputs vec2) and requested output is vec2:
		//		nothing to do
		// - noise is cellular 2D (outputs vec3) and requested output is vec2:
		//		we have:
		//			x = amp.x * vec2.x
		//			y = amp.y * vec2.y
		//			z = amp.z * 0
		//			output = vec3(x,y,z)

		// add other args if required
		// const input_type = INPUT_TYPES_BY_NOISE_NAME[noise_name];
		// if (CoreType.isArray(input_constructor)) {
		// 	const properties = clone(input_constructor);
		// 	properties.shift(); // remove position
		// 	properties.forEach((property) => {
		// 		const arg_name = Object.keys(property)[0];
		// 		const arg = ThreeToGl.any(this.variableForInput(arg_name));
		// 		args.push(arg);
		// 	});
		// }
		const joinedArgs = args.join(', ');

		// let output_type = OUTPUT_TYPE_BY_NOISE_NAME[noise_name]

		const noise = this.glVarName(OUTPUT_NAME);
		const rightHand = `${amp}*${method_name}(${joinedArgs})`;
		if (component) {
			return `float ${noise}${output_name_suffix} = (${rightHand}).${component}`;
		} else {
			// it looks like we never go here with the current set of noises
			const outputType = this.io.outputs.namedOutputConnectionPoints()[0].type();
			return `${outputType} ${noise} = ${rightHand}`;
		}
	}
}
