import {DataTexture, Texture, BufferAttribute} from 'three';
import {CoreImage} from '../../Image';
import {CoreAttribute} from '../../geometry/Attribute';
import {clamp} from '../../math/_Module';
import {CoreObjectType, ObjectContent} from '../ObjectContent';
import {corePointClassFactory} from '../CoreObjectFactory';

interface AttribFromTextureParams<T extends CoreObjectType> {
	object: ObjectContent<T>;
	texture: Texture;
	uvAttribName: string;
	targetAttribName: string;
	targetAttribSize: number;
	add: number;
	mult: number;
}

export class AttribFromTexture {
	// currently assumes we read the red channel and create a 1-dimension (float) attribute
	setAttribute<T extends CoreObjectType>(params: AttribFromTextureParams<T>) {
		const {object, texture, uvAttribName, targetAttribName, targetAttribSize, add, mult} = params;
		const corePointClass = corePointClassFactory(object);
		if (targetAttribSize < 1 || targetAttribSize > 4) {
			return;
		}
		const texture_data = this._dataFromTexture(texture);
		if (!texture_data) {
			return;
		}
		const {data, resx, resy} = texture_data;
		const texture_component_size = data.length / (resx * resy);

		const uv_attrib = corePointClass.attribute(object, uvAttribName);
		if (!uv_attrib) {
			return;
		}
		const uvs = uv_attrib.array;

		const points_count = uvs.length / 2;
		const values: number[] = new Array(points_count * targetAttribSize);

		let uv_stride: number,
			uvx: number,
			uvy: number,
			x: number,
			y: number,
			i: number,
			j: number,
			val: number,
			c: number;

		for (i = 0; i < points_count; i++) {
			uv_stride = i * 2;
			uvx = clamp(uvs[uv_stride], 0, 1);
			uvy = clamp(uvs[uv_stride + 1], 0, 1);
			x = Math.floor((resx - 1) * uvx);
			y = Math.floor((resy - 1) * (1 - uvy));
			j = y * resx + x;

			for (c = 0; c < targetAttribSize; c++) {
				val = data[texture_component_size * j + c];

				// index = i * targetAttribSize;
				values[i * targetAttribSize + c] = mult * val + add;
			}
		}

		const attribName = CoreAttribute.remapName(targetAttribName);
		const array = new Float32Array(values);
		corePointClass.addAttribute(object, attribName, new BufferAttribute(array, targetAttribSize));
	}

	private _dataFromTexture(texture: Texture) {
		if (texture.image) {
			if (texture.image.data) {
				return this._dataFromDataTexture(texture as DataTexture);
			}
			return this._dataFromDefaultTexture(texture);
		}
	}
	private _dataFromDefaultTexture(texture: Texture) {
		const resx = texture.image.width;
		const resy = texture.image.height;
		const image_data = CoreImage.data_from_image(texture.image);
		const data = image_data.data;
		return {
			data,
			resx,
			resy,
		};
	}
	private _dataFromDataTexture(texture: DataTexture) {
		const data = texture.image.data;
		const resx = texture.image.width;
		const resy = texture.image.height;
		return {
			data,
			resx,
			resy,
		};
	}
}
