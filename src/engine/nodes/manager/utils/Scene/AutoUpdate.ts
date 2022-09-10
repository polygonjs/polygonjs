import {Constructor} from '../../../../../types/GlobalTypes';
import {BaseNodeType} from '../../../_Base';
import {ParamConfig} from '../../../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../../../core/BooleanValue';
import {RootManagerNode} from '../../Root';
import {Scene} from 'three';

const CallbackOptions = {
	computeOnDirty: false,
	callback: (node: BaseNodeType) => {
		SceneAutoUpdateController.update(node as RootManagerNode);
	},
};

export interface SceneWithAutoUpdateRenamed extends Scene {
	matrixWorldAutoUpdate: boolean;
}

export function SceneAutoUpdateParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param autoUpdate */
		autoUpdate = ParamConfig.BOOLEAN(1, {
			...CallbackOptions,
			separatorBefore: true,
		});
	};
}
// class SceneAutoUpdateParamsConfig extends SceneAutoUpdateParamConfig(NodeParamsConfig) {}
// abstract class SceneAutoUpdateNode extends TypedNode<any, SceneAutoUpdateParamsConfig> {
// 	readonly sceneAutoUpdateController = new SceneAutoUpdateController(this);
// 	protected _object = new Scene();
// 	get object() {
// 		return this._object;
// 	}
// }

export class SceneAutoUpdateController {
	constructor(protected node: RootManagerNode) {}

	async update() {
		const scene = this.node.object;
		const pv = this.node.pv;

		if (isBooleanTrue(pv.autoUpdate) != (scene as SceneWithAutoUpdateRenamed).matrixWorldAutoUpdate) {
			(scene as SceneWithAutoUpdateRenamed).matrixWorldAutoUpdate = isBooleanTrue(pv.autoUpdate);
		}
	}

	static async update(node: RootManagerNode) {
		node.sceneAutoUpdateController.update();
	}
}
