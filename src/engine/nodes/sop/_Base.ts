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
import {BaseSopOperation} from '../../../core/operations/sop/_Base';

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

export class TypedSopNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.SOP, K> {
	static nodeContext(): NodeContext {
		return NodeContext.SOP;
	}
	public readonly flags: FlagsControllerDBO = new FlagsControllerDBO(this);

	static displayedInputNames(): string[] {
		return DEFAULT_INPUT_NAMES;
	}

	initializeBaseNode() {
		this.flags.display.set(false);
		this.flags.display.add_hook(() => {
			if (this.flags.display.active()) {
				const parent = this.parent();
				if (parent && parent.display_node_controller) {
					parent.display_node_controller.set_display_node(this);
				}
			}
		});
		this.io.outputs.set_has_one_output();
	}

	setCoreGroup(core_group: CoreGroup) {
		// const objects = core_group.objects();
		// for (let object of objects) {
		// 	this._set_object_attributes(object);
		// }
		this.setContainer(core_group, MESSAGE.FROM_SET_CORE_GROUP);
	}

	setObject(object: Object3D) {
		// this._set_object_attributes(object);
		this.set_container_objects([object], MESSAGE.FROM_SET_OBJECT);
	}
	setObjects(objects: Object3D[]) {
		// for (let object of objects) {
		// 	this._set_object_attributes(object);
		// }
		this.set_container_objects(objects, MESSAGE.FROM_SET_OBJECTS);
	}

	setGeometry(geometry: BufferGeometry, type: ObjectType = ObjectType.MESH) {
		const object = this.create_object(geometry, type);
		this.set_container_objects([object], MESSAGE.FROM_SET_GEOMETRY);
	}

	setGeometries(geometries: BufferGeometry[], type: ObjectType = ObjectType.MESH) {
		const objects: Object3D[] = [];
		let object;
		for (let geometry of geometries) {
			object = this.create_object(geometry, type);
			// this._set_object_attributes(object);
			objects.push(object);
		}
		this.set_container_objects(objects, MESSAGE.FROM_SET_GEOMETRIES);
	}

	set_container_objects(objects: Object3D[], message: MESSAGE) {
		const core_group = this.container_controller.container.coreContent() || new CoreGroup();
		core_group.setObjects(objects);
		core_group.touch();
		this.setContainer(core_group);
	}

	static create_object<OT extends ObjectType>(
		geometry: BufferGeometry,
		type: OT,
		material?: Material
	): ObjectByObjectType[OT] {
		return BaseSopOperation.create_object(geometry, type, material);
	}

	create_object<OT extends ObjectType>(
		geometry: BufferGeometry,
		type: OT,
		material?: Material
	): ObjectByObjectType[OT] {
		return TypedSopNode.create_object(geometry, type, material);
	}

	static create_index_if_none(geometry: BufferGeometry) {
		BaseSopOperation.create_index_if_none(geometry);
	}
	protected _create_index_if_none(geometry: BufferGeometry) {
		TypedSopNode.create_index_if_none(geometry);
	}

	// protected _set_object_attributes(object: Object3D) {
	// 	const material: Material = (object as Mesh).material as Material;
	// 	if (material) {
	// 		if (!this.scene) {
	// 			console.log('no scene');
	// 			throw 'no scene';
	// 		}
	// 		// const material_node = CoreMaterial.node(this.scene, material) as BaseMatNodeType;
	// 		// if (material_node) {
	// 		// 	material_node.add_render_hook(object);
	// 		// }
	// 	}
	// }

	protected _add_index(geometry: BufferGeometry) {
		const position_attrib = geometry.getAttribute('position');
		const position_array = position_attrib.array;
		const points_count = position_array.length / 3;
		const indices: number[] = new Array(points_count);
		for (let i = 0; i < points_count; i++) {
			indices[i] = i;
		}

		geometry.setIndex(indices);
	}
}

export type BaseSopNodeType = TypedSopNode<NodeParamsConfig>;
export class BaseSopNodeClass extends TypedSopNode<NodeParamsConfig> {}
