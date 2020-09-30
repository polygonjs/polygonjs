import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {Css2DObjectSopOperation} from '../../../core/operation/sop/Css2DObject';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = Css2DObjectSopOperation.DEFAULT_PARAMS;
class Css2DObjectSopParamsConfig extends NodeParamsConfig {
	use_id_attrib = ParamConfig.BOOLEAN(DEFAULT.use_id_attrib);
	id = ParamConfig.STRING(DEFAULT.id, {
		visible_if: {use_id_attrib: 0},
	});
	use_class_attrib = ParamConfig.BOOLEAN(DEFAULT.use_class_attrib);
	class_name = ParamConfig.STRING(DEFAULT.class_name, {
		visible_if: {use_class_attrib: 0},
	});
	use_html_attrib = ParamConfig.BOOLEAN(DEFAULT.use_html_attrib);
	html = ParamConfig.STRING(DEFAULT.html, {
		visible_if: {use_html_attrib: 0},
		multiline: true,
	});
	copy_attributes = ParamConfig.BOOLEAN(DEFAULT.copy_attributes);
	attributes_to_copy = ParamConfig.STRING(DEFAULT.attributes_to_copy, {
		visible_if: {copy_attributes: true},
	});
}
const ParamsConfig = new Css2DObjectSopParamsConfig();

export class Css2DObjectSopNode extends TypedSopNode<Css2DObjectSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'css2d_object';
	}

	initialize_node() {
		this.io.inputs.set_count(0, 1);
	}

	private _operation: Css2DObjectSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new Css2DObjectSopOperation(this.scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.set_core_group(core_group);
	}
}
