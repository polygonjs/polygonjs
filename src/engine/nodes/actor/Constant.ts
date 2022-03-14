/**
 * Update the object's scale
 *
 *
 */

import {TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPointType, PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES} from '../utils/io/connections/Actor';
import {PolyDictionary} from '../../../types/GlobalTypes';
import {BaseParamType} from '../../params/_Base';
function typedVisibleOptions(type: ActorConnectionPointType, otherParamVal: PolyDictionary<number | boolean> = {}) {
	const val = PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.indexOf(type);
	return {visibleIf: {type: val, ...otherParamVal}};
}

class ConstantActorParamsConfig extends NodeParamsConfig {
	type = ParamConfig.INTEGER(PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.indexOf(ActorConnectionPointType.FLOAT), {
		menu: {
			entries: PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	boolean = ParamConfig.BOOLEAN(0, typedVisibleOptions(ActorConnectionPointType.BOOLEAN));
	color = ParamConfig.COLOR([0, 0, 0], typedVisibleOptions(ActorConnectionPointType.COLOR));
	float = ParamConfig.FLOAT(0, typedVisibleOptions(ActorConnectionPointType.FLOAT));
	integer = ParamConfig.INTEGER(0, typedVisibleOptions(ActorConnectionPointType.INTEGER));
	vector2 = ParamConfig.VECTOR2([0, 0], typedVisibleOptions(ActorConnectionPointType.VECTOR2));
	vector3 = ParamConfig.VECTOR3([0, 0, 0], typedVisibleOptions(ActorConnectionPointType.VECTOR3));
	vector4 = ParamConfig.VECTOR4([0, 0, 0, 0], typedVisibleOptions(ActorConnectionPointType.VECTOR4));
}
const ParamsConfig = new ConstantActorParamsConfig();

export class ConstantActorNode extends TypedActorNode<ConstantActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'constant';
	}

	static readonly OUTPUT_NAME = 'val';
	override initializeNode() {
		this.io.connection_points.set_output_name_function((index: number) => ConstantActorNode.OUTPUT_NAME);
		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_expected_output_types_function(() => [this._currentConnectionType()]);
	}

	private _currentConnectionType() {
		if (this.pv.type == null) {
			console.warn('constant actor node type if not valid');
		}
		const connection_type = PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES[this.pv.type];
		if (connection_type == null) {
			console.warn('constant actor node type if not valid');
		}
		return connection_type;
	}

	currentParam(): BaseParamType {
		const type = PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES[this.pv.type];
		switch (type) {
			case ActorConnectionPointType.BOOLEAN: {
				return this.p.boolean;
			}
			case ActorConnectionPointType.COLOR: {
				return this.p.color;
			}
			case ActorConnectionPointType.FLOAT: {
				return this.p.float;
			}
			case ActorConnectionPointType.INTEGER: {
				return this.p.integer;
			}
			case ActorConnectionPointType.VECTOR2: {
				return this.p.vector2;
			}
			case ActorConnectionPointType.VECTOR3: {
				return this.p.vector3;
			}
			case ActorConnectionPointType.VECTOR4: {
				return this.p.vector4;
			}
		}
		// we should never run this
		return this.p.boolean;
	}

	setConstantType(type: ActorConnectionPointType) {
		this.p.type.set(PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.indexOf(type));
	}
}
