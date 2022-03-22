import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {Mesh} from 'three/src/objects/Mesh';
import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {Potpack, PotPackBox, PotPackBoxResult} from '../../../core/libs/Potpack';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {Vector3} from 'three/src/math/Vector3';
import {Line3} from 'three/src/math/Line3';

interface UvUnwrapSopParams extends DefaultOperationParams {
	uv: string;
}
const v1 = new Vector3();
const v2 = new Vector3();
const v3 = new Vector3();
const vMid = new Vector3();
const vEnd = new Vector3();
const line = new Line3();
export class UvUnwrapSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: UvUnwrapSopParams = {
		uv: 'uv',
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<SopType.UV_UNWRAP> {
		return SopType.UV_UNWRAP;
	}

	override cook(input_contents: CoreGroup[], params: UvUnwrapSopParams) {
		const coreGroup = input_contents[0];
		const objects = coreGroup.objectsWithGeo();
		for (let object of objects) {
			const mesh = object as Mesh;
			if (mesh.isMesh) {
				this._unwrapUVs(mesh, params);
			}
		}

		return input_contents[0];
	}

	// TODO: at the moment each polygon will fix a single box
	// when ideally this should find when 2 triangles form a quad or square
	// and could then fit in the box
	private _unwrapUVs(mesh: Mesh, params: UvUnwrapSopParams) {
		const geometry = mesh.geometry;
		const indexArray = geometry.getIndex()?.array;
		if (!indexArray) {
			return;
		}
		const positionArray = geometry.attributes.position?.array;
		if (!positionArray) {
			return;
		}
		const uvArray = geometry.attributes[params.uv]?.array;
		if (!uvArray) {
			return;
		}
		const polyCount = indexArray.length / 3;
		const boxes: PotPackBox[] = new Array(polyCount);
		for (let i = 0; i < polyCount; i++) {
			// this take one edge (v1-v2) of the polygon and calculate its length (w)
			// then we measure the distance between the mid point of that edge (vMid)
			// and its projection again an edge parallel to the first edge (v1-v2), but going through v3.
			v1.fromArray(positionArray, 3 * indexArray[3 * i + 0]);
			v2.fromArray(positionArray, 3 * indexArray[3 * i + 1]);
			v3.fromArray(positionArray, 3 * indexArray[3 * i + 2]);
			let w = v1.distanceTo(v2);
			vMid.copy(v1).add(v2).multiplyScalar(0.5);
			line.start.copy(v3);
			line.end.copy(v3).add(v2).sub(v1);
			line.closestPointToPoint(vMid, false, vEnd);
			let h = vMid.distanceTo(vEnd);

			// we try and get some order to that by
			// always having h and sorted
			if (h < w) {
				const tmp = h;
				h = w;
				w = tmp;
			}

			boxes[i] = {w, h};
		}

		const result = Potpack(boxes);
		const newUvValues = new Array(uvArray.length);
		// function setnewValue(index: number, newValue: number) {
		// 	// if (newUvValues[index] == null) {
		// 	newUvValues[index] = newValue;
		// 	// } else {
		// 	// 	if (newUvValues[index] <= newValue) {
		// 	// 		newUvValues[index] = newValue;
		// 	// 	} else {
		// 	// 		console.log(`${index} already has ${newUvValues[index]}, cannot be set to ${newValue}`);
		// 	// 	}
		// 	// }
		// }
		for (let i = 0; i < polyCount; i++) {
			const box = boxes[i] as PotPackBoxResult;
			const x = box.x / result.w;
			const y = box.y / result.h;
			const w = box.w / result.w;
			const h = box.h / result.h;
			const index0 = 2 * indexArray[i * 3 + 0];
			const index1 = 2 * indexArray[i * 3 + 1];
			const index2 = 2 * indexArray[i * 3 + 2];

			newUvValues[index0] = x;
			newUvValues[index0 + 1] = y;
			newUvValues[index1] = x + w;
			newUvValues[index1 + 1] = y;
			newUvValues[index2] = x;
			newUvValues[index2 + 1] = y + h;
		}
		geometry.setAttribute(params.uv, new Float32BufferAttribute(newUvValues, 2));
	}
}
