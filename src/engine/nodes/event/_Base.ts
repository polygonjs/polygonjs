import {TypedNode} from '../_Base';
import {EventContainer} from '../../containers/Event';
import {NodeContext} from '../../poly/NodeContext';
import {TypedContainerController} from '../utils/ContainerController';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {BaseCameraObjNodeType} from '../obj/_BaseCamera';

export class TypedEventNode<K extends NodeParamsConfig> extends TypedNode<'EVENT', BaseEventNodeType, K> {
	container_controller: TypedContainerController<EventContainer> = new TypedContainerController<EventContainer>(
		this,
		EventContainer
	);
	static node_context(): NodeContext {
		return NodeContext.EVENT;
	}

	private _eval_all_params_on_dirty_bound = this._eval_all_params_on_dirty.bind(this);
	initialize_base_node() {
		// this._init_display_flag({
		// 	has_display_flag: false
		// });
		this.io.connections.init_inputs();
		this.ui_data.set_layout_horizontal();
		this.add_post_dirty_hook('_eval_all_params_on_dirty', this._eval_all_params_on_dirty_bound);
	}
	node_sibbling(name: string): BaseEventNodeType | null {
		return super.node_sibbling(name) as BaseEventNodeType | null;
	}

	// ensures that event nodes are cooked when scene is loaded
	_eval_all_params_on_dirty() {
		this.params.eval_all();
	}
	process_event(event: Event, canvas: HTMLCanvasElement, camera_node: BaseCameraObjNodeType) {}
}

export type BaseEventNodeType = TypedEventNode<any>;
export class BaseEventNodeClass extends TypedEventNode<any> {}
