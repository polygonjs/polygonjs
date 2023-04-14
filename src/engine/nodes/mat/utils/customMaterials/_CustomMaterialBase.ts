import {AssemblerGlControllerNode} from '../../../gl/code/Controller';
import {BaseNodeType} from '../../../_Base';

function customMaterialBaseSetRecompileRequired(node: AssemblerGlControllerNode) {
	node.assemblerController()?.setCompilationRequired();
}
export const CUSTOM_MAT_PARAM_OPTIONS = {
	callback: (node: BaseNodeType) => customMaterialBaseSetRecompileRequired(node as AssemblerGlControllerNode),
};
