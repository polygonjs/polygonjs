import {Object3D} from 'three/src/core/Object3D';
import {Material} from 'three/src/materials/Material';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {TypedNode} from '../_Base';
import {ObjectByObjectType} from '../../../core/geometry/Constant';
import {CoreGroup} from '../../../core/geometry/Group';
import {ObjectType} from '../../../core/geometry/Constant';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {FlagsControllerDBO} from '../utils/FlagsController';
import {BaseSopOperation} from '../../operations/sop/_Base';

enum MESSAGE {
	FROM_SET_CORE_GROUP = 'from set_core_group',
	FROM_SET_GROUP = 'from set_group',
	FROM_SET_OBJECTS = 'from set_objects',
	FROM_SET_OBJECT = 'from set_object',
	FROM_SET_GEOMETRIES = 'from set_geometries',
	FROM_SET_GEOMETRY = 'from set_geometry',
}

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
 * BaseSopNode is the base class for all nodes that process geometries. This inherits from [BaseNode](/docs/api/BaseNode).
 *
 */
export class TypedSopNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.SOP, K> {
	static override context(): NodeContext {
		return NodeContext.SOP;
	}
	public override readonly flags: FlagsControllerDBO = new FlagsControllerDBO(this);

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

	setCoreGroup(core_group: CoreGroup) {
		this._setContainer(core_group, MESSAGE.FROM_SET_CORE_GROUP);
	}

	setObject(object: Object3D) {
		this._setContainerObjects([object], MESSAGE.FROM_SET_OBJECT);
	}
	setObjects(objects: Object3D[]) {
		this._setContainerObjects(objects, MESSAGE.FROM_SET_OBJECTS);
	}

	setGeometry(geometry: BufferGeometry, type: ObjectType = ObjectType.MESH) {
		const object = this.createObject(geometry, type);
		this._setContainerObjects([object], MESSAGE.FROM_SET_GEOMETRY);
	}

	setGeometries(geometries: BufferGeometry[], type: ObjectType = ObjectType.MESH) {
		const objects: Object3D[] = [];
		let object;
		for (let geometry of geometries) {
			object = this.createObject(geometry, type);
			objects.push(object);
		}
		this._setContainerObjects(objects, MESSAGE.FROM_SET_GEOMETRIES);
	}

	private _setContainerObjects(objects: Object3D[], message: MESSAGE) {
		const core_group = this.containerController.container().coreContent() || new CoreGroup();
		core_group.setObjects(objects);
		core_group.touch();
		this._setContainer(core_group);
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
}

export type BaseSopNodeType = TypedSopNode<NodeParamsConfig>;
export class BaseSopNodeClass extends TypedSopNode<NodeParamsConfig> {}
