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
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';

const CONNECTION_OPTIONS = {
	inNodeDefinition: true,
};

class ScaleObjectActorParamsConfig extends NodeParamsConfig {
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
const ParamsConfig = new ScaleObjectActorParamsConfig();

const tmpS = new Vector3();
export class ScaleObjectActorNode extends TypedActorNode<ScaleObjectActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'scaleObject';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(
				ActorConnectionPointType.TRIGGER,
				ActorConnectionPointType.TRIGGER,
				CONNECTION_OPTIONS
			),
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(ActorConnectionPointType.TRIGGER, ActorConnectionPointType.TRIGGER),
		]);
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
