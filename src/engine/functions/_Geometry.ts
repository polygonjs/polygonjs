import {Box3, Vector3, Object3D, Mesh, BufferAttribute} from 'three';
import {Attribute} from '../../core/geometry/Attribute';
import {isBooleanTrue} from '../../core/Type';
import {ObjectNamedFunction1, ObjectNamedFunction2, ObjectNamedFunction5} from './_Base';
import {_setArrayLength} from './_ArrayUtils';
import {dummyReadRefVal} from './_Param';

const tmpV3 = new Vector3();
const nextV3 = new Vector3();
const STRIDE = 3;

export class getGeometryPositions extends ObjectNamedFunction1<[Vector3[]]> {
	static override type() {
		return 'getGeometryPositions';
	}
	func(object3D: Object3D, target: Vector3[]) {
		const geometry = (object3D as Mesh).geometry;
		if (!geometry) {
			return target;
		}
		const positionAttribute = geometry.getAttribute(Attribute.POSITION) as BufferAttribute | undefined;
		if (!positionAttribute) {
			return target;
		}
		const positionArray = positionAttribute.array as number[];
		const pointsCount = positionArray.length / STRIDE;
		_setArrayLength(target, pointsCount, () => new Vector3());
		for (let i = 0; i < pointsCount; i++) {
			const _v = target[i];
			const i3 = i * STRIDE;
			_v.x = positionArray[i3];
			_v.y = positionArray[i3 + 1];
			_v.z = positionArray[i3 + 2];
		}
		return target;
	}
}
export class getGeometryBoundingBox extends ObjectNamedFunction2<[boolean, Box3]> {
	static override type() {
		return 'getGeometryBoundingBox';
	}
	func(object3D: Object3D, forceCompute: boolean, target: Box3) {
		// we don't yet know when a bounding box is updated,
		// so we depend on time for now
		dummyReadRefVal(this.timeController.timeUniform().value);
		//
		const geometry = (object3D as Mesh).geometry;
		if (!geometry) {
			return target;
		}
		if (!geometry.boundingBox || forceCompute) {
			geometry.computeBoundingBox();
		}
		if (!geometry.boundingBox) {
			return target;
		}
		target.copy(geometry.boundingBox);
		return target;
	}
}
export class setGeometryPositions extends ObjectNamedFunction5<[Vector3[], number, boolean, boolean, boolean]> {
	static override type() {
		return 'setGeometryPositions';
	}
	func(
		object3D: Object3D,
		values: Vector3[],
		lerp: number,
		attributeNeedsUpdate: boolean,
		computeNormals: boolean,
		computeTangents: boolean
	): void {
		const geometry = (object3D as Mesh).geometry;
		if (!geometry) {
			return;
		}
		if (!values) {
			return;
		}
		const positionAttribute = geometry.getAttribute(Attribute.POSITION) as BufferAttribute | undefined;
		if (!positionAttribute) {
			return;
		}
		const doLerp = lerp < 1;
		const positionArray = positionAttribute.array as number[];

		const geoPointsCount = positionArray.length / STRIDE;
		const valuesCount = values.length;
		const minCount = Math.min(geoPointsCount, valuesCount);
		if (doLerp) {
			for (let i = 0; i < minCount; i++) {
				const value = values[i];
				const j = i * STRIDE;

				nextV3.copy(value);
				tmpV3.fromArray(positionArray, j);
				tmpV3.lerp(nextV3, lerp);
				tmpV3.toArray(positionArray, j);
			}
		} else {
			for (let i = 0; i < minCount; i++) {
				const value = values[i];
				const j = i * STRIDE;
				value.toArray(positionArray, j);
			}
		}

		if (isBooleanTrue(attributeNeedsUpdate)) {
			positionAttribute.needsUpdate = true;
		}
		if (isBooleanTrue(computeTangents)) {
			geometry.computeVertexNormals();
		}
		const normalAttribute = geometry.getAttribute(Attribute.NORMAL);
		const uvAttribute = geometry.getAttribute(Attribute.UV);
		const index = geometry.getIndex();
		if (
			positionAttribute != null &&
			uvAttribute != null &&
			normalAttribute != null &&
			index != null &&
			isBooleanTrue(computeNormals)
		) {
			geometry.computeTangents();
		}
	}
}
