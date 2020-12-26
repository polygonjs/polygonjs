/**
 * Imports an object from another geometry OBJ node.
 *
 * @remarks
 * It can still be used to keep a copy of the input geometry, in case downstream nodes were to process it without cloning.
 *
 */
import {TypedSopNode, BaseSopNodeType} from './_Base';
import {NodeContext} from '../../poly/NodeContext';
// import {CoreWalker} from '../../../Core/Walker';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {GeometryContainer} from '../../containers/Geometry';
class ObjectMergeSopParamsConfig extends NodeParamsConfig {
	/** @param which SOP node to import from */
	geometry = ParamConfig.OPERATOR_PATH('', {
		node_selection: {
			context: NodeContext.SOP,
		},
	});
}
const ParamsConfig = new ObjectMergeSopParamsConfig();

export class ObjectMergeSopNode extends TypedSopNode<ObjectMergeSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'objectMerge';
	}

	// _param_apply_parent_transform: boolean
	initialize_node() {}

	async cook(input_containers: CoreGroup[]) {
		const geometry_node = this.p.geometry.found_node();
		if (geometry_node) {
			if (geometry_node.node_context() == NodeContext.SOP) {
				const container = await geometry_node.request_container();
				this.import_input(geometry_node as BaseSopNodeType, container);
			} else {
				this.states.error.set('found node is not a geometry');
			}
		} else {
			this.states.error.set(`node not found at path '${this.pv.geometry}'`);
		}
	}

	import_input(geometry_node: BaseSopNodeType, container: GeometryContainer) {
		let core_group;
		// I unfortunately need to do a clone here,
		// because if 2 objectmerge nodes import the same geometry,
		// they would try to place it under 2 different geo nodes
		// which is not possible
		if ((core_group = container.core_content_cloned()) != null) {
			// cannot do that until i know how to make it recook
			// when the obj changes
			// if (this._param_apply_parent_transform){
			// 	const matrix = geometry_node.parent().object().matrixWorld
			// 	group.children.forEach(child=>{
			// 		console.log(child)
			// 		const geometry = child.geometry
			// 		if(geometry){
			// 			geometry.applyMatrix(matrix)
			// 		}
			// 	})
			// }

			this.set_core_group(core_group);
		} else {
			this.states.error.set('invalid target');
		}
	}

	// geometry_node() {
	// 	if ((this._param_geometry != null) && (this._param_geometry !== '')) {
	// 		CoreWalker.find_node(this, this._param_geometry);
	// 	}
	// }
}
