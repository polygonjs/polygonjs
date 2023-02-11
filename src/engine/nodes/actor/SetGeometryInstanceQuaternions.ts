/**
 * Update the geometry instance quaternions
 *
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {Mesh} from 'three';
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {updateInstanceQuaternions} from './utils/ActorInstance';

export const SetGeometryInstanceQuaternionsInputName = {
	[ActorConnectionPointType.TRIGGER]: ActorConnectionPointType.TRIGGER,
	[ActorConnectionPointType.OBJECT_3D]: ActorConnectionPointType.OBJECT_3D,
	quaternion: 'quaternion',
	lerp: 'lerp',
	attributeNeedsUpdate: 'attributeNeedsUpdate',
};
const INPUT_NAMES = [
	SetGeometryInstanceQuaternionsInputName.trigger,
	SetGeometryInstanceQuaternionsInputName.Object3D,
	SetGeometryInstanceQuaternionsInputName.quaternion,
	SetGeometryInstanceQuaternionsInputName.lerp,
	SetGeometryInstanceQuaternionsInputName.attributeNeedsUpdate,
];
const DefaultValues: Record<string, number | boolean> = {
	[SetGeometryInstanceQuaternionsInputName.lerp]: 1,
	[SetGeometryInstanceQuaternionsInputName.attributeNeedsUpdate]: true,
};

class SetGeometryInstanceQuaternionsActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SetGeometryInstanceQuaternionsActorParamsConfig();

export class SetGeometryInstanceQuaternionsActorNode extends TypedActorNode<SetGeometryInstanceQuaternionsActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setGeometryInstanceQuaternions';
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
			ActorConnectionPointType.QUATERNION_ARRAY,
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
		const values = this._inputValue<ActorConnectionPointType.QUATERNION_ARRAY>(
			SetGeometryInstanceQuaternionsInputName.quaternion,
			context
		);

		const geometry = (Object3D as Mesh).geometry;
		if (values && geometry) {
			const lerp =
				this._inputValue<ActorConnectionPointType.FLOAT>(
					SetGeometryInstanceQuaternionsInputName.lerp,
					context
				) || 1;
			const attributeNeedsUpdate =
				this._inputValue<ActorConnectionPointType.BOOLEAN>(
					SetGeometryInstanceQuaternionsInputName.attributeNeedsUpdate,
					context
				) || false;
			updateInstanceQuaternions(geometry, values, lerp, attributeNeedsUpdate);
		}

		this.runTrigger(context);
	}
}
