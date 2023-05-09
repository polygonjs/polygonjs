import {Vector3, Object3D, Mesh, BufferAttribute} from 'three';
import {Attribute} from '../../core/geometry/Attribute';
import {isBooleanTrue} from '../../core/Type';
import {ObjectNamedFunction5} from './_Base';

const tmpV3 = new Vector3();
const nextV3 = new Vector3();
const STRIDE = 3;
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
