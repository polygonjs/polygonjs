/**
 * Creates CSS2DObjects.
 *
 * @remarks
 * This is very useful to create 2D html labels that would be positioned at specific points in the 3D world.
 * Note that the camera must be configured to use a CSS2DRenderer to display them
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {Css2DObjectSopOperation} from '../../../core/operations/sop/Css2DObject';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = Css2DObjectSopOperation.DEFAULT_PARAMS;
class Css2DObjectSopParamsConfig extends NodeParamsConfig {
	/** @param defines if the vertex id attribute is used to create the html id attribute */
	use_id_attrib = ParamConfig.BOOLEAN(DEFAULT.use_id_attrib);
	/** @param value of the html element id attribute */
	id = ParamConfig.STRING(DEFAULT.id, {
		visible_if: {use_id_attrib: 0},
	});
	/** @param defines if the vertex class attribute is used to create the html class */
	use_class_attrib = ParamConfig.BOOLEAN(DEFAULT.use_class_attrib);
	/** @param value of the html class */
	class_name = ParamConfig.STRING(DEFAULT.class_name, {
		visible_if: {use_class_attrib: 0},
	});
	/** @param defines if the vertex html attribute is used to create the html content */
	use_html_attrib = ParamConfig.BOOLEAN(DEFAULT.use_html_attrib);
	/** @param value of the html content */
	html = ParamConfig.STRING(DEFAULT.html, {
		visible_if: {use_html_attrib: 0},
		multiline: true,
	});
	/** @param toggles on if attributes are copied from the geometry to the html element */
	copy_attributes = ParamConfig.BOOLEAN(DEFAULT.copy_attributes);
	/** @param names of the attributes that are copied from the geometry to the html element */
	attributes_to_copy = ParamConfig.STRING(DEFAULT.attributes_to_copy, {
		visible_if: {copy_attributes: true},
	});
}
const ParamsConfig = new Css2DObjectSopParamsConfig();

export class Css2DObjectSopNode extends TypedSopNode<Css2DObjectSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'css2DObject';
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
