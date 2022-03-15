import {TypedActorNode} from './_Base';
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ArrayUtils} from '../../../core/ArrayUtils';

export class BaseActorMathFunctionParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new BaseActorMathFunctionParamsConfig();
export abstract class BaseMathFunctionActorNode extends TypedActorNode<BaseActorMathFunctionParamsConfig> {
	override paramsConfig = ParamsConfig;

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
	}
	protected _expectedInputTypes(): ActorConnectionPointType[] {
		const type: ActorConnectionPointType =
			this.io.connection_points.first_input_connection_type() || ActorConnectionPointType.FLOAT;
		if (this.io.connections.firstInputConnection()) {
			const connections = this.io.connections.inputConnections();
			if (connections) {
				let count = Math.max(ArrayUtils.compact(connections).length + 1, 2);
				return ArrayUtils.range(count).map((i) => type);
			} else {
				return [];
			}
		} else {
			return ArrayUtils.range(2).map((i) => type);
		}
	}
	protected _expectedOutputTypes() {
		const type = this._expectedInputTypes()[0];
		return [type];
	}
	protected _expectedInputName(index: number) {
		return 'in';
	}
}

function inputTypeOrFloatExceptBool(inputType: ActorConnectionPointType | undefined): ActorConnectionPointType {
	if (inputType == ActorConnectionPointType.BOOLEAN) {
		inputType = ActorConnectionPointType.FLOAT;
	}
	const type = inputType || ActorConnectionPointType.FLOAT;
	return type;
}

//
//
// 1 argument
//
//
export abstract class BaseMathFunctionArg1ActorNode extends BaseMathFunctionActorNode {
	protected override _expectedInputName(index: number) {
		return 'in';
	}
	protected override _expectedInputTypes() {
		const type = inputTypeOrFloatExceptBool(this.io.connection_points.first_input_connection_type());
		return [type];
	}
}

//
//
// 2 arguments
//
//
export abstract class BaseMathFunctionArg2ActorNode extends BaseMathFunctionActorNode {
	protected override _expectedInputTypes() {
		const type = inputTypeOrFloatExceptBool(this.io.connection_points.first_input_connection_type());
		return [type, type];
	}
}

//
//
// 3 arguments
//
//
export abstract class BaseMathFunctionArg3ActorNode extends BaseMathFunctionActorNode {
	protected override _expectedInputTypes() {
		const type = inputTypeOrFloatExceptBool(this.io.connection_points.first_input_connection_type());
		return [type, type, type];
	}
}
//
//
// 4 arguments
//
//
export abstract class BaseMathFunctionArg4ActorNode extends BaseMathFunctionActorNode {
	protected override _expectedInputTypes() {
		const type = inputTypeOrFloatExceptBool(this.io.connection_points.first_input_connection_type());
		return [type, type, type, type];
	}
}
//
//
// 5 arguments
//
//
export abstract class BaseMathFunctionArg5ActorNode extends BaseMathFunctionActorNode {
	protected override _expectedInputTypes() {
		const type = inputTypeOrFloatExceptBool(this.io.connection_points.first_input_connection_type());
		return [type, type, type, type, type];
	}
}
