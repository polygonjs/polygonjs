import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {BufferAttribute, Mesh} from 'three';
import {Potpack, PotPackBox, PotPackBoxResult} from '../../../core/libs/Potpack';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface UvLayoutSopParams extends DefaultOperationParams {
	res: number;
	padding: number;
	uv: string;
	uv2: string;
}

export class UvLayoutSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: UvLayoutSopParams = {
		res: 1024,
		padding: 3,
		uv: 'uv',
		uv2: 'uv2',
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<SopType.UV_LAYOUT> {
		return SopType.UV_LAYOUT;
	}

	override cook(input_contents: CoreGroup[], params: UvLayoutSopParams) {
		const coreGroup = input_contents[0];
		const objects = coreGroup.threejsObjectsWithGeo();
		const meshes: Mesh[] = [];
		for (let object of objects) {
			const mesh = object as Mesh;
			if (mesh.isMesh) {
				meshes.push(mesh);
			}
		}
		this._layoutUVs(meshes, params);

		return input_contents[0];
	}

	private _layoutUVs(meshes: Mesh[], params: UvLayoutSopParams) {
		const uv_boxes: PotPackBox[] = [];
		const objIndexByBox: WeakMap<PotPackBox, number> = new WeakMap();
		const padding = params.padding / params.res;

		let index = 0;
		for (let mesh of meshes) {
			if (!mesh.geometry.hasAttribute(params.uv)) {
				this.states?.error.set(`attribute ${params.uv} not found`);
			}

			// Prepare UV boxes for potpack
			// TODO: Size these by object surface area
			const box = {w: 1 + padding * 2, h: 1 + padding * 2};
			uv_boxes.push(box);
			objIndexByBox.set(box, index);

			index++;
		}

		// Pack the objects' lightmap UVs into the same global space
		const dimensions = Potpack(uv_boxes);
		for (let uv_box of uv_boxes) {
			const uvBoxResult = uv_box as PotPackBoxResult;
			const index = objIndexByBox.get(uv_box);
			if (index != null) {
				const mesh = meshes[index] as Mesh;
				const uv2 = (mesh.geometry.getAttribute(params.uv) as BufferAttribute).clone();
				const array = uv2.array as number[];
				for (let i = 0; i < uv2.array.length; i += uv2.itemSize) {
					array[i] = (uv2.array[i] + uvBoxResult.x + padding) / dimensions.w;
					array[i + 1] = (uv2.array[i + 1] + uvBoxResult.y + padding) / dimensions.h;
				}

				mesh.geometry.setAttribute(params.uv2, uv2);
				mesh.geometry.getAttribute(params.uv2).needsUpdate = true;
			}
		}
	}
}
