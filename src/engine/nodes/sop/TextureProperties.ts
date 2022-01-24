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

import {ENCODINGS} from '../../../core/cop/Encoding';
import {MAPPINGS} from '../../../core/cop/Mapping';
import {WRAPPINGS} from '../../../core/cop/Wrapping';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = TexturePropertiesSopOperation.DEFAULT_PARAMS;
class TexturePropertiesSopParamsConfig extends NodeParamsConfig {
	/** @param sets if this node should search through the materials inside the whole hierarchy */
	applyToChildren = ParamConfig.BOOLEAN(DEFAULT.applyToChildren, {separatorAfter: true});

	/** @param toggle on to allow updating the texture encoding */
	tencoding = ParamConfig.BOOLEAN(DEFAULT.tencoding);
	/** @param sets the texture encoding */
	encoding = ParamConfig.INTEGER(DEFAULT.encoding, {
		visibleIf: {tencoding: 1},
		menu: {
			entries: ENCODINGS.map((m) => {
				return {
					name: Object.keys(m)[0],
					value: Object.values(m)[0] as number,
				};
			}),
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
		return 'textureProperties';
	}

	static override displayedInputNames(): string[] {
		return ['objects with textures to change properties of'];
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(TexturePropertiesSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: TexturePropertiesSopOperation | undefined;
	override async cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new TexturePropertiesSopOperation(this.scene(), this.states);
		const core_group = await this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
