import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPointType, ReturnValueTypeByActorConnectionPointType} from '../utils/io/connections/Actor';
import {Ray, Sphere} from 'three';

interface RayProcessData {
	ray?: Ray;
	sphere?: Sphere;
}

class BaseRaySphereActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new BaseRaySphereActorParamsConfig();
export abstract class BaseRaySphereActorNode<
	T extends ActorConnectionPointType
> extends TypedActorNode<BaseRaySphereActorParamsConfig> {
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
		return [ActorConnectionPointType.RAY, ActorConnectionPointType.SPHERE];
	}

	public override outputValue(context: ActorNodeTriggerContext) {
		this._processData.ray = this._inputValue<ActorConnectionPointType.RAY>(ActorConnectionPointType.RAY, context);
		this._processData.sphere = this._inputValue<ActorConnectionPointType.SPHERE>(
			ActorConnectionPointType.SPHERE,
			context
		);
		return this._processRayData();
	}
}
