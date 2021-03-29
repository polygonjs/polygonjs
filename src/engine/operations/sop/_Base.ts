import {CoreGroup} from '../../../core/geometry/Group';
import {BaseOperation} from '../_Base';
import {NodeContext} from '../../../engine/poly/NodeContext';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {
	ObjectType,
	ObjectByObjectType,
	OBJECT_CONSTRUCTOR_BY_OBJECT_TYPE,
	CoreConstant,
} from '../../../core/geometry/Constant';
import {CoreGeometryIndexBuilder} from '../../../core/geometry/util/IndexBuilder';
import {Material} from 'three/src/materials/Material';
import {Mesh} from 'three/src/objects/Mesh';
import {Object3D} from 'three/src/core/Object3D';
export class BaseSopOperation extends BaseOperation {
	static context() {
		return NodeContext.SOP;
	}
	cook(input_contents: CoreGroup[], params: any): CoreGroup | Promise<CoreGroup> | void {}

	//
	//
	// UTILS
	//
	//
	protected createCoreGroupFromObjects(objects: Object3D[]) {
		const core_group = new CoreGroup();
		core_group.setObjects(objects);
		return core_group;
	}
	protected createCoreGroupFromGeometry(geometry: BufferGeometry, type: ObjectType = ObjectType.MESH) {
		const object = BaseSopOperation.createObject(geometry, type);
		return this.createCoreGroupFromObjects([object]);
	}
	protected createObject<OT extends ObjectType>(
		geometry: BufferGeometry,
		type: OT,
		material?: Material
	): ObjectByObjectType[OT] {
		return BaseSopOperation.createObject(geometry, type, material);
	}
	static createObject<OT extends ObjectType>(
		geometry: BufferGeometry,
		type: OT,
		material?: Material
	): ObjectByObjectType[OT] {
		// ensure it has an index
		this.createIndexIfNone(geometry);

		const object_constructor = OBJECT_CONSTRUCTOR_BY_OBJECT_TYPE[type] as any; //THREE[type];
		material = material || CoreConstant.MATERIALS[type].clone();
		const object: Mesh = new object_constructor(geometry, material);
		object.castShadow = true;
		object.receiveShadow = true;
		object.frustumCulled = false;
		object.matrixAutoUpdate = false;

		return object as ObjectByObjectType[OT];
	}
	protected createIndexIfNone(geometry: BufferGeometry) {
		BaseSopOperation.createIndexIfNone(geometry);
	}
	static createIndexIfNone(geometry: BufferGeometry) {
		CoreGeometryIndexBuilder.createIndexIfNone(geometry);
	}
}
