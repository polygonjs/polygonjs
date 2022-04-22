/**
 * Generates a color
 *
 *
 */
import {TypedCopNode} from './_Base';
import {DataTexture} from 'three';
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
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'color';
	}
	private _dataTexture: DataTexture | undefined;

	override cook() {
		const w = this.pv.resolution.x;
		const h = this.pv.resolution.y;
		this._dataTexture = this._dataTexture || this._createDataTexture(w, h);

		const pixelsCount = h * w;
		const c = this.pv.color.toArray();
		const r = c[0] * 255;
		const g = c[1] * 255;
		const b = c[2] * 255;
		const a = 255;
		const data = this._dataTexture.image.data;
		for (let i = 0; i < pixelsCount; i++) {
			data[i * 4 + 0] = r;
			data[i * 4 + 1] = g;
			data[i * 4 + 2] = b;
			data[i * 4 + 3] = a;
		}
		this._dataTexture.needsUpdate = true;

		this.setTexture(this._dataTexture);
	}

	private _createDataTexture(width: number, height: number) {
		const pixel_buffer = this._createPixelBuffer(width, height);
		return new DataTexture(pixel_buffer, width, height);
	}
	private _createPixelBuffer(width: number, height: number) {
		const size = width * height * 4;

		return new Uint8Array(size);
	}

	static PARAM_CALLBACK_reset(node: ColorCopNode) {
		node._reset();
	}
	private _reset() {
		this._dataTexture = undefined;
	}
}
