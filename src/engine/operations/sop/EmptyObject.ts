import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Group, LineSegments, Mesh, Object3D, Points} from 'three';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CoreConstant, ObjectType} from '../../../core/geometry/Constant';

interface EmptyObjectSopParams extends DefaultOperationParams {
	type: ObjectType;
}

export class EmptyObjectSopOperation extends BaseSopOperation {
	static override type(): Readonly<'emptyObject'> {
		return 'emptyObject';
	}
	override cook(inputCoreGroups: CoreGroup[], params: EmptyObjectSopParams) {
		const object = this._createObjectFromType(params);
		const objects: Object3D[] = [];
		if (object) {
			const material = CoreConstant.MATERIALS[params.type];
			if (material) {
				(object as Mesh).material = material.clone();
			}
			BaseSopOperation.applyObjectDefault(object);
			objects.push(object);
		}
		return this.createCoreGroupFromObjects(objects);
	}
	private _createObjectFromType(params: EmptyObjectSopParams) {
		switch (params.type) {
			case ObjectType.GROUP: {
				return new Group();
			}
			case ObjectType.LINE_SEGMENTS: {
				return new LineSegments();
			}
			case ObjectType.MESH: {
				return new Mesh();
			}
			case ObjectType.OBJECT3D: {
				return new Object3D();
			}
			case ObjectType.POINTS: {
				return new Points();
			}
		}
	}
}
