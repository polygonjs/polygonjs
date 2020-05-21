import {Mesh} from 'three/src/objects/Mesh';
import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';

import {NodeParamsConfig, ParamConfig} from '../../../utils/params/ParamsConfig';
import {TypedObjNode} from '../../_Base';
import {Group} from 'three/src/objects/Group';
import {Light} from 'three/src/lights/Light';
import {FlagsControllerD} from '../../../utils/FlagsController';
export function BaseLightHelperParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		show_helper = ParamConfig.BOOLEAN(1);
		helper_size = ParamConfig.FLOAT(1, {visible_if: {show_helper: 1}});
	};
}
class BaseLightHelperParamsConfig extends BaseLightHelperParamConfig(NodeParamsConfig) {}
export abstract class BaseLightHelperObjNode<L extends Light> extends TypedObjNode<Group, BaseLightHelperParamsConfig> {
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);

	// public readonly helper: BaseLightHelper<L> | undefined;
	abstract get light(): L;
}

export abstract class BaseLightHelper<L extends Light, N extends BaseLightHelperObjNode<L>> {
	protected _object = new Mesh();
	protected _material = new MeshBasicMaterial({wireframe: true, fog: false});
	constructor(protected node: N, private _name: string) {}

	build() {
		this._object.matrixAutoUpdate = false;
		this._object.name = this._name;
		this.build_helper();
	}
	protected abstract build_helper(): void;
	get object() {
		return this._object;
	}

	abstract update(): void;
}
