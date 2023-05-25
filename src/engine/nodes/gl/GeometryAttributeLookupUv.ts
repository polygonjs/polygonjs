/**
 * gets uv from id
 *
 */

import {ThreeToGl} from '../../../core/ThreeToGl';
import GET_UV from './gl/geometryAttributes/geometryAttributesLookupUv.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {TypedGlNode} from './_Base';

const OUTPUT_NAME = 'uv';
class GeometryAttributeLookupUvGlParamsConfig extends NodeParamsConfig {
	id = ParamConfig.FLOAT(0);
	textureSize = ParamConfig.VECTOR2([1, 1]);
}
const ParamsConfig = new GeometryAttributeLookupUvGlParamsConfig();
export class GeometryAttributeLookupUvGlNode extends TypedGlNode<GeometryAttributeLookupUvGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'geometryAttributeLookupUv';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC2),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const id = ThreeToGl.float(this.variableForInputParam(this.p.id));
		const textureSize = ThreeToGl.vector2(this.variableForInputParam(this.p.textureSize));

		const uv = this.glVarName(OUTPUT_NAME);
		const functionCall = `geometryAttributesLookupUv(${id},${textureSize})`;
		const bodyLine = `vec2 ${uv} = ${functionCall}`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, GET_UV)]);
	}
}
