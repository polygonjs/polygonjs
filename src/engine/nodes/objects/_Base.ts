import {Object3D} from 'three/src/core/Object3D';

import {BaseNode} from '../_Base';
import {BaseNodeSop} from '../Sop/_Base';
import {LookAt} from './Concerns/LookAt';
import {Named} from './Concerns/Named';

import {NodeContext} from 'src/Engine/Poly';

const INPUT_OBJECT_NAME = 'parent object';
const DEFAULT_INPUT_NAMES = [INPUT_OBJECT_NAME, INPUT_OBJECT_NAME, INPUT_OBJECT_NAME, INPUT_OBJECT_NAME];

export class BaseObjectNode extends LookAt(Named(BaseNode)) {
	static node_context(): NodeContext {
		return NodeContext.OBJ;
	}
	static displayed_input_names(): string[] {
		return DEFAULT_INPUT_NAMES;
	}

	_object: Object3D;
	_sop_loaded: boolean = false;

	constructor() {
		super();
		this._object = this._create_object_with_attributes();
		this._init_container_owner('Object');

		this._init_bypass_flag({
			has_bypass_flag: false,
		});

		this._init_look_at();

		this._sop_loaded = false;
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
	object() {
		return this._object; //= this._object || this._create_object_with_attributes()
	}
	group() {
		return this.object();
	}

	_create_object_with_attributes() {
		const object = this.create_object();
		if (object != null) {
			object.name = this.name();
			object.node = this;
		}
		return object;
	}

	create_object() {}
	//

	create_node(type: string): BaseNodeSop {
		return super.create_node(type);
	}

	request_display_node() {}
	//

	is_display_node_cooking(): boolean {
		return false;
	}

	post_state_display_flag() {
		const object = this.object();
		if (object != null) {
			this.is_displayed((is_displayed) => {
				object.visible = is_displayed;

				if (is_displayed && !this._sop_loaded) {
					this.request_display_node();
				}
			});
		}
	}
	is_displayed_p() {
		return this.display_flag_state();
		// return new Promise((resolve, reject)=>{
		// 	this.is_displayed(resolve)
		// })
	}

	is_displayed(callback) {
		if (callback == null) {
			throw 'no callback given to is_displayed';
		}

		const display_flag_state = this.display_flag_state();
		return callback(display_flag_state);
	}
	// if !display_flag_state
	// 	callback(false)

	// else
	// 	this.param('display').eval (val)->
	// 		callback(val)

	visit(visitor) {
		return visitor.node_obj(this);
	}
}
