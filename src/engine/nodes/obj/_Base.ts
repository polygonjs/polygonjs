import {Object3D} from 'three/src/core/Object3D';
import {TypedNode, BaseNodeType} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {Group} from 'three/src/objects/Group';
import {ChildrenDisplayController} from './utils/ChildrenDisplayController';
import {TransformController} from './utils/TransformController';
import {HierarchyController} from './utils/HierarchyController';

const INPUT_OBJECT_NAME = 'parent object';
const DEFAULT_INPUT_NAMES = [INPUT_OBJECT_NAME, INPUT_OBJECT_NAME, INPUT_OBJECT_NAME, INPUT_OBJECT_NAME];

interface Object3DWithNode extends Object3D {
	node: BaseNodeType;
}

export enum ObjNodeRenderOrder {
	MANAGER = 0,
	CAMERA = 2,
	LIGHT = 3,
}

export class TypedObjNode<O extends Object3D, K extends NodeParamsConfig> extends TypedNode<NodeContext.OBJ, K> {
	static nodeContext(): NodeContext {
		return NodeContext.OBJ;
	}
	static displayed_input_names(): string[] {
		return DEFAULT_INPUT_NAMES;
	}
	public readonly render_order: number = ObjNodeRenderOrder.MANAGER;
	readonly transform_controller: TransformController | undefined;
	readonly hierarchy_controller: HierarchyController | undefined;

	protected _children_group = this._create_children_group();
	protected _object!: O;

	private _create_children_group() {
		const group = new Group();
		group.matrixAutoUpdate = false;
		return group;
	}

	protected _attachable_to_hierarchy: boolean = true;
	get attachable_to_hierarchy() {
		return this._attachable_to_hierarchy;
	}
	protected _used_in_scene: boolean = true;
	get used_in_scene() {
		return this._used_in_scene;
	}
	// TODO call set_used_in_scene(false) when node is deleted
	// set_used_in_scene(state: boolean) {
	// 	this._used_in_scene = state;
	// 	if (!this.scene.loading_controller.isLoading()) {
	// 		const root = this.parent as ObjectsManagerNode;
	// 		if (root) {
	// 			root.update_object(this);
	// 		}
	// 	}
	// }
	add_object_to_parent(parent: Object3D) {
		if (this.attachable_to_hierarchy) {
			parent.add(this.object);
		}
	}
	remove_object_from_parent() {
		if (this.attachable_to_hierarchy) {
			const parent = this.object.parent;
			if (parent) {
				parent.remove(this.object);
			}
		}
	}

	public readonly children_display_controller: ChildrenDisplayController | undefined;

	initialize_base_node() {
		this._object = this._create_object_with_attributes();
		this.nameController.add_post_set_fullPath_hook(this.set_object_name.bind(this));
		this.set_object_name();
	}

	get children_group() {
		return this._children_group;
	}
	get object() {
		return this._object;
	}

	_create_object_with_attributes(): O {
		const object = this.create_object();
		(object as Object3DWithNode).node = this;
		object.add(this._children_group);
		return object as O;
	}
	protected set_object_name() {
		if (this._object) {
			this._object.name = this.fullPath();
			this._children_group.name = `${this.fullPath()}:parented_outputs`;
		}
	}

	create_object(): Object3D {
		const object = new Object3D();
		object.matrixAutoUpdate = false;
		return object;
	}

	is_display_node_cooking(): boolean {
		if (this.display_node_controller) {
			if (this.display_node_controller.display_node) {
				return this.display_node_controller.display_node.cookController.is_cooking;
			}
		}
		return false;
	}

	is_displayed(): boolean {
		return this.flags?.display?.active() || false;
	}
}

export type BaseObjNodeType = TypedObjNode<Object3D, any>;
export class BaseObjNodeClass extends TypedObjNode<Object3D, any> {}
