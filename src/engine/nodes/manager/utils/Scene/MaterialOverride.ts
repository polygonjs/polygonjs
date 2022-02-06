import {Constructor} from '../../../../../types/GlobalTypes';
import {BaseNodeType} from '../../../_Base';
import {ParamConfig} from '../../../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../../../core/BooleanValue';
import {NodeContext} from '../../../../poly/NodeContext';
import {RootManagerNode} from '../../Root';

const CallbackOptions = {
	computeOnDirty: false,
	callback: (node: BaseNodeType) => {
		SceneMaterialOverrideController.update(node as RootManagerNode);
	},
};

export function SceneMaterialOverrideParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle on to override all materials */
		useOverrideMaterial = ParamConfig.BOOLEAN(0, {
			...CallbackOptions,
			separatorBefore: true,
		});
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
// class SceneMaterialOverrideParamsConfig extends SceneMaterialOverrideParamConfig(NodeParamsConfig) {}
// abstract class SceneMaterialOverrideNode extends TypedNode<any, SceneMaterialOverrideParamsConfig> {
// 	readonly sceneMaterialOverrideController = new SceneMaterialOverrideController(this);
// 	protected _object = new Scene();
// 	get object() {
// 		return this._object;
// 	}
// }

export class SceneMaterialOverrideController {
	constructor(protected node: RootManagerNode) {}

	async update() {
		const scene = this.node.object;
		const pv = this.node.pv;

		if (isBooleanTrue(pv.useOverrideMaterial)) {
			const node = pv.overrideMaterial.nodeWithContext(NodeContext.MAT);
			if (node) {
				const container = await node.compute();
				scene.overrideMaterial = container.material();
			} else {
				scene.overrideMaterial = null;
				this.node.states.error.set('overrideMaterial node not found');
			}
		} else {
			scene.overrideMaterial = null;
		}
	}

	static async update(node: RootManagerNode) {
		node.sceneMaterialOverrideController.update();
	}
}
