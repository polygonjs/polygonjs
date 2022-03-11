/**
 * Update the object's scale
 *
 *
 */

import {TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Object3D} from 'three/src/core/Object3D';
import {Vector3} from 'three/src/math/Vector3';
import {isBooleanTrue} from '../../../core/Type';
import {CoreObject} from '../../../core/geometry/Object';
class ScaleActorParamsConfig extends NodeParamsConfig {
	/** @param target scale */
	s = ParamConfig.VECTOR3([1, 1, 1], {
		expression: {forEntities: true},
	});
	/** @param target scale */
	scale = ParamConfig.FLOAT(1, {
		expression: {forEntities: true},
	});
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
	/** @param sets if the matrix should be updated as the animation progresses */
	updateMatrix = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new ScaleActorParamsConfig();

const tmpS = new Vector3();
export class ScaleActorNode extends TypedActorNode<ScaleActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'scale';
	}

	override processActor(object: Object3D) {
		console.log('scale', this.p.s.y.expressionController, object);
		this.p.s.y.expressionController?.computeExpressionForEntities([new CoreObject(object, 0)], (entity, val) => {
			console.log(entity, val);
			tmpS.copy(this.pv.s).multiplyScalar(this.pv.scale);
			object.scale.lerp(tmpS, this.pv.lerp);
			if (isBooleanTrue(this.pv.updateMatrix)) {
				object.updateMatrix();
			}
		});
	}
}
