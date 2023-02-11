/**
 * Update the geometry instance positions
 *
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {Mesh} from 'three';
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {updateInstancePositions} from './utils/ActorInstance';

export const SetGeometryInstancePositionsInputName = {
	[ActorConnectionPointType.TRIGGER]: ActorConnectionPointType.TRIGGER,
	[ActorConnectionPointType.OBJECT_3D]: ActorConnectionPointType.OBJECT_3D,
	position: 'position',
	lerp: 'lerp',
	attributeNeedsUpdate: 'attributeNeedsUpdate',
};
const INPUT_NAMES = [
	SetGeometryInstancePositionsInputName.trigger,
	SetGeometryInstancePositionsInputName.Object3D,
	SetGeometryInstancePositionsInputName.position,
	SetGeometryInstancePositionsInputName.lerp,
	SetGeometryInstancePositionsInputName.attributeNeedsUpdate,
];
const DefaultValues: Record<string, number | boolean> = {
	[SetGeometryInstancePositionsInputName.lerp]: 1,
	[SetGeometryInstancePositionsInputName.attributeNeedsUpdate]: true,
};

class SetGeometryInstancePositionsActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SetGeometryInstancePositionsActorParamsConfig();

export class SetGeometryInstancePositionsActorNode extends TypedActorNode<SetGeometryInstancePositionsActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setGeometryInstancePositions';
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
		const values = this._inputValue<ActorConnectionPointType.VECTOR3_ARRAY>(
			SetGeometryInstancePositionsInputName.position,
			context
		);

		const geometry = (Object3D as Mesh).geometry;
		if (values && geometry) {
			const lerp =
				this._inputValue<ActorConnectionPointType.FLOAT>(SetGeometryInstancePositionsInputName.lerp, context) ||
				1;
			const attributeNeedsUpdate =
				this._inputValue<ActorConnectionPointType.BOOLEAN>(
					SetGeometryInstancePositionsInputName.attributeNeedsUpdate,
					context
				) || false;
			updateInstancePositions(geometry, values, lerp, attributeNeedsUpdate);
		}

		this.runTrigger(context);
	}
}
