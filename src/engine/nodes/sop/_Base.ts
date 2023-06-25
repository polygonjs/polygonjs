import {Object3D} from 'three';
import {Material} from 'three';
import {BufferGeometry} from 'three';
import {TypedNode} from '../_Base';
import {ObjectByObjectType} from '../../../core/geometry/Constant';
import {CoreGroup} from '../../../core/geometry/Group';
import {ObjectType} from '../../../core/geometry/Constant';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {FlagsControllerDBO} from '../utils/FlagsController';
import {BaseSopOperation} from '../../operations/sop/_Base';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';

// enum MESSAGE {
// 	FROM_SET_CORE_GROUP = 'from set_core_group',
// 	FROM_SET_GROUP = 'from set_group',
// 	FROM_SET_OBJECTS = 'from set_objects',
// 	FROM_SET_OBJECT = 'from set_object',
// 	FROM_SET_GEOMETRIES = 'from set_geometries',
// 	FROM_SET_GEOMETRY = 'from set_geometry',
// }

const INPUT_GEOMETRY_NAME = 'input geometry';
const DEFAULT_INPUT_NAMES = [INPUT_GEOMETRY_NAME, INPUT_GEOMETRY_NAME, INPUT_GEOMETRY_NAME, INPUT_GEOMETRY_NAME];

// class ParamLessNetworkSopParamsConfig extends NodeParamsConfig {}
// export class BaseNetworkSopNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.SOP, K> {
// 	static node_context(): NodeContext {
// 		return NodeContext.SOP;
// 	}
// 	// initializeBaseNode() {
// 	// 	this.children_controller?.init({dependent: false});
// 	// }
// 	cook() {
// 		this.cookController.end_cook();
// 	}
// }
// export class ParamLessBaseNetworkSopNode extends BaseNetworkSopNode<ParamLessNetworkSopParamsConfig> {}

/**
 *
 *
 * BaseSopNode is the base class for all nodes that process geometries. This inherits from [TypedNode](/docs/api/TypedNode).
 *
 */
export class TypedSopNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.SOP, K> {
	static override context(): NodeContext {
		return NodeContext.SOP;
	}
	public override readonly flags: FlagsControllerDBO = new FlagsControllerDBO(this);
	override dataType(): string {
		return CoreObjectType.THREEJS;
	}
	static override displayedInputNames(): string[] {
		return DEFAULT_INPUT_NAMES;
	}

	override initializeBaseNode() {
		this.flags.display.set(false);
		this.flags.display.onUpdate(() => {
			if (this.flags.display.active()) {
				const parent = this.parent();
				if (parent && parent.displayNodeController) {
					parent.displayNodeController.setDisplayNode(this);
				}
			}
		});
		this.io.outputs.setHasOneOutput();
	}
	//
	// ALL OBJECTS
	//

	//
	// THREEJS OBJECTS
	//
	setCoreGroup(coreGroup: CoreGroup) {
		this._setContainer(coreGroup /*, MESSAGE.FROM_SET_CORE_GROUP*/);
	}

	setObject(object: ObjectContent<CoreObjectType>) {
		this._setContainerObjects([object] /*, MESSAGE.FROM_SET_OBJECT*/);
	}
	setObjects(objects: ObjectContent<CoreObjectType>[]) {
		this._setContainerObjects(objects /*, MESSAGE.FROM_SET_OBJECTS*/);
	}

	setGeometry(geometry: BufferGeometry, type: ObjectType = ObjectType.MESH) {
		const object = this.createObject(geometry, type);
		this._setContainerObjects([object] /*, MESSAGE.FROM_SET_GEOMETRY*/);
	}

	setGeometries(geometries: BufferGeometry[], type: ObjectType = ObjectType.MESH) {
		const objects: Object3D[] = [];
		let object;
		for (let geometry of geometries) {
			object = this.createObject(geometry, type);
			objects.push(object);
		}
		this._setContainerObjects(objects /*, MESSAGE.FROM_SET_GEOMETRIES*/);
	}
	// protected _setContainerAllObjects(objects: Object3D[] /*, message: MESSAGE*/) {
	// 	const coreGroup = this.containerController.container().coreContent() || new CoreGroup();
	// 	coreGroup.setAllObjects(objects);
	// 	this._setContainer(coreGroup);
	// }
	protected _setContainerObjects(objects: ObjectContent<CoreObjectType>[] /*, message: MESSAGE*/) {
		const coreGroup = this.containerController.container().coreContent() || new CoreGroup();
		coreGroup.setAllObjects(objects);
		this._setContainer(coreGroup);
	}

	static createObject<OT extends ObjectType>(
		geometry: BufferGeometry,
		type: OT,
		material?: Material
	): ObjectByObjectType[OT] {
		return BaseSopOperation.createObject(geometry, type, material);
	}

	createObject<OT extends ObjectType>(
		geometry: BufferGeometry,
		type: OT,
		material?: Material
	): ObjectByObjectType[OT] {
		return TypedSopNode.createObject(geometry, type, material);
	}

	static createIndexIfNone(geometry: BufferGeometry) {
		BaseSopOperation.createIndexIfNone(geometry);
	}
	protected _createIndexIfNone(geometry: BufferGeometry) {
		TypedSopNode.createIndexIfNone(geometry);
	}

	// public traverseObjectOnSopGroupAddBound = this.traverseObjectOnSopGroupAdd.bind(this);
	public updateObjectOnAdd(object: ObjectContent<CoreObjectType>, parent: ObjectContent<CoreObjectType>) {}
}

export type BaseSopNodeType = TypedSopNode<NodeParamsConfig>;
export class BaseSopNodeClass extends TypedSopNode<NodeParamsConfig> {}
