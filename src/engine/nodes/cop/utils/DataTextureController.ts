import {CoreUserAgent} from './../../../../core/UserAgent';
import {Mapping, PixelFormat, WebGLRenderer} from 'three';
import {WebGLRenderTarget} from 'three';
import {DataTexture} from 'three';
import {TypeAssert} from '../../../poly/Assert';
import {Texture} from 'three';
// import {CoreImage} from '../../../../core/Image';

export enum DataTextureControllerBufferType {
	Uint8Array = 'Uint8Array',
	Uint8ClampedArray = 'Uint8ClampedArray',
	Uint16Array = 'Uint16Array',
	Float32Array = 'Float32Array',
}

export class DataTextureController {
	private _dataTexture: DataTexture | undefined;

	private bufferType: DataTextureControllerBufferType;
	constructor(bufferType?: DataTextureControllerBufferType) {
		this.bufferType =
			bufferType ||
			(CoreUserAgent.isiOS()
				? DataTextureControllerBufferType.Uint16Array
				: DataTextureControllerBufferType.Float32Array);
	}

	fromRenderTarget(renderer: WebGLRenderer, renderTarget: WebGLRenderTarget) {
		if (!this._dataTexture || !this._sameDimensions(renderTarget.texture)) {
			this._dataTexture = this._createDataTexture(renderTarget.texture);
		}
		this._copyToDataTexture(renderer, renderTarget);
		return this._dataTexture;
	}
	// fromTexture(texture: Texture): DataTexture {
	// 	const src_data = CoreImage.data_from_image(texture.image);

	// 	if (!this._data_texture || !this._same_dimensions(texture)) {
	// 		this._data_texture = this._create_data_texture(texture);
	// 	}

	// 	const length = src_data.width * src_data.height;
	// 	const src_tex_data = src_data.data;
	// 	const dest_ext_data = this._data_texture.image.data;
	// 	const stride = 4;
	// 	const l4 = length * stride;
	// 	for (let i = 0; i < l4; i++) {
	// 		dest_ext_data[i] = src_tex_data[i];
	// 		// dest_ext_data[i + 1] = src_tex_data[i + 1];
	// 		// dest_ext_data[i + 2] = src_tex_data[i + 2];
	// 		// dest_ext_data[i + 3] = src_tex_data[i + 3];
	// 	}
	// 	return this._data_texture;
	// }

	// dataTexture() {
	// 	return this._dataTexture;
	// }

	reset() {
		this._dataTexture = undefined;
	}

	private _copyToDataTexture(renderer: WebGLRenderer, renderTarget: WebGLRenderTarget) {
		const image = renderTarget.texture.image;
		this._dataTexture = this._dataTexture || this._createDataTexture(renderTarget.texture);
		renderer.readRenderTargetPixels(renderTarget, 0, 0, image.width, image.height, this._dataTexture.image.data);
		this._dataTexture.needsUpdate = true;
	}

	private _createDataTexture(texture: Texture) {
		const image = texture.image;
		const pixelBuffer = this._createPixelBuffer(image.width, image.height);
		const dataTexture = new DataTexture(
			pixelBuffer,
			image.width,
			image.height,
			texture.format as PixelFormat,
			texture.type,
			texture.mapping as Mapping,
			texture.wrapS,
			texture.wrapT,
			texture.magFilter,
			texture.minFilter,
			texture.anisotropy,
			texture.colorSpace
		);
		return dataTexture;
	}

	private _createPixelBuffer(width: number, height: number) {
		const size = width * height * 4;

		// for env maps:
		// Uint8Array, Uint8ClampedArray
		// using Float32 array gives the following error when calling readRenderTargetPixels:
		// WebGL: INVALID_OPERATION: texImage2D: type UNSIGNED_BYTE but ArrayBufferView not Uint8Array or Uint8ClampedArray

		switch (this.bufferType) {
			case DataTextureControllerBufferType.Uint8Array:
				return new Uint8Array(size);
			case DataTextureControllerBufferType.Uint8ClampedArray:
				return new Uint8ClampedArray(size);
			case DataTextureControllerBufferType.Uint16Array:
				return new Uint16Array(size);
			case DataTextureControllerBufferType.Float32Array:
				return new Float32Array(size);
		}
		TypeAssert.unreachable(this.bufferType);
	}

	private _sameDimensions(texture: Texture): boolean {
		if (this._dataTexture) {
			const same_w = this._dataTexture.image.width == texture.image.width;
			const same_h = this._dataTexture.image.height == texture.image.height;
			return same_w && same_h;
		} else {
			return true;
		}
	}
}
