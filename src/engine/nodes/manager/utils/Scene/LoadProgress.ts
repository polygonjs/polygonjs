import {Constructor} from '../../../../../types/GlobalTypes';
import {BaseNodeType} from '../../../_Base';
import {ParamConfig} from '../../../utils/params/ParamsConfig';
import {RootManagerNode} from '../../Root';

export function RootLoadProgressParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		// audio
		/** @param when the scene loads, nodes that match the mask will update the progress bar as they cook */
		nodesMask = ParamConfig.STRING('*/file* */image* */envMap*', {
			cook: false,
		});
		/** @param prints which nodes match the mask in the console */
		printNodes = ParamConfig.BUTTON(null, {
			cook: false,
			callback: (node: BaseNodeType) => {
				RootLoadProgressController.PARAM_CALLBACK_printResolve(node as RootManagerNode);
			},
		});
	};
}

export class RootLoadProgressController {
	constructor(protected node: RootManagerNode) {}

	static async PARAM_CALLBACK_printResolve(node: RootManagerNode) {
		const nodes = await node.loadProgress.resolvedNodes();
		console.log(nodes);
	}
	async resolvedNodes() {
		const param = this.node.p.nodesMask;
		if (param.isDirty()) {
			await param.compute();
		}
		const mask = param.value;
		const nodes = this.node.scene().nodesController.nodesFromMask(mask || '');
		return nodes;
	}
}
