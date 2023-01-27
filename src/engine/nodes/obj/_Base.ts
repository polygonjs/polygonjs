import {Object3D} from 'three';
import {TypedNode, BaseNodeType} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {Group} from 'three';
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

/**
 *
 * # [API](/docs/api) / TypedObjNode
 *
 * TypedObjNode is the base class for all nodes that process objects and hierarchies. This inherits from [TypedNode](/docs/api/TypedNode).
 *
 */
export class TypedObjNode<O extends Object3D, K extends NodeParamsConfig> extends TypedNode<NodeContext.OBJ, K> {
	static override context(): NodeContext {
		return NodeContext.OBJ;
	}
	static override displayedInputNames(): string[] {
		return DEFAULT_INPUT_NAMES;
	}
	public readonly renderOrder: number = ObjNodeRenderOrder.MANAGER;
	readonly transformController: TransformController | undefined;
	readonly hierarchyController: HierarchyController | undefined;

	protected _children_group = this._create_children_group();
	protected _object!: O;

	private _create_children_group() {
		const group = new Group();
		group.matrixAutoUpdate = false;
		return group;
	}

	protected _attachableToHierarchy: boolean = true;
	attachableToHierarchy() {
		return this._attachableToHierarchy;
	}
	protected _used_in_scene: boolean = true;
	usedInScene() {
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
	addObjectToParent(parent: Object3D) {
		if (this.attachableToHierarchy()) {
			parent.add(this.object);
		}
	}
	removeObjectFromParent() {
		if (this.attachableToHierarchy()) {
			const parent = this.object.parent;
			if (parent) {
				parent.remove(this.object);
			}
		}
	}

	public readonly childrenDisplayController: ChildrenDisplayController | undefined;
	override dispose(): void {
		super.dispose();
		this.childrenDisplayController?.dispose();
	}

	override initializeBaseNode() {
		this._object = this._create_object_with_attributes();
		this.nameController.add_post_set_fullPath_hook(this.set_object_name.bind(this));
		this.set_object_name();
	}

	childrenGroup() {
		return this._children_group;
	}
	get object() {
		return this._object;
	}

	_create_object_with_attributes(): O {
		const object = this.createObject();
		(object as Object3DWithNode).node = this;
		object.add(this._children_group);
		return object as O;
	}
	protected set_object_name() {
		if (this._object) {
			this._object.name = this.path();
			this._children_group.name = `${this.path()}:parentedOutputs`;
		}
	}

	createObject(): Object3D {
		const object = new Object3D();
		object.matrixAutoUpdate = false;
		return object;
	}

	isDisplayNodeCooking(): boolean {
		if (this.flags?.display?.active()) {
			const displayNode = this.displayNodeController?.displayNode();
			if (displayNode) {
				return displayNode.cookController.isCooking();
			}
		}
		return false;
	}

	isDisplayed(): boolean {
		return this.flags?.display?.active() || false;
	}
}

export type BaseObjNodeType = TypedObjNode<Object3D, any>;
export class BaseObjNodeClass extends TypedObjNode<Object3D, any> {}
