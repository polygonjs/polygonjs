/**
 * applies a polar transform to the object
 *
 *
 */
import {CorePolarTransform, PolarTransformMatrixParams} from './../../../core/PolarTransform';
import {Matrix4} from 'three';
import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Vector3} from 'three';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {ParamType} from '../../poly/ParamType';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class SetObjectPolarTransformActorParamsConfig extends NodeParamsConfig {
	/** @param center of the transform */
	center = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param moves the objects along the longitude, which is equivalent to a rotation on the y axis */
	longitude = ParamConfig.FLOAT(0, {
		range: [-360, 360],
	});
	/** @param moves the objects along the latitude, which is equivalent to a rotation on the z or x axis */
	latitude = ParamConfig.FLOAT(0, {
		range: [-180, 180],
	});
	/** @param moves the point aways from the center */
	depth = ParamConfig.FLOAT(1, {
		range: [0, 10],
	});
	/** @param lerp factor */
	// lerp = ParamConfig.FLOAT(1);
	/** @param sets if the matrix should be updated as the animation progresses */
	// updateMatrix = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SetObjectPolarTransformActorParamsConfig();
const fullMatrix = new Matrix4();
const params: PolarTransformMatrixParams = {
	center: new Vector3(),
	longitude: 0,
	latitude: 0,
	depth: 0,
};

export class SetObjectPolarTransformActorNode extends TypedActorNode<SetObjectPolarTransformActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setObjectPolarTransform';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
		]);
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;
		const center = this._inputValueFromParam<ParamType.VECTOR3>(this.p.center, context);
		params.center.copy(center);
		params.longitude = this._inputValueFromParam<ParamType.FLOAT>(this.p.longitude, context);
		params.latitude = this._inputValueFromParam<ParamType.FLOAT>(this.p.latitude, context);
		params.depth = this._inputValueFromParam<ParamType.FLOAT>(this.p.depth, context);
		// const lerp = this._inputValueFromParam<ParamType.FLOAT>(this.p.lerp, context);
		// const updateMatrix = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.updateMatrix, context);

		CorePolarTransform.matrix(params, fullMatrix);
		CorePolarTransform.applyMatrixToObject(Object3D, fullMatrix);

		this.runTrigger(context);
	}
}
