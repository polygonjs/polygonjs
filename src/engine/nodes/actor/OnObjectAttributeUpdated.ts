/**
 * sends a trigger when an object attribute has been updated
 *
 *
 */

import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {ActorType} from '../../poly/registers/nodes/types/Actor';
import {CoreObject} from '../../../core/geometry/Object';

const CONNECTION_OPTIONS = {
	inNodeDefinition: true,
};
class OnObjectAttributeUpdatedActorParamsConfig extends NodeParamsConfig {
	attribName = ParamConfig.STRING('');
	type = ParamConfig.INTEGER(PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.indexOf(ActorConnectionPointType.FLOAT), {
		menu: {
			entries: PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
}
const ParamsConfig = new OnObjectAttributeUpdatedActorParamsConfig();

export class OnObjectAttributeUpdatedActorNode extends TypedActorNode<OnObjectAttributeUpdatedActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return ActorType.ON_OBJECT_ATTRIBUTE_UPDATED;
	}

	static readonly OUTPUT_PREV_VAL = 'previousValue';
	static readonly OUTPUT_NEW_VAL = 'newValue';
	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);

		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_output_name_function(
			(index: number) =>
				[
					TRIGGER_CONNECTION_NAME,
					OnObjectAttributeUpdatedActorNode.OUTPUT_NEW_VAL,
					OnObjectAttributeUpdatedActorNode.OUTPUT_PREV_VAL,
				][index]
		);
		this.io.connection_points.set_expected_output_types_function(() => [
			ActorConnectionPointType.TRIGGER,
			...this._currentConnectionType(),
		]);
	}
	private _currentConnectionType() {
		if (this.pv.type == null) {
			console.warn(`${this.type()} actor node type not valid`);
		}
		const connectionType = PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES[this.pv.type];
		if (connectionType == null) {
			console.warn(`${this.type()} actor node type not valid`);
		}
		return [connectionType, connectionType];
	}

	setAttribType(type: ActorConnectionPointType) {
		this.p.type.set(PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.indexOf(type));
	}
	attributeName() {
		return this.pv.attribName;
	}

	public override outputValue(
		inputName: string,
		context: ActorNodeTriggerContext
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
		switch (inputName) {
			case OnObjectAttributeUpdatedActorNode.OUTPUT_NEW_VAL: {
				const val = CoreObject.attribValue(context.Object3D, this.attributeName());
				if (val != null) {
					return val as ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType];
				}
			}
			case OnObjectAttributeUpdatedActorNode.OUTPUT_PREV_VAL: {
				const val = CoreObject.previousAttribValue(context.Object3D, this.attributeName());
				if (val != null) {
					return val as ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType];
				}
			}
		}
		return -1;
	}
}
