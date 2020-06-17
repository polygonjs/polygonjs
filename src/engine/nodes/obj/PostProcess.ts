import {BaseManagerObjNode} from './_BaseManager';
import {NodeContext} from '../../poly/NodeContext';
import {PostNodeChildrenMap} from '../../poly/registers/nodes/Post';
import {BasePostProcessNodeType} from '../post/_Base';
import {DisplayNodeController} from '../utils/DisplayNodeController';
import {EffectsComposerController} from '../post/utils/EffectsComposerController';
import {ParamInitValueSerialized} from '../../params/types/ParamInitValueSerialized';
export class PostProcessObjNode extends BaseManagerObjNode {
	static type() {
		return 'post_process';
	}
	readonly effects_composer_controller: EffectsComposerController = new EffectsComposerController(this);

	public readonly display_node_controller: DisplayNodeController = new DisplayNodeController(
		this,
		this.effects_composer_controller.display_node_controller_callbacks()
	);

	protected _children_controller_context = NodeContext.POST;

	create_node<K extends keyof PostNodeChildrenMap>(
		type: K,
		params_init_value_overrides?: Dictionary<ParamInitValueSerialized>
	): PostNodeChildrenMap[K] {
		return super.create_node(type, params_init_value_overrides) as PostNodeChildrenMap[K];
	}
	children() {
		return super.children() as BasePostProcessNodeType[];
	}
	nodes_by_type<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as PostNodeChildrenMap[K][];
	}
}
