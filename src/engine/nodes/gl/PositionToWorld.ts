/**
 * position from local to world
 *
 *
 *
 */

import {TypedGlNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ShaderName} from '../utils/shaders/ShaderName';
import {ThreeToGl} from '../../../core/ThreeToGl';

const OUTPUT_NAME = 'worldPosition';

class PositionToWorldGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 1, 0]);
}
const ParamsConfig = new PositionToWorldGlParamsConfig();
export class PositionToWorldGlNode extends TypedGlNode<PositionToWorldGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<'positionToWorld'> {
		return 'positionToWorld';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC4),
		]);
	}

	override setLines(linesController: ShadersCollectionController) {
		if (linesController.currentShaderName() == ShaderName.VERTEX) {
			const input = ThreeToGl.vector3(this.variableForInputParam(this.p.position));
			const outValue = this.glVarName(OUTPUT_NAME);
			const bodyLine = `vec4 ${outValue} = modelMatrix * vec4(${input}, 1.0)`;
			linesController.addBodyLines(this, [bodyLine], ShaderName.VERTEX);
		}
	}
}
