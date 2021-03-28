/**
 * Generates a color
 *
 *
 */
import {TypedCopNode} from './_Base';
import {DataTexture} from 'three/src/textures/DataTexture';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';

class ColorCopParamsConfig extends NodeParamsConfig {
	/** @param texture resolution */
	resolution = ParamConfig.VECTOR2([256, 256], {
		callback: (node: BaseNodeType) => {
			ColorCopNode.PARAM_CALLBACK_reset(node as ColorCopNode);
		},
	});
	/** @param color to generate */
	color = ParamConfig.COLOR([1, 1, 1]);
}
const ParamsConfig = new ColorCopParamsConfig();

export class ColorCopNode extends TypedCopNode<ColorCopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'color';
	}
	private _data_texture: DataTexture | undefined;

	cook() {
		const w = this.pv.resolution.x;
		const h = this.pv.resolution.y;
		this._data_texture = this._data_texture || this._create_data_texture(w, h);

		const pixels_count = h * w;
		const c = this.pv.color.toArray();
		const r = c[0] * 255;
		const g = c[1] * 255;
		const b = c[2] * 255;
		const a = 255;
		const data = this._data_texture.image.data;
		for (let i = 0; i < pixels_count; i++) {
			data[i * 4 + 0] = r;
			data[i * 4 + 1] = g;
			data[i * 4 + 2] = b;
			data[i * 4 + 3] = a;
		}
		this._data_texture.needsUpdate = true;

		this.setTexture(this._data_texture);
	}

	private _create_data_texture(width: number, height: number) {
		const pixel_buffer = this._create_pixel_buffer(width, height);
		return new DataTexture(pixel_buffer, width, height);
	}
	private _create_pixel_buffer(width: number, height: number) {
		const size = width * height * 4;

		return new Uint8Array(size);
	}

	static PARAM_CALLBACK_reset(node: ColorCopNode) {
		node._reset();
	}
	private _reset() {
		this._data_texture = undefined;
	}
}
