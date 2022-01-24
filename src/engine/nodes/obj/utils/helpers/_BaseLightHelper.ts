import {Constructor} from '../../../../../types/GlobalTypes';
import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
import {NodeParamsConfig, ParamConfig} from '../../../utils/params/ParamsConfig';
import {TypedObjNode} from '../../_Base';
import {Group} from 'three/src/objects/Group';
import {Light} from 'three/src/lights/Light';
import {Object3D} from 'three/src/core/Object3D';
import {FlagsControllerD} from '../../../utils/FlagsController';
export function BaseLightHelperParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		showHelper = ParamConfig.BOOLEAN(0);
	};
}
class BaseLightHelperParamsConfig extends BaseLightHelperParamConfig(NodeParamsConfig) {}
export abstract class BaseLightHelperObjNode<L extends Light> extends TypedObjNode<Group, BaseLightHelperParamsConfig> {
	public override readonly flags: FlagsControllerD = new FlagsControllerD(this);

	// public readonly helper: BaseLightHelper<L> | undefined;
	abstract get light(): L;
}

export abstract class BaseLightHelper<O extends Object3D, L extends Light, N extends BaseLightHelperObjNode<L>> {
	protected _object: O = this.createObject();
	protected _material = new MeshBasicMaterial({wireframe: true, fog: false});
	constructor(protected node: N, private _name: string) {}

	build() {
		this._object.matrixAutoUpdate = false;
		this._object.name = this._name;
		this.buildHelper();
	}

	protected abstract createObject(): O;
	protected abstract buildHelper(): void;
	get object() {
		return this._object;
	}

	abstract update(): void;
}
