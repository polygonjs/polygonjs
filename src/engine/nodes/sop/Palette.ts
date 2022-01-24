/**
 * Loads a palette and sets the value of each input point to one of the colors.
 *
 * @remarks
 * This is using [https://github.com/kgolid/chromotome#readme](https://github.com/kgolid/chromotome#readme)
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {PaletteSopOperation} from '../../operations/sop/Palette';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	SORTED_PALETTE_NAMES,
	MAX_PALETTE_COLORS_COUNT,
	visibleIfColorsCountAtLeast,
} from '../../../core/color/chromotomeWrapper';
import {Number3} from '../../../types/GlobalTypes';
import {ColorConversion} from '../../../core/Color';
import {PaletteController, paletteControllerCallbackOptions} from '../utils/color/PaletteController';
import {NodeContext} from '../../poly/NodeContext';

const DEFAULT = PaletteSopOperation.DEFAULT_PARAMS;

class PaletteSopParamsConfig extends NodeParamsConfig {
	/** @param name of the palette */
	palette = ParamConfig.INTEGER(DEFAULT.palette, {
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
	colorsCount = ParamConfig.INTEGER(DEFAULT.colorsCount, {
		hidden: true,
		range: [0, MAX_PALETTE_COLORS_COUNT],
		separatorAfter: true,
	});
	/** @param palette color 1 */
	color1 = ParamConfig.COLOR(DEFAULT.color1.toArray() as Number3, {
		visibleIf: visibleIfColorsCountAtLeast(1),
		conversion: ColorConversion.SRGB_TO_LINEAR,
	});
	/** @param palette color 2 */
	color2 = ParamConfig.COLOR(DEFAULT.color2.toArray() as Number3, {
		visibleIf: visibleIfColorsCountAtLeast(2),
		conversion: ColorConversion.SRGB_TO_LINEAR,
	});
	/** @param palette color 3 */
	color3 = ParamConfig.COLOR(DEFAULT.color3.toArray() as Number3, {
		visibleIf: visibleIfColorsCountAtLeast(3),
		conversion: ColorConversion.SRGB_TO_LINEAR,
	});
	/** @param palette color 4 */
	color4 = ParamConfig.COLOR(DEFAULT.color4.toArray() as Number3, {
		visibleIf: visibleIfColorsCountAtLeast(4),
		conversion: ColorConversion.SRGB_TO_LINEAR,
	});
	/** @param palette color 5 */
	color5 = ParamConfig.COLOR(DEFAULT.color5.toArray() as Number3, {
		visibleIf: visibleIfColorsCountAtLeast(5),
		conversion: ColorConversion.SRGB_TO_LINEAR,
	});
}
const ParamsConfig = new PaletteSopParamsConfig();

export class PaletteSopNode extends TypedSopNode<PaletteSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'palette';
	}
	public readonly paletteController: PaletteController<NodeContext.SOP> = new PaletteController<NodeContext.SOP>(
		this
	);
	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(PaletteSopOperation.INPUT_CLONED_STATE);

		this.params.onParamsCreated('palette_init', () => {
			PaletteController.PARAM_CALLBACK_updateColors(this);
		});
	}

	private _operation: PaletteSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new PaletteSopOperation(this._scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
