/**
 * sends a trigger when a child attribute has been updated
 *
 *
 */

import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
	PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {ActorType} from '../../poly/registers/nodes/types/Actor';
import {CoreObject} from '../../../core/geometry/Object';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;
class OnEventChildAttributeUpdatedActorParamsConfig extends NodeParamsConfig {
	attribName = ParamConfig.STRING('');
	type = ParamConfig.INTEGER(PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.indexOf(ActorConnectionPointType.FLOAT), {
		menu: {
			entries: PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
}
const ParamsConfig = new OnEventChildAttributeUpdatedActorParamsConfig();

export class OnEventChildAttributeUpdatedActorNode extends TypedActorNode<OnEventChildAttributeUpdatedActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return ActorType.ON_EVENT_CHILD_ATTRIBUTE_UPDATED;
	}

	static readonly OUTPUT_PREV_VALUES = 'previousValues';
	static readonly OUTPUT_NEW_VALUES = 'newValues';
	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);

		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_output_name_function(
			(index: number) =>
				[
					TRIGGER_CONNECTION_NAME,
					OnEventChildAttributeUpdatedActorNode.OUTPUT_NEW_VALUES,
					OnEventChildAttributeUpdatedActorNode.OUTPUT_PREV_VALUES,
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
		context: ActorNodeTriggerContext,
		outputName: string
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		switch (outputName) {
			case OnEventChildAttributeUpdatedActorNode.OUTPUT_NEW_VALUES: {
				return context.Object3D.children.map((child) =>
					CoreObject.attribValue(child, this.attributeName())
				) as ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType];
			}
			case OnEventChildAttributeUpdatedActorNode.OUTPUT_PREV_VALUES: {
				return context.Object3D.children.map((child) =>
					CoreObject.previousAttribValue(child, this.attributeName())
				) as ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType];
			}
		}
	}
}
