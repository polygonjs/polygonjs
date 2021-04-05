import {Constructor} from '../../../../../types/GlobalTypes';
import {BaseNodeType, TypedNode} from '../../../_Base';
import {NodeParamsConfig, ParamConfig} from '../../../utils/params/ParamsConfig';
import {Scene} from 'three/src/scenes/Scene';
import {isBooleanTrue} from '../../../../../core/BooleanValue';
import {NodeContext} from '../../../../poly/NodeContext';

const CallbackOptions = {
	computeOnDirty: false,
	callback: (node: BaseNodeType) => {
		SceneMaterialOverrideController.update(node as SceneMaterialOverrideNode);
	},
};

export function SceneMaterialOverrideParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle on to override all materials */
		useOverrideMaterial = ParamConfig.BOOLEAN(0, CallbackOptions);
		/** @param material */
		overrideMaterial = ParamConfig.NODE_PATH('', {
			visibleIf: {useOverrideMaterial: 1},
			nodeSelection: {
				context: NodeContext.MAT,
			},
			dependentOnFoundNode: false,
			...CallbackOptions,
		});
	};
}
class SceneMaterialOverrideParamsConfig extends SceneMaterialOverrideParamConfig(NodeParamsConfig) {}
abstract class SceneMaterialOverrideNode extends TypedNode<any, SceneMaterialOverrideParamsConfig> {
	readonly SceneMaterialOverrideController = new SceneMaterialOverrideController(this);
	protected _object = new Scene();
	get object() {
		return this._object;
	}
}

export class SceneMaterialOverrideController {
	constructor(protected node: SceneMaterialOverrideNode) {}

	async update() {
		const scene = this.node.object;
		const pv = this.node.pv;

		if (isBooleanTrue(pv.useOverrideMaterial)) {
			const node = pv.overrideMaterial.nodeWithContext(NodeContext.MAT);
			if (node) {
				node.compute().then((container) => {
					scene.overrideMaterial = container.material();
				});
			} else {
				this.node.states.error.set('bgTexture node not found');
			}
		} else {
			scene.overrideMaterial = null;
		}
	}

	static async update(node: SceneMaterialOverrideNode) {
		node.SceneMaterialOverrideController.update();
	}
}
