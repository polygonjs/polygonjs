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
	ActorConnectionPointTypeToArrayTypeMap,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
	PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {ActorType} from '../../poly/registers/nodes/types/Actor';
import {CoreObject} from '../../../core/geometry/Object';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;
class OnChildAttributeUpdateActorParamsConfig extends NodeParamsConfig {
	attribName = ParamConfig.STRING('');
	type = ParamConfig.INTEGER(PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.indexOf(ActorConnectionPointType.FLOAT), {
		menu: {
			entries: PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
}
const ParamsConfig = new OnChildAttributeUpdateActorParamsConfig();

export class OnChildAttributeUpdateActorNode extends TypedActorNode<OnChildAttributeUpdateActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return ActorType.ON_CHILD_ATTRIBUTE_UPDATE;
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
					OnChildAttributeUpdateActorNode.OUTPUT_NEW_VALUES,
					OnChildAttributeUpdateActorNode.OUTPUT_PREV_VALUES,
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
		const arrayConnectionType = ActorConnectionPointTypeToArrayTypeMap[connectionType];
		return [arrayConnectionType, arrayConnectionType];
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
			case OnChildAttributeUpdateActorNode.OUTPUT_NEW_VALUES: {
				return context.Object3D.children.map((child) =>
					CoreObject.attribValue(child, this.attributeName())
				) as ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType];
			}
			// case OnChildAttributeUpdateActorNode.OUTPUT_PREV_VALUES: {
			// 	return context.Object3D.children.map((child) =>
			// 		CoreObject.previousAttribValue(child, this.attributeName())
			// 	) as ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType];
			// }
		}
	}
}
