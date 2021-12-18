import {Constructor} from '../../../../../types/GlobalTypes';
import {BaseNodeType} from '../../../_Base';
import {ParamConfig} from '../../../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../../../core/BooleanValue';
import {NodeContext} from '../../../../poly/NodeContext';
import {RootManagerNode} from '../../Root';

const CallbackOptions = {
	computeOnDirty: false,
	callback: (node: BaseNodeType) => {
		SceneEnvController.update(node as RootManagerNode);
	},
};

export function SceneEnvParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle on to use an environment map */
		useEnvironment = ParamConfig.BOOLEAN(0, CallbackOptions);
		/** @param environment map */
		environment = ParamConfig.NODE_PATH('', {
			visibleIf: {useEnvironment: 1},
			nodeSelection: {
				context: NodeContext.COP,
			},
			dependentOnFoundNode: false,
			...CallbackOptions,
		});
	};
}

export class SceneEnvController {
	constructor(protected node: RootManagerNode) {}

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
				this.node.states.error.set('bgTexture node not found');
			}
		} else {
			scene.environment = null;
		}
	}

	static async update(node: RootManagerNode) {
		node.sceneEnvController.update();
	}
}
