import Quaternion from './gl/quaternion.glsl';
import Impostor from './gl/impostor.glsl';
import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {FunctionGLDefinition} from './utils/GLDefinition';

const OUTPUT_NAME = 'uv';
class ImpostorUvGlParamsConfig extends NodeParamsConfig {
	center = ParamConfig.VECTOR3([0, 0, 0]);
	cameraPos = ParamConfig.VECTOR3([0, 0, 0]);
	uv = ParamConfig.VECTOR2([0, 0]);
	tilesCount = ParamConfig.INTEGER(8, {
		range: [0, 32],
		rangeLocked: [true, false],
	});
	offset = ParamConfig.FLOAT(0);
}
const ParamsConfig = new ImpostorUvGlParamsConfig();
export class ImpostorUvGlNode extends TypedGlNode<ImpostorUvGlParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'impostorUv';
	}
	initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC2),
		]);
	}

	setLines(shaders_collection_controller: ShadersCollectionController) {
		const body_lines: string[] = [];

		shaders_collection_controller.addDefinitions(this, [
			new FunctionGLDefinition(this, Quaternion),
			new FunctionGLDefinition(this, Impostor),
		]);

		const center = ThreeToGl.vector3(this.variableForInputParam(this.p.center));
		const cameraPos = ThreeToGl.vector3(this.variableForInputParam(this.p.cameraPos));
		const uv = ThreeToGl.vector2(this.variableForInputParam(this.p.uv));
		const tilesCount = ThreeToGl.float(this.variableForInputParam(this.p.tilesCount));
		const offset = ThreeToGl.float(this.variableForInputParam(this.p.offset));

		const impostor_uv = this.glVarName(OUTPUT_NAME);
		const args = [center, cameraPos, uv, tilesCount, offset].join(', ');
		body_lines.push(`vec2 ${impostor_uv} = impostor_uv(${args})`);

		shaders_collection_controller.addBodyLines(this, body_lines);
	}
}
