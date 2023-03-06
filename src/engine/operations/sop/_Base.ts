import {CoreGroup} from '../../../core/geometry/Group';
import {BaseOperation} from '../_Base';
import {NodeContext} from '../../../engine/poly/NodeContext';
import {
	ObjectType,
	ObjectByObjectType,
	objectConstructorByObjectType,
	DEFAULT_MATERIALS,
} from '../../../core/geometry/Constant';
import {CoreGeometryIndexBuilder} from '../../../core/geometry/util/IndexBuilder';
import {BufferGeometry, Material, Object3D} from 'three';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';

export class BaseSopOperation extends BaseOperation<NodeContext.SOP> {
	static override context() {
		return NodeContext.SOP;
	}
	override cook(input_contents: CoreGroup[], params: any): CoreGroup | Promise<CoreGroup> | void {}

	//
	//
	// UTILS
	//
	//
	protected createCoreGroupFromObjects(objects: ObjectContent<CoreObjectType>[]) {
		const coreGroup = new CoreGroup();
		coreGroup.setAllObjects(objects);
		return coreGroup;
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

		const objectConstructor = objectConstructorByObjectType(type) || objectConstructorByObjectType(ObjectType.MESH);
		material = material || DEFAULT_MATERIALS[type];
		const object = new (objectConstructor as any)(geometry, material);
		this.applyObjectDefault(object);

		return object as ObjectByObjectType[OT];
	}
	static applyObjectDefault(object: Object3D) {
		object.castShadow = true;
		object.receiveShadow = true;
		object.frustumCulled = false;
		object.matrixAutoUpdate = false;
	}
	protected createIndexIfNone(geometry: BufferGeometry) {
		BaseSopOperation.createIndexIfNone(geometry);
	}
	static createIndexIfNone(geometry: BufferGeometry) {
		CoreGeometryIndexBuilder.createIndexIfNone(geometry);
	}
}
