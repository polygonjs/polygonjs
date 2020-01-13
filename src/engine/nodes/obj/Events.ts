import {BaseManagerObjNode} from './_BaseManager';
import {NodeContext} from 'src/engine/poly/NodeContext';
import {PolyScene} from 'src/engine/scene/PolyScene';

export class EventsObjNode extends BaseManagerObjNode {
	static type() {
		return 'events';
	}
	// children_context() {
	// 	return NodeContext.EVENT;
	// }

	constructor(scene: PolyScene) {
		super(scene, 'EventsObjNode');
		this.children_controller.init(NodeContext.EVENT);
		// this._init_manager();
	}
}
