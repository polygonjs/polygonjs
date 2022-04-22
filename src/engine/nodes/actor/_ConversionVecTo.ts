import {Number2} from '../../../types/GlobalTypes';
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {ParamType} from '../../poly/ParamType';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {Vector4} from 'three';

class VecToParamsActorConfig extends NodeParamsConfig {}
const ParamsConfig = new VecToParamsActorConfig();
export class BaseVecToActorNode extends TypedActorNode<VecToParamsActorConfig> {
	override paramsConfig = ParamsConfig;
}

type Vector2Component = 'x' | 'y';
type Vector3Component = Vector2Component | 'z';
type Vector4Component = Vector3Component | 'w';

interface VecToGlOptions {
	components: string[];
	param_type: ParamType;
}

export function VecToActorFactory(type: string, options: VecToGlOptions): typeof BaseVecToActorNode {
	const components = options.components;
	const param_type = options.param_type;
	return class VecToActorNode extends BaseVecToActorNode {
		static override type() {
			return type;
		}
		private _inputVecName() {
			return `vec${components.length}`;
		}

		override initializeNode() {
			this.io.outputs.setNamedOutputConnectionPoints(
				components.map((c) => {
					return new ActorConnectionPoint(c, ActorConnectionPointType.FLOAT);
				})
			);
		}
		override createParams() {
			this.addParam(param_type, this._inputVecName(), components.map((c) => 0) as Number2);
		}

		private _defaultVector4 = new Vector4();
		public override outputValue(
			context: ActorNodeTriggerContext,
			outputName: Vector4Component = 'x'
		): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
			const vec4 =
				this._inputValue<ActorConnectionPointType.VECTOR4>(this._inputVecName(), context) ||
				this._defaultVector4;
			return vec4[outputName] as number;
		}
	};
}
