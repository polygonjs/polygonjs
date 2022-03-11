import {BaseNodeType, TypedNode} from '../../_Base';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {Color} from 'three/src/math/Color';
import {Number3} from '../../../../types/GlobalTypes';
import {ColorConversion} from '../../../../core/Color';
import {NodeContext} from '../../../poly/NodeContext';
import {
	MAX_PALETTE_COLORS_COUNT,
	Palette,
	PALETTES_BY_NAME,
	SORTED_PALETTE_NAMES,
	visibleIfColorsCountAtLeast,
} from '../../../../core/color/chromotomeWrapper';

type PaletteControllerCallbackMethod = (node: PaletteAbstractNode<any>) => void;

export const paletteControllerCallbackOptions = (method: PaletteControllerCallbackMethod) => {
	return {
		callback: (node: BaseNodeType) => {
			method(node as PaletteAbstractNode<NodeContext>);
		},
	};
};

export class PaletteController<NC extends NodeContext> {
	constructor(private node: PaletteAbstractNode<NC>) {}

	static PARAM_CALLBACK_pickNext(node: PaletteAbstractNode<any>) {
		node.paletteController.PARAM_CALLBACK_pickNext();
	}
	static PARAM_CALLBACK_pickPrevious(node: PaletteAbstractNode<any>) {
		node.paletteController.PARAM_CALLBACK_pickPrevious();
	}
	static PARAM_CALLBACK_pickRandom(node: PaletteAbstractNode<any>) {
		node.paletteController.PARAM_CALLBACK_pickRandom();
	}
	static PARAM_CALLBACK_updateColors(node: PaletteAbstractNode<any>) {
		node.paletteController.PARAM_CALLBACK_updateColors();
	}

	PARAM_CALLBACK_pickNext() {
		const currentIndex = SORTED_PALETTE_NAMES.indexOf(this.node.pv.paletteName);
		const nextIndex = currentIndex < SORTED_PALETTE_NAMES.length - 1 ? currentIndex + 1 : 0;
		this._batchUpdatesWithPalette(nextIndex);
	}
	PARAM_CALLBACK_pickPrevious() {
		const currentIndex = SORTED_PALETTE_NAMES.indexOf(this.node.pv.paletteName);
		const previousIndex = currentIndex == 0 ? SORTED_PALETTE_NAMES.length - 1 : currentIndex - 1;
		this._batchUpdatesWithPalette(previousIndex);
	}
	PARAM_CALLBACK_pickRandom() {
		const randomIndex = Math.floor(Math.random() * SORTED_PALETTE_NAMES.length);
		this._batchUpdatesWithPalette(randomIndex);
	}

	private _batchUpdatesWithPalette(paletteIndex: number) {
		const paletteName = SORTED_PALETTE_NAMES[paletteIndex];
		this.node.scene().batchUpdates(() => {
			this.node.p.paletteName.set(paletteName);
			this._updateColors();
		});
	}

	PARAM_CALLBACK_updateColors() {
		this.node.scene().batchUpdates(() => {
			this._updateColors();
		});
	}

	private _updateColors() {
		const node = this.node;
		const name = node.pv.paletteName;
		const palette = PALETTES_BY_NAME.get(name) as Palette;
		const colorParams = [node.p.color1, node.p.color2, node.p.color3, node.p.color4, node.p.color5];
		node.p.colorsCount.set(palette.colors.length);
		for (let i = 0; i < palette.colors.length; i++) {
			const color = palette.colors[i];
			const param = colorParams[i];
			if (color && param) {
				_tmp_color.set(color);
				_tmp_color.toArray(_tmp_color_array);
				param.set(_tmp_color_array);
			}
		}
		node.p.colorsCount.set(palette.colors.length);
	}
}

class PaletteAbstractNodeParamsConfig extends NodeParamsConfig {
	/** @param name of the palette */
	paletteName = ParamConfig.STRING(
		'',
		paletteControllerCallbackOptions(PaletteController.PARAM_CALLBACK_updateColors)
	);
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
const ParamsConfig = new PaletteAbstractNodeParamsConfig();

export class PaletteAbstractNode<NC extends NodeContext> extends TypedNode<NC, PaletteAbstractNodeParamsConfig> {
	override paramsConfig = ParamsConfig;
	//  static type() {
	// 	 return 'palette';
	//  }

	//  initializeNode() {
	// 	 this.params.onParamsCreated('palette_init', () => {
	// 		PaletteController.paramCallbackUpdateColors(this);
	// 	 });
	//  }
	public readonly paletteController = new PaletteController<NC>(this);

	// static PARAM_CALLBACK_pickNext(node: PaletteAbstractNode<any>) {
	// 	node.paletteController.PARAM_CALLBACK_pickNext();
	// }
	// static PARAM_CALLBACK_pickPrevious(node: PaletteAbstractNode<any>) {
	// 	node.paletteController.PARAM_CALLBACK_pickPrevious();
	// }
	// static PARAM_CALLBACK_pickRandom(node: PaletteAbstractNode<any>) {
	// 	node.paletteController.PARAM_CALLBACK_pickRandom();
	// }
	// static PARAM_CALLBACK_updateColors(node: PaletteAbstractNode<any>) {
	// 	node.paletteController.PARAM_CALLBACK_updateColors();
	// }
}
const _tmp_color = new Color();
const _tmp_color_array: Number3 = [1, 1, 1];
