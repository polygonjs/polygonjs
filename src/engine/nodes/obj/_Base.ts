import {Object3D} from 'three/src/core/Object3D';

import {TypedNode, BaseNodeType} from '../_Base';
// import {BaseSopNode} from '../sop/_Base';
// import {LookAt} from './Concerns/LookAt';
import {ObjectContainer} from 'src/engine/containers/Object';
import {NodeContext} from 'src/engine/poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TypedContainerController} from '../utils/ContainerController';
import {ObjectsManagerNode} from '../manager/ObjectsManager';
import {Group} from 'three/src/objects/Group';

const INPUT_OBJECT_NAME = 'parent object';
const DEFAULT_INPUT_NAMES = [INPUT_OBJECT_NAME, INPUT_OBJECT_NAME, INPUT_OBJECT_NAME, INPUT_OBJECT_NAME];

interface Object3DWithNode extends Object3D {
	node: BaseNodeType;
}
// interface BaseObjNodeVisitor extends BaseNodeVisitor {
// 	visit_node_obj: (node: BaseObjNodeType) => any;
// }

export enum ObjNodeRenderOrder {
	MANAGER = 0,
	FOG = 1,
	CAMERA = 2,
	LIGHT = 3,
	EVENT = 4,
	MAT = 5,
}

export class TypedObjNode<O extends Object3D, K extends NodeParamsConfig> extends TypedNode<
	'OBJECT',
	BaseObjNodeType,
	K
> {
	container_controller: TypedContainerController<ObjectContainer> = new TypedContainerController<ObjectContainer>(
		this,
		ObjectContainer
	);
	public readonly render_order: number = ObjNodeRenderOrder.MANAGER;
	public readonly add_to_hierarchy: boolean = true;
	static node_context(): NodeContext {
		return NodeContext.OBJ;
	}
	static displayed_input_names(): string[] {
		return DEFAULT_INPUT_NAMES;
	}

	protected _children_group = new Group();
	protected _object!: O;
	// _sop_loaded: boolean = false;

	// protected _look_at_controller: LookAtController | undefined;
	// get look_at_controller(): LookAtController {
	// 	return (this._look_at_controller = this._look_at_controller || new LookAtController(this));
	// }
	// protected _transform_controller: TransformController | undefined;
	// get transform_controller(): TransformController {
	// 	return (this._transform_controller = this._transform_controller || new TransformController(this));
	// }

	protected _used_in_scene: boolean = false;
	get used_in_scene() {
		return this._used_in_scene;
	}
	set_used_in_scene(state: boolean) {
		this._used_in_scene = state;
		if (!this.scene.loading_controller.is_loading) {
			const root = this.parent as ObjectsManagerNode;
			if (root) {
				root.update_object(this);
			}
		}
	}

	initialize_base_node() {
		// this.container_controller.init(ObjectContainer);
		this._object = this._create_object_with_attributes();
		// this._init_container_owner('Object');
		// this.flags.add_display();
		this.name_controller.add_post_set_full_path_hook(this.set_object_name.bind(this));

		// this.io.inputs.add_hook(() => {
		// 	this.transform_controller.on_input_updated();
		// });
		// this._init_bypass_flag({
		// 	has_bypass_flag: false,
		// });

		// this._sop_loaded = false; // TODO: typescript, this should be moved to GeoObjNode
	}

	// this.add_param 'toggle', 'display', 1,
	// 	callback: this.post_state_display_flag.bind(this)

	// cook: ->
	// 	super
	// 	console.error(this.constructor, 'cook method is not overloaded')

	// post_set_dirty: (original_trigger_graph_node, direct_trigger_graph_node)->
	// 	#console.log("#{this.full_path()} set dirty by #{original_trigger_graph_node?.full_path()} and #{direct_trigger_graph_node?.full_path()}")
	// 	this.is_displayed (is_displayed)=>
	// 		if is_displayed
	// 			this.parent().update_object(this)

	//post_remove_dirty_state: ->
	//console.log("obj #{this.full_path()} remove dirty")
	//console.log("remove_dirty_state: #{this.full_path()}")

	// set_object: (object)->

	// 	if object?
	// 		object.name = this.name()
	// 		this.set_container(object)
	get object() {
		return this._object; //= this._object || this._create_object_with_attributes()
	}
	get children_group() {
		return this._children_group;
	}

	_create_object_with_attributes(): O {
		const object = this.create_object();
		if (object != null) {
			object.name = this.full_path();
			(object as Object3DWithNode).node = this;
		}
		this._children_group.name = 'parented_outputs';
		object.add(this._children_group);
		return object as O;
	}
	private set_object_name() {
		if (this.object) {
			this.object.name = this.full_path();
		}
	}
	// private set_group_name() {
	// 	// ensures the material has a full path set
	// 	// allowing the render hook to be set
	// 	//this.set_material(@_material)
	// 	const group = this.group;
	// 	if (group) {
	// 		group.name = this.full_path();
	// 	}
	// }

	create_object(): Object3D {
		return new Object3D();
	}

	// request_display_node() {}

	is_display_node_cooking(): boolean {
		return false;
	}

	// post_state_display_flag() {
	// 	const object = this.object;
	// 	if (object != null) {
	// 		const displayed = this.is_displayed();
	// 		if (displayed) {
	// 			object.visible = displayed;

	// 			if (!this._sop_loaded) {
	// 				this.request_display_node();
	// 			}
	// 		}
	// 	}
	// }

	is_displayed(): boolean {
		return this.flags?.display?.active || false;
		// if (callback == null) {
		// 	throw 'no callback given to is_displayed';
		// }

		// const display_flag_state = this.display_flag_state();
		// return callback(display_flag_state);
	}
	// if !display_flag_state
	// 	callback(false)

	// else
	// 	this.param('display').eval (val)->
	// 		callback(val)

	// accepts_visitor<T extends NodeVisitor>(visitor: T): ReturnType<T['visit_node_obj']> {
	// 	return visitor.visit_node_obj(this);
	// }

	// replaces Dirtyable (TODO: try and replace this method name)
	// protected _init_dirtyable_hook() {
	// this.add_post_dirty_hook(this._cook_main_without_inputs_later.bind(this));
	// }
	// private _cook_main_without_inputs_later() {
	// 	const c = () => {
	// 		this.cook_controller.cook_main_without_inputs();
	// 	};
	// 	setTimeout(c, 0);
	// 	// this.eval_all_params().then( ()=>{ this.cook() } )
	// }
}

export type BaseObjNodeType = TypedObjNode<Object3D, any>;
export class BaseObjNodeClass extends TypedObjNode<Object3D, any> {}
