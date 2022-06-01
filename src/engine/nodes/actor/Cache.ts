/**
 * caches the input until it is made invalid
 *
 *
 *
 */
import {PolyDictionary} from '../../../types/GlobalTypes';
import {ActorConnectionPointType, ReturnValueTypeByActorConnectionPointType} from '../utils/io/connections/Actor';
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

enum CacheActorNodeInputName {
	RESET = 'reset',
	IN = 'input',
}
const DefaultValues: PolyDictionary<number> = {
	[CacheActorNodeInputName.RESET]: 0,
	[CacheActorNodeInputName.IN]: 0,
};

class CacheActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new CacheActorParamsConfig();

export class CacheActorNode extends TypedActorNode<CacheActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'cache';
	}
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
	}

	protected _expectedInputTypes() {
		const secondType = this.io.connection_points.input_connection_type(1) || ActorConnectionPointType.FLOAT;
		return [ActorConnectionPointType.TRIGGER, secondType];
	}
	protected _expectedInputName(index: number) {
		return [CacheActorNodeInputName.RESET, CacheActorNodeInputName.IN][index];
	}
	protected _expectedOutputTypes() {
		return [this._expectedInputTypes()[1]];
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		this._cache = undefined;
	}

	private _cache: ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined;
	public override outputValue(
		context: ActorNodeTriggerContext
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		if (this._cache == null) {
			const input = this._inputValue<ActorConnectionPointType>(CacheActorNodeInputName.IN, context);
			this._cache = input;
		}
		return this._cache;
	}
}
