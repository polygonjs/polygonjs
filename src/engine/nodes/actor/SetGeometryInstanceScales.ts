/**
 * Update the geometry instance scales
 *
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {Mesh} from 'three';
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {updateInstanceScales} from './utils/ActorInstance';

export const SetGeometryInstanceScalesInputName = {
	[ActorConnectionPointType.TRIGGER]: ActorConnectionPointType.TRIGGER,
	[ActorConnectionPointType.OBJECT_3D]: ActorConnectionPointType.OBJECT_3D,
	scale: 'scale',
	mult: 'mult',
	lerp: 'lerp',
	attributeNeedsUpdate: 'attributeNeedsUpdate',
};
const INPUT_NAMES = [
	SetGeometryInstanceScalesInputName.trigger,
	SetGeometryInstanceScalesInputName.Object3D,
	SetGeometryInstanceScalesInputName.scale,
	SetGeometryInstanceScalesInputName.mult,
	SetGeometryInstanceScalesInputName.lerp,
	SetGeometryInstanceScalesInputName.attributeNeedsUpdate,
];
const DefaultValues: Record<string, number | boolean> = {
	[SetGeometryInstanceScalesInputName.lerp]: 1,
	[SetGeometryInstanceScalesInputName.attributeNeedsUpdate]: true,
};

class SetGeometryInstanceScalesActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SetGeometryInstanceScalesActorParamsConfig();

export class SetGeometryInstanceScalesActorNode extends TypedActorNode<SetGeometryInstanceScalesActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setGeometryInstanceScales';
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
		const scaleValues = this._inputValue<ActorConnectionPointType.VECTOR3_ARRAY>(
			SetGeometryInstanceScalesInputName.scale,
			context
		);
		const multValues = this._inputValue<ActorConnectionPointType.FLOAT_ARRAY>(
			SetGeometryInstanceScalesInputName.mult,
			context
		);

		const geometry = (Object3D as Mesh).geometry;
		if (geometry && (scaleValues || multValues)) {
			const lerp =
				this._inputValue<ActorConnectionPointType.FLOAT>(SetGeometryInstanceScalesInputName.lerp, context) || 1;
			const attributeNeedsUpdate =
				this._inputValue<ActorConnectionPointType.BOOLEAN>(
					SetGeometryInstanceScalesInputName.attributeNeedsUpdate,
					context
				) || false;
			updateInstanceScales(geometry, scaleValues, multValues, lerp, attributeNeedsUpdate);
		}

		this.runTrigger(context);
	}
}
