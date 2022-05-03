import {Constructor} from '../../../../../types/GlobalTypes';
import {BaseNodeType} from '../../../_Base';
import {ParamConfig} from '../../../utils/params/ParamsConfig';
import {RootManagerNode} from '../../Root';
import {PolyScene} from '../../../../index_all';
import {SetUtils} from '../../../../../core/SetUtils';

export interface OnProgressArguments {
	scene: PolyScene;
	triggerNode?: BaseNodeType;
	cookedNodes: BaseNodeType[];
	remainingNodes: BaseNodeType[];
}
export type OnProgressUpdateCallback = (progressRatio: number, args: OnProgressArguments) => void;

export function RootLoadProgressParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		// audio
		/** @param when the scene loads, nodes that match the mask will update the progress bar as they cook */
		nodesMask = ParamConfig.STRING('*/OUT* */image* */envMap*', {
			cook: false,
			separatorBefore: true,
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
		const nodePaths = nodes.map((node) => node.path()).sort();
		console.log(nodePaths);
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
	async watchNodesProgress(callback: OnProgressUpdateCallback) {
		const nodes = await this.resolvedNodes();
		const nodesCount = nodes.length;
		if (nodesCount == 0) {
			callback(1, {scene: this.node.scene(), triggerNode: undefined, cookedNodes: [], remainingNodes: []});
		}
		const remainingNodes = SetUtils.fromArray(nodes);
		const cookedNodes = new Set<BaseNodeType>();
		const callbackName = 'RootLoadProgressController';
		for (let node of nodes) {
			// we force nodes to compute
			// in case they do not have a display flag on, or are not connected
			// as it would get the loading stuck
			node.compute();
			node.cookController.registerOnCookEnd(callbackName, () => {
				if (!cookedNodes.has(node)) {
					cookedNodes.add(node);
					remainingNodes.delete(node);

					const nodesCookProgress = cookedNodes.size / nodesCount;
					callback(nodesCookProgress, {
						scene: this.node.scene(),
						triggerNode: node,
						cookedNodes: SetUtils.toArray(cookedNodes),
						remainingNodes: SetUtils.toArray(remainingNodes),
					});

					node.cookController.deregisterOnCookEnd(callbackName);
				}
			});
		}
	}
}
