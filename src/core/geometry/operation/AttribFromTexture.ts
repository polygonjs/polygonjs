import {BufferGeometry} from 'three';
import {BufferAttribute} from 'three';
import {CoreImage} from '../../Image';
import {Texture} from 'three';
import {DataTexture} from 'three';
import {CoreAttribute} from '../../geometry/Attribute';
import {CoreMath} from '../../math/_Module';

interface AttribFromTextureParams {
	geometry: BufferGeometry;
	texture: Texture;
	uvAttribName: string;
	targetAttribName: string;
	targetAttribSize: number;
	add: number;
	mult: number;
}

export class AttribFromTexture {
	// currently assumes we read the red channel and create a 1-dimension (float) attribute
	set_attrib(params: AttribFromTextureParams) {
		const geometry = params.geometry;
		const targetAttribSize = params.targetAttribSize;
		if (targetAttribSize < 1 || targetAttribSize > 4) {
			return;
		}
		const add = params.add;
		const mult = params.mult; // / 255.0;
		const texture_data = this._data_from_texture(params.texture);
		if (!texture_data) {
			return;
		}
		const {data, resx, resy} = texture_data;
		const texture_component_size = data.length / (resx * resy);

		const uv_attrib = geometry.getAttribute(params.uvAttribName);
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
		const clamp = CoreMath.clamp;

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

		const attribName = CoreAttribute.remapName(params.targetAttribName);
		const array = new Float32Array(values);
		geometry.setAttribute(attribName, new BufferAttribute(array, targetAttribSize));
	}

	private _data_from_texture(texture: Texture) {
		if (texture.image) {
			if (texture.image.data) {
				return this._data_from_data_texture(texture as DataTexture);
			}
			return this._data_from_default_texture(texture);
		}
	}
	private _data_from_default_texture(texture: Texture) {
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
	private _data_from_data_texture(texture: DataTexture) {
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
