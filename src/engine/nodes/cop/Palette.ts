/**
 * Generates strips of colors depending on a palette generator
 *
 *
 */
import {TypedCopNode} from './_Base';
import {DataTexture} from 'three/src/textures/DataTexture';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {
	SORTED_PALETTE_NAMES,
	MAX_PALETTE_COLORS_COUNT,
	visibleIfColorsCountAtLeast,
} from '../../../core/color/chromotomeWrapper';
import {PaletteController, paletteControllerCallbackOptions} from '../utils/color/PaletteController';
import {ColorConversion} from '../../../core/Color';
import {NodeContext} from '../../poly/NodeContext';
import {ColorParam} from '../../params/Color';
import {Color} from 'three/src/math/Color';

class PaletteCopParamsConfig extends NodeParamsConfig {
	/** @param texture resolution */
	resolution = ParamConfig.VECTOR2([256, 256], {
		callback: (node: BaseNodeType) => {
			PaletteCopNode.PARAM_CALLBACK_reset(node as PaletteCopNode);
		},
	});
	/** @param name of the palette */
	palette = ParamConfig.INTEGER(0, {
		menu: {
			entries: SORTED_PALETTE_NAMES.map((name, value) => {
				return {name: name, value};
			}),
		},
		...paletteControllerCallbackOptions(PaletteController.PARAM_CALLBACK_updateColors),
	});
	/** @param click to set the node to the next palette */
	pickNext = ParamConfig.BUTTON(null, paletteControllerCallbackOptions(PaletteController.PARAM_CALLBACK_pickNext));
	/** @param click to set the node to the previous palette */
	pickPrevious = ParamConfig.BUTTON(
		null,
		paletteControllerCallbackOptions(PaletteController.PARAM_CALLBACK_pickPrevious)
	);
	/** @param click to set the node to a random palette */
	pickRandom = ParamConfig.BUTTON(
		null,
		paletteControllerCallbackOptions(PaletteController.PARAM_CALLBACK_pickRandom)
	);
	colorsCount = ParamConfig.INTEGER(0, {
		hidden: true,
		range: [0, MAX_PALETTE_COLORS_COUNT],
		separatorAfter: true,
	});
	/** @param palette color 1 */
	color1 = ParamConfig.COLOR([0, 0, 0], {
		visibleIf: visibleIfColorsCountAtLeast(1),
		conversion: ColorConversion.SRGB_TO_LINEAR,
	});
	/** @param palette color 2 */
	color2 = ParamConfig.COLOR([0, 0, 0], {
		visibleIf: visibleIfColorsCountAtLeast(2),
		conversion: ColorConversion.SRGB_TO_LINEAR,
	});
	/** @param palette color 3 */
	color3 = ParamConfig.COLOR([0, 0, 0], {
		visibleIf: visibleIfColorsCountAtLeast(3),
		conversion: ColorConversion.SRGB_TO_LINEAR,
	});
	/** @param palette color 4 */
	color4 = ParamConfig.COLOR([0, 0, 0], {
		visibleIf: visibleIfColorsCountAtLeast(4),
		conversion: ColorConversion.SRGB_TO_LINEAR,
	});
	/** @param palette color 5 */
	color5 = ParamConfig.COLOR([0, 0, 0], {
		visibleIf: visibleIfColorsCountAtLeast(5),
		conversion: ColorConversion.SRGB_TO_LINEAR,
	});
}
const ParamsConfig = new PaletteCopParamsConfig();

export class PaletteCopNode extends TypedCopNode<PaletteCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'palette';
	}
	public readonly paletteController: PaletteController<NodeContext.COP> = new PaletteController<NodeContext.COP>(
		this
	);
	private _dataTexture: DataTexture | undefined;
	private _colorParams: ColorParam[] | undefined;
	override initializeNode() {
		this.params.onParamsCreated('palette_init', () => {
			PaletteController.PARAM_CALLBACK_updateColors(this);
		});
	}
	private _colors = [new Color(), new Color(), new Color(), new Color(), new Color()];
	override cook() {
		const w = this.pv.resolution.x;
		const h = this.pv.resolution.y;
		this._dataTexture = this._dataTexture || this._createDataTexture(w, h);

		const alpha = 255;
		const data = this._dataTexture.image.data;
		data.fill(alpha);
		const colorsCount = this.pv.colorsCount;

		this._colorParams = this._colorParams || [
			this.p.color1,
			this.p.color2,
			this.p.color3,
			this.p.color4,
			this.p.color5,
		];
		this._colorParams.forEach((p, i) => {
			this._colors[i].copy(p.value).multiplyScalar(255);
		});
		for (let i = 0; i < w; i++) {
			const intervalIndex = this._intervalIndex(i / w, colorsCount);
			const color = this._colors[intervalIndex];
			for (let j = 0; j < h; j++) {
				const offset = i + j * w;
				color.toArray(data, offset * 4);
			}
		}
		this._dataTexture.needsUpdate = true;

		this.setTexture(this._dataTexture);
	}
	private _intervalIndex(ratio: number, colorsCount: number) {
		const interval = 1 / colorsCount;
		return Math.floor(ratio / interval);
	}

	private _createDataTexture(width: number, height: number) {
		const pixel_buffer = this._createPixelBuffer(width, height);
		return new DataTexture(pixel_buffer, width, height);
	}
	private _createPixelBuffer(width: number, height: number) {
		const size = width * height * 4;

		return new Uint8Array(size);
	}

	static PARAM_CALLBACK_reset(node: PaletteCopNode) {
		node._reset();
	}
	private _reset() {
		this._dataTexture = undefined;
	}
}
