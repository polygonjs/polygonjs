import {Constructor} from '../../../../../types/GlobalTypes';
import {BaseNodeType, TypedNode} from '../../../_Base';
import {NodeParamsConfig, ParamConfig} from '../../../utils/params/ParamsConfig';
import {Scene} from 'three/src/scenes/Scene';
import {isBooleanTrue} from '../../../../../core/BooleanValue';

const CallbackOptions = {
	computeOnDirty: false,
	callback: (node: BaseNodeType) => {
		SceneAutoUpdateController.update(node as SceneAutoUpdateNode);
	},
};

export function SceneAutoUpdateParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param autoUpdate */
		autoUpdate = ParamConfig.BOOLEAN(1, CallbackOptions);
	};
}
class SceneAutoUpdateParamsConfig extends SceneAutoUpdateParamConfig(NodeParamsConfig) {}
abstract class SceneAutoUpdateNode extends TypedNode<any, SceneAutoUpdateParamsConfig> {
	readonly SceneAutoUpdateController = new SceneAutoUpdateController(this);
	protected _object = new Scene();
	get object() {
		return this._object;
	}
}

export class SceneAutoUpdateController {
	constructor(protected node: SceneAutoUpdateNode) {}

	async update() {
		const scene = this.node.object;
		const pv = this.node.pv;

		if (isBooleanTrue(pv.autoUpdate) != scene.autoUpdate) {
			scene.autoUpdate = isBooleanTrue(pv.autoUpdate);
		}
	}

	static async update(node: SceneAutoUpdateNode) {
		node.SceneAutoUpdateController.update();
	}
}
