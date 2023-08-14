import {Constructor} from '../../../../../types/GlobalTypes';
import {BaseNodeType} from '../../../_Base';
import {ParamConfig} from '../../../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../../../core/BooleanValue';
import {NodeContext} from '../../../../poly/NodeContext';
import {RootManagerNode} from '../../Root';

const CallbackOptions = {
	cook: false,
	callback: (node: BaseNodeType) => {
		SceneEnvController.update(node as RootManagerNode);
	},
};

export function SceneEnvParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle on to use an environment map */
		useEnvironment = ParamConfig.BOOLEAN(0, {
			...CallbackOptions,
			separatorBefore: true,
		});
		/** @param environment map */
		environment = ParamConfig.NODE_PATH('', {
			visibleIf: {useEnvironment: 1},
			nodeSelection: {
				context: NodeContext.COP,
			},
			// dependentOnFoundNode: false,
			...CallbackOptions,
		});
	};
}

const CALLBACK_NAME = 'SceneEnvController';
export class SceneEnvController {
	constructor(protected node: RootManagerNode) {}
	addHooks() {
		const p = this.node.p;
		const params = [p.useEnvironment, p.environment];
		for (let param of params) {
			param.addPostDirtyHook(CALLBACK_NAME, this._updateBound);
		}
	}

	private _updateBound = this.update.bind(this);
	async update() {
		const scene = this.node.object;
		const pv = this.node.pv;

		if (isBooleanTrue(pv.useEnvironment)) {
			const node = pv.environment.nodeWithContext(NodeContext.COP);
			if (node) {
				node.compute().then((container) => {
					scene.environment = container.texture();
				});
			} else {
				scene.environment = null;
				this.node.states.error.set('environment node not found');
			}
		} else {
			scene.environment = null;
		}
	}

	static async update(node: RootManagerNode) {
		node.sceneEnvController.update();
	}
}
