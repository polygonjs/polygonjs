/**
 * Allows to edit properties of textures in the used materials.
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {TexturePropertiesSopOperation} from '../../../core/operations/sop/TextureProperties';

import {MAG_FILTER_MENU_ENTRIES, MIN_FILTER_MENU_ENTRIES} from '../../../core/cop/ConstantFilter';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = TexturePropertiesSopOperation.DEFAULT_PARAMS;
class TexturePropertiesSopParamsConfig extends NodeParamsConfig {
	/** @param sets if this node should search through the materials inside the whole hierarchy */
	applyToChildren = ParamConfig.BOOLEAN(DEFAULT.applyToChildren);
	separator = ParamConfig.SEPARATOR();
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
	params_config = ParamsConfig;
	static type() {
		return 'textureProperties';
	}

	static displayed_input_names(): string[] {
		return ['objects with textures to change properties of'];
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(TexturePropertiesSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: TexturePropertiesSopOperation | undefined;
	async cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new TexturePropertiesSopOperation(this.scene(), this.states);
		const core_group = await this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
