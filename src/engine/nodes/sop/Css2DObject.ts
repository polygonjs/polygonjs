import lodash_isString from 'lodash/isString';
import lodash_isNumber from 'lodash/isNumber';
import {TypedSopNode} from './_Base';
import {CSS2DObject} from '../../../../modules/core/objects/CSS2DObject';
import {CoreGroup} from '../../../core/geometry/Group';

interface Css2DObjectParams {
	id: string;
	class_name: string;
	html: string;
}
const ATTRIBUTE_NAME = {
	id: 'id',
	class_name: 'class',
	html: 'html',
};
const DEFAULT_VALUE = {
	id: 'my_css_object',
	class_name: 'css2d_object',
	html: '<div>default html</div>',
};

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreString} from '../../../core/String';
class Css2DObjectSopParamsConfig extends NodeParamsConfig {
	use_id_attrib = ParamConfig.BOOLEAN(0);
	id = ParamConfig.STRING(DEFAULT_VALUE.id, {
		visible_if: {use_id_attrib: 0},
	});
	use_class_attrib = ParamConfig.BOOLEAN(0);
	class_name = ParamConfig.STRING(DEFAULT_VALUE.class_name, {
		visible_if: {use_class_attrib: 0},
	});
	use_html_attrib = ParamConfig.BOOLEAN(0);
	html = ParamConfig.STRING(DEFAULT_VALUE.html, {
		visible_if: {use_html_attrib: 0},
		multiline: true,
	});
	copy_attributes = ParamConfig.BOOLEAN(0);
	attributes_to_copy = ParamConfig.STRING('', {
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

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		if (core_group) {
			this._create_objects_from_input_points(core_group);
		} else {
			this._create_object_from_scratch();
		}
	}

	private _create_objects_from_input_points(core_group: CoreGroup) {
		const points = core_group.points();
		const objects: CSS2DObject[] = [];
		for (let point of points) {
			const id = this.pv.use_id_attrib ? (point.attrib_value(ATTRIBUTE_NAME.id) as string) : this.pv.class_name;
			const class_name = this.pv.use_class_attrib
				? (point.attrib_value(ATTRIBUTE_NAME.class_name) as string)
				: this.pv.class_name;
			const html = this.pv.use_html_attrib ? (point.attrib_value(ATTRIBUTE_NAME.html) as string) : this.pv.html;

			const object = Css2DObjectSopNode.create_css_object({
				id,
				class_name,
				html,
			});
			const element = object.element;
			if (this.pv.copy_attributes) {
				const attrib_names = CoreString.attrib_names(this.pv.attributes_to_copy);
				for (let attrib_name of attrib_names) {
					const attrib_value = point.attrib_value(attrib_name);
					if (lodash_isString(attrib_value)) {
						element.setAttribute(attrib_name, attrib_value);
					} else {
						if (lodash_isNumber(attrib_value)) {
							element.setAttribute(attrib_name, `${attrib_value}`);
						}
					}
				}
			}

			object.position.copy(point.position());
			object.updateMatrix();

			objects.push(object);
		}
		this.set_objects(objects);
	}

	private _create_object_from_scratch() {
		const object = Css2DObjectSopNode.create_css_object({
			id: this.pv.id,
			class_name: this.pv.class_name,
			html: this.pv.html,
		});

		this.set_objects([object]);
	}

	private static create_css_object(params: Css2DObjectParams) {
		const element = document.createElement('div');
		element.id = params.id;
		element.className = params.class_name;
		element.innerHTML = params.html;

		const object = new CSS2DObject(element);

		object.matrixAutoUpdate = false;

		return object;
	}
}
