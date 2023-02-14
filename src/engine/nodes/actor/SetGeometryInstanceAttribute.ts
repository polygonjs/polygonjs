/**
 * Update the geometry instance attribute
 *
 *
 */

import {
	ActorNodeTriggerContext,
	TypedActorNode,
	ACTOR_NODE_SELF_TRIGGER_CALLBACK,
	TRIGGER_CONNECTION_NAME,
} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Mesh, Quaternion} from 'three';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {
	updateInstanceAttributeFloat,
	updateInstanceAttributeVector2,
	updateInstanceAttributeVector3,
	updateInstanceAttributeVector4,
	updateInstanceAttributeQuaternions,
} from './utils/ActorInstance';

// import {updateInstancePositions} from './utils/ActorInstance';
const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;
export const SetGeometryInstanceAttributeInputName = {
	// [ActorConnectionPointType.TRIGGER]: ActorConnectionPointType.TRIGGER,
	// [ActorConnectionPointType.OBJECT_3D]: ActorConnectionPointType.OBJECT_3D,
	values: 'values',
	lerp: 'lerp',
	attributeNeedsUpdate: 'attributeNeedsUpdate',
};
const INPUT_NAMES = [
	// SetGeometryInstancePositionsInputName.trigger,
	// SetGeometryInstancePositionsInputName.Object3D,
	SetGeometryInstanceAttributeInputName.values,
	SetGeometryInstanceAttributeInputName.lerp,
	SetGeometryInstanceAttributeInputName.attributeNeedsUpdate,
];
// const DefaultValues: Record<string, number | boolean> = {
// 	[SetGeometryInstancePositionsInputName.lerp]: 1,
// 	[SetGeometryInstancePositionsInputName.attributeNeedsUpdate]: true,
// };
const CONNECTION_TYPE_BY_ATTRIB_SIZE: ActorConnectionPointType[] = [
	ActorConnectionPointType.FLOAT_ARRAY,
	ActorConnectionPointType.VECTOR2_ARRAY,
	ActorConnectionPointType.VECTOR3_ARRAY,
	ActorConnectionPointType.VECTOR4_ARRAY,
];

class SetGeometryInstanceAttributeActorParamsConfig extends NodeParamsConfig {
	/** @param manual trigger */
	trigger = ParamConfig.BUTTON(null, ACTOR_NODE_SELF_TRIGGER_CALLBACK);
	/** @param attribute name */
	attribName = ParamConfig.STRING('');
	/** @param attribute size */
	size = ParamConfig.INTEGER(1, {
		range: [1, 4],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new SetGeometryInstanceAttributeActorParamsConfig();

export class SetGeometryInstanceAttributeActorNode extends TypedActorNode<SetGeometryInstanceAttributeActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setGeometryInstanceAttribute';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.spare_params.setInputlessParamNames(['attribName', 'size']);

		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
		]);

		this.io.connection_points.set_input_name_function((i) => this._expectedInputName(i));
		this.io.connection_points.set_expected_input_types_function(() => this._currentConnectionType());
		this.io.connection_points.set_output_name_function(
			(i) => [TRIGGER_CONNECTION_NAME, ActorConnectionPointType.OBJECT_3D][i]
		);
		this.io.connection_points.set_expected_output_types_function(() => [
			ActorConnectionPointType.TRIGGER,
			ActorConnectionPointType.OBJECT_3D,
		]);
	}
	private _currentConnectionType() {
		const type = CONNECTION_TYPE_BY_ATTRIB_SIZE[this.pv.size - 1] || ActorConnectionPointType.FLOAT;
		return [type, ActorConnectionPointType.FLOAT, ActorConnectionPointType.BOOLEAN];
	}
	// override paramDefaultValue(name: string) {
	// 	return DefaultValues[name];
	// }
	// expectedInputTypes() {
	// 	return [
	// 		ActorConnectionPointType.TRIGGER,
	// 		ActorConnectionPointType.OBJECT_3D,
	// 		ActorConnectionPointType.VECTOR3_ARRAY,
	// 		ActorConnectionPointType.FLOAT,
	// 		ActorConnectionPointType.BOOLEAN,
	// 	];
	// }
	// protected _expectedOutputTypes() {
	// 	return [ActorConnectionPointType.TRIGGER];
	// }
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
				this._inputValue<ActorConnectionPointType.FLOAT>(SetGeometryInstanceAttributeInputName.lerp, context) ||
				1;
			const attributeNeedsUpdate =
				this._inputValue<ActorConnectionPointType.BOOLEAN>(
					SetGeometryInstanceAttributeInputName.attributeNeedsUpdate,
					context
				) || false;

			switch (this.pv.size) {
				case 1: {
					const values = this._inputValue<ActorConnectionPointType.FLOAT_ARRAY>(
						SetGeometryInstanceAttributeInputName.values,
						context
					);
					if (values) {
						updateInstanceAttributeFloat(geometry, this.pv.attribName, values, lerp, attributeNeedsUpdate);
					}
					break;
				}
				case 2: {
					const values = this._inputValue<ActorConnectionPointType.VECTOR2_ARRAY>(
						SetGeometryInstanceAttributeInputName.values,
						context
					);
					if (values) {
						updateInstanceAttributeVector2(
							geometry,
							this.pv.attribName,
							values,
							lerp,
							attributeNeedsUpdate
						);
					}
					break;
				}
				case 3: {
					const values = this._inputValue<ActorConnectionPointType.VECTOR3_ARRAY>(
						SetGeometryInstanceAttributeInputName.values,
						context
					);
					if (values) {
						updateInstanceAttributeVector3(
							geometry,
							this.pv.attribName,
							values,
							lerp,
							attributeNeedsUpdate
						);
					}
					break;
				}
				case 4: {
					const values = this._inputValue<ActorConnectionPointType.VECTOR4_ARRAY>(
						SetGeometryInstanceAttributeInputName.values,
						context
					);
					if (values) {
						const firstValue = values[0];
						if (firstValue) {
							if (firstValue instanceof Quaternion) {
								updateInstanceAttributeVector4(
									geometry,
									this.pv.attribName,
									values,
									lerp,
									attributeNeedsUpdate
								);
							} else {
								updateInstanceAttributeQuaternions(
									geometry,
									this.pv.attribName,
									values as any as Quaternion[],
									lerp,
									attributeNeedsUpdate
								);
							}
						}
					}
					break;
				}
			}
		}

		// const geometry = (Object3D as Mesh).geometry;
		// if (values && geometry) {
		// 	const lerp =
		// 		this._inputValue<ActorConnectionPointType.FLOAT>(SetGeometryInstancePositionsInputName.lerp, context) ||
		// 		1;
		// 	const attributeNeedsUpdate =
		// 		this._inputValue<ActorConnectionPointType.BOOLEAN>(
		// 			SetGeometryInstancePositionsInputName.attributeNeedsUpdate,
		// 			context
		// 		) || false;
		// 	updateInstancePositions(geometry, values, lerp, attributeNeedsUpdate);
		// }

		this.runTrigger(context);
	}
}
