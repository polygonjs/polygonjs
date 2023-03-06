import {Object3DWithGeometry} from './../../../../src/core/geometry/Group';
import {ObjectType} from './../../../core/geometry/Constant';
import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {BufferAttribute, Vector3} from 'three';
import {ConvexGeometry} from '../../../modules/three/examples/jsm/geometries/ConvexGeometry';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface ConvexHullSopParams extends DefaultOperationParams {}

export class ConvexHullSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: ConvexHullSopParams = {};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'convexHull'> {
		return 'convexHull';
	}
	override cook(inputCoreGroups: CoreGroup[], params: ConvexHullSopParams) {
		const inputCoreGroup = inputCoreGroups[0];

		const objects = inputCoreGroup.threejsObjectsWithGeo();
		const newObjects = objects.map((object) => this._createConvexHull(object));

		return this.createCoreGroupFromObjects(newObjects);
	}
	private _createConvexHull(object: Object3DWithGeometry) {
		const srcGeo = object.geometry;
		const positionAttribute = srcGeo.getAttribute('position') as BufferAttribute;
		const vertices: Vector3[] = [];
		for (let i = 0; i < positionAttribute.count; i++) {
			const vertex = new Vector3();
			vertex.fromBufferAttribute(positionAttribute, i);
			vertices.push(vertex);
		}

		const newGeo = new ConvexGeometry(vertices);
		return this.createObject(newGeo, ObjectType.MESH);
	}
}
