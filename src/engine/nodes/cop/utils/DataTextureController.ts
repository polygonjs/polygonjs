import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget';
import {DataTexture} from 'three/src/textures/DataTexture';
import {TypeAssert} from '../../../poly/Assert';

export enum DataTextureControllerBufferType {
	Uint8Array = 'Uint8Array',
	Uint8ClampedArray = 'Uint8ClampedArray',
	Float32Array = 'Float32Array',
}

export class DataTextureController {
	private _data_texture: DataTexture | undefined;

	constructor(private buffer_type: DataTextureControllerBufferType) {}

	from_render_target(renderer: WebGLRenderer, render_target: WebGLRenderTarget) {
		if (!this._data_texture || !this._same_dimensions(render_target)) {
			this._data_texture = this._create_data_texture(render_target);
		}
		this._copy_to_data_texture(renderer, render_target);
		return this._data_texture;
	}
	get data_texture() {
		return this._data_texture;
	}

	reset() {
		this._data_texture = undefined;
	}

	private _copy_to_data_texture(renderer: WebGLRenderer, render_target: WebGLRenderTarget) {
		const image = render_target.texture.image;
		this._data_texture = this._data_texture || this._create_data_texture(render_target);
		renderer.readRenderTargetPixels(render_target, 0, 0, image.width, image.height, this._data_texture.image.data);
		this._data_texture.needsUpdate = true;
	}

	private _create_data_texture(render_target: WebGLRenderTarget) {
		const texture = render_target.texture;
		const image = texture.image;
		const pixel_buffer = this._create_pixel_buffer(image.width, image.height);
		const data_texture = new DataTexture(
			pixel_buffer,
			image.width,
			image.height,
			texture.format,
			texture.type,
			texture.mapping,
			texture.wrapS,
			texture.wrapT,
			texture.magFilter,
			texture.minFilter,
			texture.anisotropy,
			texture.encoding
		);
		return data_texture;
	}

	private _create_pixel_buffer(width: number, height: number) {
		const size = width * height * 4;

		// for env maps:
		// Uint8Array, Uint8ClampedArray
		// using Float32 array gives the following error when calling readRenderTargetPixels:
		// WebGL: INVALID_OPERATION: texImage2D: type UNSIGNED_BYTE but ArrayBufferView not Uint8Array or Uint8ClampedArray

		switch (this.buffer_type) {
			case DataTextureControllerBufferType.Uint8Array:
				return new Uint8Array(size);
			case DataTextureControllerBufferType.Uint8ClampedArray:
				return new Uint8ClampedArray(size);
			case DataTextureControllerBufferType.Float32Array:
				return new Float32Array(size);
		}
		TypeAssert.unreachable(this.buffer_type);
	}

	private _same_dimensions(render_target: WebGLRenderTarget): boolean {
		if (this._data_texture) {
			const same_w = this._data_texture.image.width == render_target.texture.image.width;
			const same_h = this._data_texture.image.height == render_target.texture.image.height;
			return same_w && same_h;
		} else {
			return true;
		}
	}
}
