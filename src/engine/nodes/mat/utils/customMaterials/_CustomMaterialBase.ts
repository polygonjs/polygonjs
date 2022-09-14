import {AssemblerControllerNode} from '../../../gl/code/Controller';
import {BaseNodeType} from '../../../_Base';

function customMaterialBaseSetRecompileRequired(node: AssemblerControllerNode) {
	node.assemblerController()?.setCompilationRequired();
}
export const CUSTOM_MAT_PARAM_OPTIONS = {
	callback: (node: BaseNodeType) => customMaterialBaseSetRecompileRequired(node as AssemblerControllerNode),
};
