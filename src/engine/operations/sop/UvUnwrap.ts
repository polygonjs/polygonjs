import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {DefaultOperationParams} from '../_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {Mesh} from 'three/src/objects/Mesh';
import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {Potpack, PotPackBox, PotPackBoxResult} from '../../../core/libs/Potpack';

interface UvUnwrapSopParams extends DefaultOperationParams {
	uv: string;
}

export class UvUnwrapSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: UvUnwrapSopParams = {
		uv: 'uv',
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<SopType.UV_UNWRAP> {
		return SopType.UV_UNWRAP;
	}

	cook(input_contents: CoreGroup[], params: UvUnwrapSopParams) {
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
		const boxes: PotPackBox[] = [];
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
		console.log('polyCount', polyCount);
		for (let i = 0; i < polyCount; i++) {
			boxes.push({w: 1, h: 1});
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
