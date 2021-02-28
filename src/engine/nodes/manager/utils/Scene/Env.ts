import {Constructor} from '../../../../../types/GlobalTypes';
import {BaseNodeType, TypedNode} from '../../../_Base';
import {NodeParamsConfig, ParamConfig} from '../../../utils/params/ParamsConfig';
import {Scene} from 'three/src/scenes/Scene';
import {isBooleanTrue} from '../../../../../core/BooleanValue';
import {NodeContext} from '../../../../poly/NodeContext';

const CallbackOptions = {
	computeOnDirty: false,
	callback: (node: BaseNodeType) => {
		SceneEnvController.update(node as SceneEnvNode);
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
class SceneEnvParamsConfig extends SceneEnvParamConfig(NodeParamsConfig) {}
abstract class SceneEnvNode extends TypedNode<any, SceneEnvParamsConfig> {
	readonly SceneEnvController = new SceneEnvController(this);
	protected _object = new Scene();
	get object() {
		return this._object;
	}
}

export class SceneEnvController {
	constructor(protected node: SceneEnvNode) {}

	async update() {
		const scene = this.node.object;
		const pv = this.node.pv;

		if (isBooleanTrue(pv.useEnvironment)) {
			const node = pv.environment.nodeWithContext(NodeContext.COP);
			if (node) {
				node.requestContainer().then((container) => {
					scene.environment = container.texture();
				});
			} else {
				this.node.states.error.set('bgTexture node not found');
			}
		} else {
			scene.environment = null;
		}
	}

	static async update(node: SceneEnvNode) {
		node.SceneEnvController.update();
	}
}
