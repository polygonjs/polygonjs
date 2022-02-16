/**
 * test the input value and checks if the number is infinite or Nan.
 * If the input is a vector, the output will be true if any of its component is infinite or Nan.
 *
 *
 *
 */

import {ThreeToGl} from '../../../core/ThreeToGl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {FunctionGLDefinition} from './utils/GLDefinition';

// from https://www.shadertoy.com/view/lsjBDy
const IS_INF_DEFINE = '#define isInf(x) ( (x) == (x)+1. )';
const IS_NAN_DEFINE = '#define isNaN(x) ( (x) != (x)    )';
const DEFINES = [IS_INF_DEFINE, IS_NAN_DEFINE].join('\n');

const ALLOWED_INPUTS: GlConnectionPointType[] = [
	GlConnectionPointType.FLOAT,
	GlConnectionPointType.VEC2,
	GlConnectionPointType.VEC3,
	GlConnectionPointType.VEC4,
];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedGlNode} from './_Base';
import {isBooleanTrue} from '../../../core/Type';
class IsInfOrNanGlParamsConfig extends NodeParamsConfig {
	testIsInf = ParamConfig.BOOLEAN(1);
	testIsNan = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new IsInfOrNanGlParamsConfig();

export class IsInfOrNanGlNode extends TypedGlNode<IsInfOrNanGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'isInfOrNan';
	}
	static OUTPUT = 'out';
	static INPUT = 'in';

	override initializeNode() {
		super.initializeNode();

		this.io.connection_points.set_input_name_function(() => IsInfOrNanGlNode.INPUT);
		this.io.connection_points.set_output_name_function(() => IsInfOrNanGlNode.OUTPUT);
		this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.io.connection_points.set_expected_output_types_function(() => [GlConnectionPointType.BOOL]);
	}
	private _expected_input_types() {
		const type = this.io.connection_points.first_input_connection_type() || GlConnectionPointType.FLOAT;
		if (ALLOWED_INPUTS.includes(type)) {
			return [type];
		} else {
			return [GlConnectionPointType.FLOAT];
		}
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const glOutType = GlConnectionPointType.BOOL;
		const out = this.glVarName(this.io.connection_points.output_name(0));
		const bodyLine = `${glOutType} ${out} = ${this._functionCalls()}`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, DEFINES)]);
	}
	private _functionCalls() {
		const inValue = ThreeToGl.any(this.variableForInput(IsInfOrNanGlNode.INPUT));
		const glInType = this.io.inputs.namedInputConnectionPoints()[0].type();

		const testFunction = (inputVal: string) => {
			const functions: string[] = [];
			if (isBooleanTrue(this.pv.testIsInf)) {
				functions.push(`isInf(${inputVal})`);
			}
			if (isBooleanTrue(this.pv.testIsNan)) {
				functions.push(`isNaN(${inputVal})`);
			}
			if (functions.length > 0) {
				return functions.join(' || ');
			} else {
				return true;
			}
		};
		const testFunctionsForComponents = (components: string[]) => {
			return components.map((c) => testFunction(`${inValue}.${c}`)).join(' || ');
		};

		switch (glInType) {
			case GlConnectionPointType.FLOAT: {
				return `${testFunction(inValue)}`;
			}
			case GlConnectionPointType.VEC2: {
				return testFunctionsForComponents(['x', 'y']);
			}
			case GlConnectionPointType.VEC3: {
				return testFunctionsForComponents(['x', 'y', 'z']);
			}
			case GlConnectionPointType.VEC2: {
				return testFunctionsForComponents(['x', 'y', 'z', 'w']);
			}
		}
	}
}
