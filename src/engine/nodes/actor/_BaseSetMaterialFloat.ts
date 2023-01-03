import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Mesh} from 'three';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {ParamType} from '../../poly/ParamType';
import {Material} from 'three';
import {CoreType} from '../../../core/Type';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

// https://stackoverflow.com/questions/46583883/typescript-pick-properties-with-a-defined-type
type KeysOfType<T, U, B = false> = {
	[P in keyof T]: B extends true
		? T[P] extends U
			? U extends T[P]
				? P
				: never
			: never
		: T[P] extends U
		? P
		: never;
}[keyof T];

type PickByType<T, U, B = false> = Pick<T, KeysOfType<T, U, B>>;

class BaseSetMaterialFloatActorParamsConfig extends NodeParamsConfig {
	/** @param float */
	float = ParamConfig.FLOAT(1);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
}
const ParamsConfig = new BaseSetMaterialFloatActorParamsConfig();

export abstract class BaseSetMaterialFloatActorNode extends TypedActorNode<BaseSetMaterialFloatActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				ActorConnectionPointType.MATERIAL,
				ActorConnectionPointType.MATERIAL,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
		]);
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const material =
			this._inputValue<ActorConnectionPointType.MATERIAL>(ActorConnectionPointType.MATERIAL, context) ||
			(context.Object3D as Mesh).material;

		if (material) {
			const float = this._inputValueFromParam<ParamType.FLOAT>(this.p.float, context);
			const lerp = this._inputValueFromParam<ParamType.FLOAT>(this.p.lerp, context);

			if (CoreType.isArray(material)) {
				for (let mat of material) {
					this._updateMaterial(mat, float, lerp);
				}
			} else {
				this._updateMaterial(material, float, lerp);
			}

			this.runTrigger(context);
		}
	}
	protected abstract _getMaterialColorPropertyName(): keyof PickByType<Material, number>;
	private _updateMaterial(material: Material, targetValue: number, lerp: number) {
		const propertyName = this._getMaterialColorPropertyName();

		if (lerp >= 1) {
			material[propertyName] = targetValue;
		} else {
			const currentValue: number = material[propertyName];
			if (!CoreType.isNumber(currentValue)) {
				return;
			}
			material[propertyName] = targetValue * lerp + (1 - lerp) * currentValue;
		}
	}
}
