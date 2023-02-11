/**
 * Update the geometry instance positions, quaternions and scales
 *
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {Mesh} from 'three';
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {updateInstancePositions, updateInstanceQuaternions, updateInstanceScales} from './utils/ActorInstance';

export const SetGeometryInstanceTransformsInputName = {
	[ActorConnectionPointType.TRIGGER]: ActorConnectionPointType.TRIGGER,
	[ActorConnectionPointType.OBJECT_3D]: ActorConnectionPointType.OBJECT_3D,
	position: 'position',
	quaternion: 'quaternion',
	scale: 'scale',
	mult: 'mult',
	lerp: 'lerp',
	attributeNeedsUpdate: 'attributeNeedsUpdate',
};
const INPUT_NAMES = [
	SetGeometryInstanceTransformsInputName.trigger,
	SetGeometryInstanceTransformsInputName.Object3D,
	SetGeometryInstanceTransformsInputName.position,
	SetGeometryInstanceTransformsInputName.quaternion,
	SetGeometryInstanceTransformsInputName.scale,
	SetGeometryInstanceTransformsInputName.mult,
	SetGeometryInstanceTransformsInputName.lerp,
	SetGeometryInstanceTransformsInputName.attributeNeedsUpdate,
];
const DefaultValues: Record<string, number | boolean> = {
	[SetGeometryInstanceTransformsInputName.lerp]: 1,
	[SetGeometryInstanceTransformsInputName.attributeNeedsUpdate]: true,
};

class SetGeometryInstanceTransformsActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SetGeometryInstanceTransformsActorParamsConfig();

export class SetGeometryInstanceTransformsActorNode extends TypedActorNode<SetGeometryInstanceTransformsActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setGeometryInstanceTransforms';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this.expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_output_name_function(
			(i) => [ActorConnectionPointType.TRIGGER, ActorConnectionPointType.OBJECT_3D][i]
		);
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}
	expectedInputTypes() {
		return [
			ActorConnectionPointType.TRIGGER,
			ActorConnectionPointType.OBJECT_3D,
			ActorConnectionPointType.VECTOR3_ARRAY,
			ActorConnectionPointType.QUATERNION_ARRAY,
			ActorConnectionPointType.VECTOR3_ARRAY,
			ActorConnectionPointType.FLOAT_ARRAY,
			ActorConnectionPointType.FLOAT,
			ActorConnectionPointType.BOOLEAN,
		];
	}
	protected _expectedOutputTypes() {
		return [ActorConnectionPointType.TRIGGER, ActorConnectionPointType.OBJECT_3D];
	}
	protected _expectedInputName(index: number) {
		return INPUT_NAMES[index];
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;

		const geometry = (Object3D as Mesh).geometry;
		if (geometry) {
			const lerp =
				this._inputValue<ActorConnectionPointType.FLOAT>(
					SetGeometryInstanceTransformsInputName.lerp,
					context
				) || 1;
			const attributeNeedsUpdate =
				this._inputValue<ActorConnectionPointType.BOOLEAN>(
					SetGeometryInstanceTransformsInputName.attributeNeedsUpdate,
					context
				) || false;
			const positionValues = this._inputValue<ActorConnectionPointType.VECTOR3_ARRAY>(
				SetGeometryInstanceTransformsInputName.position,
				context
			);
			const quaternionValues = this._inputValue<ActorConnectionPointType.QUATERNION_ARRAY>(
				SetGeometryInstanceTransformsInputName.quaternion,
				context
			);
			const scaleValues = this._inputValue<ActorConnectionPointType.VECTOR3_ARRAY>(
				SetGeometryInstanceTransformsInputName.scale,
				context
			);
			const multValues = this._inputValue<ActorConnectionPointType.FLOAT_ARRAY>(
				SetGeometryInstanceTransformsInputName.mult,
				context
			);
			if (positionValues) {
				updateInstancePositions(geometry, positionValues, lerp, attributeNeedsUpdate);
			}
			if (quaternionValues) {
				updateInstanceQuaternions(geometry, quaternionValues, lerp, attributeNeedsUpdate);
			}
			if (scaleValues || multValues) {
				updateInstanceScales(geometry, scaleValues, multValues, lerp, attributeNeedsUpdate);
			}
		}

		this.runTrigger(context);
	}
}
