/**
 * converts an input position to worldspace
 *
 *
 *
 *
 */

import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPoint, GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

enum Interpretation {
	POSITION = 'position',
	DIR_VEC = 'direction vector',
}
const INTERPRETATIONS: Interpretation[] = [Interpretation.POSITION, Interpretation.DIR_VEC];

const OUTPUT_NAME = 'out';
class ToWorldSpaceGlParamsConfig extends NodeParamsConfig {
	vec = ParamConfig.VECTOR3([0, 0, 0]);
	interpretation = ParamConfig.INTEGER(0, {
		menu: {
			entries: INTERPRETATIONS.map((name, value) => {
				return {name, value};
			}),
		},
	});
}
const ParamsConfig = new ToWorldSpaceGlParamsConfig();
export class ToWorldSpaceGlNode extends TypedGlNode<ToWorldSpaceGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'toWorldSpace';
	}

	override initializeNode() {
		this.io.connection_points.spare_params.set_inputless_param_names(['interpretation']);
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3),
		]);
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const body_lines = [];
		const vec = ThreeToGl.vector3(this.variableForInputParam(this.p.vec));
		const out = this.glVarName(OUTPUT_NAME);

		const interpretation = INTERPRETATIONS[this.pv.interpretation];
		switch (interpretation) {
			case Interpretation.POSITION: {
				body_lines.push(`vec3 ${out} = (modelMatrix * vec4( ${vec}, 1.0 )).xyz`);
				break;
			}
			case Interpretation.DIR_VEC: {
				body_lines.push(
					`vec3 ${out} = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * ${vec} )`
				);
				break;
			}
		}
		shaders_collection_controller.addBodyLines(this, body_lines);
	}
}
