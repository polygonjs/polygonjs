import {TypedSubnetGlNode, TypedSubnetGlParamsConfigMixin} from './Subnet';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {SubnetInputGlNode} from './SubnetInput';
import {FunctionGLDefinition} from './utils/GLDefinition';

const POSITION_INPUT_NAME = 'position';
const GRADIENT_OUTPUT_NAME = 'position';

class SDFGradientGlParamsConfig extends TypedSubnetGlParamsConfigMixin(NodeParamsConfig) {}
const ParamsConfig = new SDFGradientGlParamsConfig();

export class SDFGradientGlNode extends TypedSubnetGlNode<SDFGradientGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<'SDFGradient'> {
		return 'SDFGradient';
	}

	protected override _expectedInputsCount() {
		return 1;
	}

	protected override _expectedInputTypes(): GlConnectionPointType[] {
		return [GlConnectionPointType.VEC3];
	}

	protected override _expectedOutputTypes() {
		return [GlConnectionPointType.VEC3];
	}
	protected override _expectedInputName(index: number) {
		return POSITION_INPUT_NAME;
	}
	protected override _expectedOutputName(index: number) {
		return GRADIENT_OUTPUT_NAME;
	}

	//
	//
	// set_lines
	//
	//
	override set_lines_block_start(
		shaders_collection_controller: ShadersCollectionController,
		child_node: SubnetInputGlNode
	) {
		const body_lines: string[] = [];
		const connection_points = this.io.inputs.namedInputConnectionPoints();
		for (let i = 0; i < connection_points.length; i++) {
			const connection_point = connection_points[i];
			const gl_type = connection_point.type();
			const out = this.glVarName(connection_point.name());
			const in_value = ThreeToGl.any(this.variableForInput(connection_point.name()));
			const body_line = `${gl_type} ${out} = ${in_value}`;
			body_lines.push(body_line);
		}
		const open_if_line = `if(true){`;
		body_lines.push(open_if_line);

		const connections = this.io.connections.inputConnections();
		if (connections) {
			for (let connection of connections) {
				if (connection) {
					const connection_point = connection.dest_connection_point();
					const in_value = ThreeToGl.any(this.variableForInput(connection_point.name()));
					const gl_type = connection_point.type();
					const out = child_node.glVarName(connection_point.name());
					const body_line = `	${gl_type} ${out} = ${in_value}`;
					body_lines.push(body_line);
				}
			}
		}

		shaders_collection_controller.addBodyLines(child_node, body_lines);
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const test = `
		float thisisatest( vec3 p )
{
	return p;
}`;
		const position = ThreeToGl.vector2(this.variableForInput(POSITION_INPUT_NAME));
		const gradient = this.glVarName(GRADIENT_OUTPUT_NAME);
		const body_line = `vec3 ${gradient} = thisisatest(${position})`;
		shaders_collection_controller.addBodyLines(this, [body_line]);

		shaders_collection_controller.addDefinitions(this, [new FunctionGLDefinition(this, test)]);
	}
}
