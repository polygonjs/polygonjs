import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Vector3, BufferAttribute} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {stringToAttribNames} from '../../../core/String';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DefaultOperationParams} from '../../../core/operations/_Base';
interface AttribNormalizeSopParams extends DefaultOperationParams {
	mode: number;
	name: string;
	changeName: boolean;
	newName: string;
}

export enum NormalizeMode {
	MIN_MAX_TO_01 = 'min/max to 0/1',
	VECTOR_TO_LENGTH_1 = 'vectors to length 1',
}
export const NORMALIZE_MODES: NormalizeMode[] = [NormalizeMode.MIN_MAX_TO_01, NormalizeMode.VECTOR_TO_LENGTH_1];
const _attribNames:string[]=[]
export class AttribNormalizeSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AttribNormalizeSopParams = {
		mode: 0,
		name: 'position',
		changeName: false,
		newName: '',
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'attribNormalize'> {
		return 'attribNormalize';
	}

	override cook(input_contents: CoreGroup[], params: AttribNormalizeSopParams) {
		const core_group = input_contents[0];
		const objects = input_contents[0].threejsObjectsWithGeo();
		stringToAttribNames(params.name,_attribNames);
		for (const object of objects) {
			const geometry = object.geometry;
			for (const attribName of _attribNames) {
				const srcAttrib = geometry.getAttribute(attribName) as BufferAttribute;
				if (srcAttrib) {
					let destAttrib: BufferAttribute | undefined = srcAttrib;
					if (isBooleanTrue(params.changeName) && params.newName != '') {
						destAttrib = geometry.getAttribute(params.newName) as BufferAttribute;
						if (destAttrib) {
							destAttrib.needsUpdate = true;
						}

						destAttrib = destAttrib || srcAttrib.clone();
					}
					this._normalize_attribute(srcAttrib, destAttrib, params);
				}
			}
		}
		return core_group;
	}
	private _normalize_attribute(
		src_attrib: BufferAttribute,
		dest_attrib: BufferAttribute,
		params: AttribNormalizeSopParams
	) {
		const mode = NORMALIZE_MODES[params.mode];
		switch (mode) {
			case NormalizeMode.MIN_MAX_TO_01:
				return this._normalize_from_min_max_to_01(src_attrib, dest_attrib);
			case NormalizeMode.VECTOR_TO_LENGTH_1:
				return this._normalize_vectors(src_attrib, dest_attrib);
		}
	}

	private min3: Vector3 = new Vector3();
	private max3: Vector3 = new Vector3();
	private _normalize_from_min_max_to_01(src_attrib: BufferAttribute, dest_attrib: BufferAttribute) {
		const attrib_size = src_attrib.itemSize;
		const src_array = src_attrib.array;
		const dest_array = dest_attrib.array;
		// const values = points.map((point) => point.attribValue(params.name));
		switch (attrib_size) {
			case 1: {
				const minf = Math.min(...src_array);
				const maxf = Math.max(...src_array);
				for (let i = 0; i < dest_array.length; i++) {
					dest_array[i] = (src_array[i] - minf) / (maxf - minf);
				}
				return;
			}

			case 3: {
				const points_count = src_array.length / attrib_size;
				const xs = new Array(points_count);
				const ys = new Array(points_count);
				const zs = new Array(points_count);
				let j = 0;
				for (let i = 0; i < points_count; i++) {
					j = i * attrib_size;
					xs[i] = src_array[j + 0];
					ys[i] = src_array[j + 1];
					zs[i] = src_array[j + 2];
				}
				this.min3.set(Math.min(...xs), Math.min(...ys), Math.min(...zs));
				this.max3.set(Math.max(...xs), Math.max(...ys), Math.max(...zs));
				for (let i = 0; i < points_count; i++) {
					j = i * attrib_size;
					dest_array[j + 0] = (xs[i] - this.min3.x) / (this.max3.x - this.min3.x);
					dest_array[j + 1] = (ys[i] - this.min3.y) / (this.max3.y - this.min3.y);
					dest_array[j + 2] = (zs[i] - this.min3.z) / (this.max3.z - this.min3.z);
				}
				return;
			}
		}
	}

	private _vec: Vector3 = new Vector3();
	private _normalize_vectors(src_attrib: BufferAttribute, dest_attrib: BufferAttribute) {
		const src_array = src_attrib.array;
		const dest_array = dest_attrib.array;

		const elements_count = src_array.length;
		if (src_attrib.itemSize == 3) {
			for (let i = 0; i < elements_count; i += 3) {
				this._vec.fromArray(src_array, i);
				this._vec.normalize();
				this._vec.toArray(dest_array, i);
			}
		}
	}
}
