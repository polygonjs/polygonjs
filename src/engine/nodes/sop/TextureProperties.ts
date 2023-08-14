/**
 * Allows to edit properties of textures in the used materials.
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {TexturePropertiesSopOperation} from '../../operations/sop/TextureProperties';

import {MAG_FILTER_MENU_ENTRIES, MIN_FILTER_MENU_ENTRIES} from '../../../core/cop/Filter';

import {COLOR_SPACES, COLOR_SPACE_NAME_BY_COLOR_SPACE} from '../../../core/cop/ColorSpace';
import {MAPPINGS} from '../../../core/cop/Mapping';
import {WRAPPINGS} from '../../../core/cop/Wrapping';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = TexturePropertiesSopOperation.DEFAULT_PARAMS;
class TexturePropertiesSopParamsConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING(DEFAULT.group, {
		objectMask: true,
	});

	/** @param toggle on to allow updating the texture color space */
	tcolorSpace = ParamConfig.BOOLEAN(DEFAULT.tcolorSpace);
	/** @param sets the texture encoding */
	colorSpace = ParamConfig.STRING(DEFAULT.colorSpace, {
		visibleIf: {tcolorSpace: 1},
		menuString: {
			entries: COLOR_SPACES.map((colorSpace) => ({
				name: COLOR_SPACE_NAME_BY_COLOR_SPACE[colorSpace],
				value: colorSpace,
			})),
		},
	});

	/** @param toggle on to allow updating the texture mapping */
	tmapping = ParamConfig.BOOLEAN(DEFAULT.tmapping);
	/** @param sets the texture mapping */
	mapping = ParamConfig.INTEGER(DEFAULT.mapping, {
		visibleIf: {tmapping: 1},
		menu: {
			entries: MAPPINGS.map((m) => {
				return {
					name: Object.keys(m)[0],
					value: Object.values(m)[0] as number,
				};
			}),
		},
	});

	/** @param toggle on to allow updating the texture wrap */
	twrap = ParamConfig.BOOLEAN(DEFAULT.twrap);
	/** @param sets the texture wrapS */
	wrapS = ParamConfig.INTEGER(DEFAULT.wrapS, {
		visibleIf: {twrap: 1},
		menu: {
			entries: WRAPPINGS.map((m) => {
				return {
					name: Object.keys(m)[0],
					value: Object.values(m)[0] as number,
				};
			}),
		},
	});
	/** @param sets the texture wrapT */
	wrapT = ParamConfig.INTEGER(DEFAULT.wrapT, {
		visibleIf: {twrap: 1},
		menu: {
			entries: WRAPPINGS.map((m) => {
				return {
					name: Object.keys(m)[0],
					value: Object.values(m)[0] as number,
				};
			}),
		},
		separatorAfter: true,
	});

	// anisotropy
	/** @param toggle on to update the anisotropy */
	tanisotropy = ParamConfig.BOOLEAN(DEFAULT.tanisotropy);
	/** @param sets if the anisotropy should be set to the max capabilities of the renderer */
	useRendererMaxAnisotropy = ParamConfig.BOOLEAN(DEFAULT.useRendererMaxAnisotropy, {
		visibleIf: {tanisotropy: 1},
	});
	/** @param anisotropy value */
	anisotropy = ParamConfig.INTEGER(DEFAULT.anisotropy, {
		visibleIf: {tanisotropy: 1, useRendererMaxAnisotropy: 0},
		range: [0, 32],
		rangeLocked: [true, false],
	});

	// filters
	/** @param toggle on to update min filter */
	tminFilter = ParamConfig.BOOLEAN(0);
	/** @param min filter value */
	minFilter = ParamConfig.INTEGER(DEFAULT.minFilter, {
		visibleIf: {tminFilter: 1},
		menu: {
			entries: MIN_FILTER_MENU_ENTRIES,
		},
	});
	/** @param toggle on to update mag filter */
	tmagFilter = ParamConfig.BOOLEAN(0);
	/** @param mag filter value */
	magFilter = ParamConfig.INTEGER(DEFAULT.magFilter, {
		visibleIf: {tmagFilter: 1},
		menu: {
			entries: MAG_FILTER_MENU_ENTRIES,
		},
	});
}
const ParamsConfig = new TexturePropertiesSopParamsConfig();

export class TexturePropertiesSopNode extends TypedSopNode<TexturePropertiesSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.TEXTURE_PROPERTIES;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(TexturePropertiesSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: TexturePropertiesSopOperation | undefined;
	override async cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new TexturePropertiesSopOperation(this.scene(), this.states);
		const coreGroup = await this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
