import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPointType, ReturnValueTypeByActorConnectionPointType} from '../utils/io/connections/Actor';
import {Ray} from 'three';
import {Plane} from 'three';

interface RayProcessData {
	ray?: Ray;
	plane?: Plane;
}

class BaseRayPlaneActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new BaseRayPlaneActorParamsConfig();
export abstract class BaseRayPlaneActorNode<
	T extends ActorConnectionPointType
> extends TypedActorNode<BaseRayPlaneActorParamsConfig> {
	override paramsConfig = ParamsConfig;

	override initializeNode() {
		super.initializeNode();

		this.io.connection_points.initializeNode();
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
		this.io.connection_points.set_expected_input_types_function(this._expectedInputType.bind(this));
		this.io.connection_points.set_expected_output_types_function(() => [this._expectedOutputType()]);
	}
	protected abstract _expectedOutputName(index: number): string;
	protected abstract _expectedOutputType(): T;
	protected _processData: RayProcessData = {};
	protected abstract _processRayData(): ReturnValueTypeByActorConnectionPointType[T];
	protected _expectedInputName(index: number) {
		return this._expectedInputType()[index];
	}
	protected _expectedInputType() {
		return [ActorConnectionPointType.RAY, ActorConnectionPointType.PLANE];
	}

	public override outputValue(context: ActorNodeTriggerContext) {
		this._processData.ray = this._inputValue<ActorConnectionPointType.RAY>(ActorConnectionPointType.RAY, context);
		this._processData.plane = this._inputValue<ActorConnectionPointType.PLANE>(
			ActorConnectionPointType.PLANE,
			context
		);
		return this._processRayData();
	}
}
