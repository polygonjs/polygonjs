/**
 * Imports an object from another geometry OBJ node.
 *
 * @remarks
 * It can still be used to keep a copy of the input geometry, in case downstream nodes were to process it without cloning.
 *
 */
import {TypedSopNode, BaseSopNodeType} from './_Base';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {GeometryContainer} from '../../containers/Geometry';
class ObjectMergeSopParamsConfig extends NodeParamsConfig {
	/** @param which SOP node to import from */
	geometry = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.SOP,
		},
	});
}
const ParamsConfig = new ObjectMergeSopParamsConfig();

export class ObjectMergeSopNode extends TypedSopNode<ObjectMergeSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'objectMerge';
	}

	initializeNode() {
		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				this.params.label.init([this.p.geometry], () => {
					return this.p.geometry.rawInput();
				});
			});
		});
	}

	async cook(input_containers: CoreGroup[]) {
		const geometryNode = this.pv.geometry.nodeWithContext(NodeContext.SOP, this.states.error);
		if (!geometryNode) {
			this.states.error.set(`node not found at path '${this.pv.geometry}'`);
			return;
		}
		const container = await geometryNode.compute();
		this.importInput(geometryNode as BaseSopNodeType, container);
	}

	importInput(geometry_node: BaseSopNodeType, container: GeometryContainer) {
		let core_group;
		// I unfortunately need to do a clone here,
		// because if 2 objectmerge nodes import the same geometry,
		// they would try to place it under 2 different geo nodes
		// which is not possible
		if ((core_group = container.coreContentCloned()) != null) {
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

			this.setCoreGroup(core_group);
		} else {
			this.states.error.set('invalid target');
		}
	}
}
