import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPointType, ReturnValueTypeByActorConnectionPointType} from '../utils/io/connections/Actor';
import {Ray} from 'three';
import {Box3} from 'three';

class BaseRayBox3ActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new BaseRayBox3ActorParamsConfig();
export abstract class BaseRayBox3ActorNode<
	T extends ActorConnectionPointType
> extends TypedActorNode<BaseRayBox3ActorParamsConfig> {
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
	protected abstract _processRay(ray: Ray, box3: Box3): ReturnValueTypeByActorConnectionPointType[T];
	protected _expectedInputName(index: number) {
		return this._expectedInputType()[index];
	}
	protected _expectedInputType() {
		return [ActorConnectionPointType.RAY, ActorConnectionPointType.BOX3];
	}

	public override outputValue(context: ActorNodeTriggerContext) {
		const ray = this._inputValue<ActorConnectionPointType.RAY>(ActorConnectionPointType.RAY, context);
		if (!ray) {
			return false;
		}
		const box3 = this._inputValue<ActorConnectionPointType.BOX3>(ActorConnectionPointType.BOX3, context);
		if (!box3) {
			return false;
		}
		return this._processRay(ray, box3);
	}
}
