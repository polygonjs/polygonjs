/**
 * inverseTransformDirection
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

const OUTPUT_NAME = 'normal';

class InverseTransformDirectionGlParamsConfig extends NodeParamsConfig {
	normal = ParamConfig.VECTOR3([0, 1, 0]);
}
const ParamsConfig = new InverseTransformDirectionGlParamsConfig();
export class InverseTransformDirectionGlNode extends TypedGlNode<InverseTransformDirectionGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<'inverseTransformDirection'> {
		return 'inverseTransformDirection';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3),
		]);
	}

	override setLines(linesController: ShadersCollectionController) {
		if (linesController.currentShaderName() == ShaderName.VERTEX) {
			const input = ThreeToGl.vector3(this.variableForInputParam(this.p.normal));
			const outValue = this.glVarName(OUTPUT_NAME);
			const bodyLine = `vec3 ${outValue} = inverseTransformDirection(${input}, modelMatrix)`;
			linesController.addBodyLines(this, [bodyLine], ShaderName.VERTEX);
		}
	}
}
