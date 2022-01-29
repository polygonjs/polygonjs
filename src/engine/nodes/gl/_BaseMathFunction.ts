import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {GLDefinitionType, TypedGLDefinition} from './utils/GLDefinition';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ArrayUtils} from '../../../core/ArrayUtils';

export class BaseGlMathFunctionParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new BaseGlMathFunctionParamsConfig();
export abstract class BaseGlMathFunctionGlNode extends TypedGlNode<BaseGlMathFunctionParamsConfig> {
	override paramsConfig = ParamsConfig;
	protected gl_method_name() {
		return ''; // leave blank to allow nodes such as mult, add, subtract to work
	}
	protected gl_function_definitions(): TypedGLDefinition<GLDefinitionType>[] {
		return [];
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expected_output_types.bind(this));
		this.io.connection_points.set_input_name_function(this._gl_input_name.bind(this));
	}
	protected _expected_input_types(): GlConnectionPointType[] {
		const type: GlConnectionPointType =
			this.io.connection_points.first_input_connection_type() || GlConnectionPointType.FLOAT;
		if (this.io.connections.firstInputConnection()) {
			const connections = this.io.connections.inputConnections();
			if (connections) {
				let count = Math.max(ArrayUtils.compact(connections).length + 1, 2);
				return ArrayUtils.range(count).map((i) => type);
			} else {
				return [];
			}
		} else {
			return ArrayUtils.range(2).map((i) => type);
		}
	}
	protected _expected_output_types() {
		const type = this._expected_input_types()[0];
		return [type];
	}
	protected _gl_input_name(index: number) {
		return 'in';
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const var_type: GlConnectionPointType = this.io.outputs.namedOutputConnectionPoints()[0].type();
		const args = this.io.inputs.namedInputConnectionPoints().map((connection, i) => {
			const name = connection.name();
			return ThreeToGl.any(this.variableForInput(name));
		});
		const joined_args = args.join(', ');

		const sum = this.glVarName(this.io.connection_points.output_name(0));
		const body_line = `${var_type} ${sum} = ${this.gl_method_name()}(${joined_args})`;
		shaders_collection_controller.addBodyLines(this, [body_line]);
		shaders_collection_controller.addDefinitions(this, this.gl_function_definitions());
	}
}

function inputTypeOrFloatExceptBool(inputType: GlConnectionPointType | undefined): GlConnectionPointType {
	if (inputType == GlConnectionPointType.BOOL) {
		inputType = GlConnectionPointType.FLOAT;
	}
	const type = inputType || GlConnectionPointType.FLOAT;
	return type;
}

//
//
// 1 argument
//
//
export abstract class BaseNodeGlMathFunctionArg1GlNode extends BaseGlMathFunctionGlNode {
	protected override _gl_input_name(index: number) {
		return 'in';
	}
	protected override _expected_input_types() {
		const type = inputTypeOrFloatExceptBool(this.io.connection_points.first_input_connection_type());
		return [type];
	}
}

//
//
// 2 arguments
//
//
export abstract class BaseNodeGlMathFunctionArg2GlNode extends BaseGlMathFunctionGlNode {
	protected override _expected_input_types() {
		const type = inputTypeOrFloatExceptBool(this.io.connection_points.first_input_connection_type());
		return [type, type];
	}
}

//
//
// 3 arguments
//
//
export abstract class BaseNodeGlMathFunctionArg3GlNode extends BaseGlMathFunctionGlNode {
	protected override _expected_input_types() {
		const type = inputTypeOrFloatExceptBool(this.io.connection_points.first_input_connection_type());
		return [type, type, type];
	}
}
//
//
// 4 arguments
//
//
export abstract class BaseNodeGlMathFunctionArg4GlNode extends BaseGlMathFunctionGlNode {
	protected override _expected_input_types() {
		const type = inputTypeOrFloatExceptBool(this.io.connection_points.first_input_connection_type());
		return [type, type, type, type];
	}
}
//
//
// 5 arguments
//
//
export abstract class BaseNodeGlMathFunctionArg5GlNode extends BaseGlMathFunctionGlNode {
	protected override _expected_input_types() {
		const type = inputTypeOrFloatExceptBool(this.io.connection_points.first_input_connection_type());
		return [type, type, type, type, type];
	}
}
