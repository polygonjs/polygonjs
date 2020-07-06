import {TypedSopNode} from './_Base';
import {CSS2DObject} from '../../../../modules/core/objects/CSS2DObject';
import {CoreGroup} from '../../../core/geometry/Group';

interface Css2DObjectParams {
	class_name: string;
	html: string;
}
const ATTRIBUTE_NAME = {
	class_name: 'class',
	html: 'html',
};
const DEFAULT_VALUE = {
	class_name: 'css2d_object',
	html: '<div>default html</div>',
};

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class Css2DObjectSopParamsConfig extends NodeParamsConfig {
	class_name = ParamConfig.STRING(DEFAULT_VALUE.class_name);
	html = ParamConfig.STRING(DEFAULT_VALUE.html, {
		multiline: true,
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
			const class_name = (point.attrib_value(ATTRIBUTE_NAME.class_name) as string) || DEFAULT_VALUE.class_name;
			const html = (point.attrib_value(ATTRIBUTE_NAME.html) as string) || DEFAULT_VALUE.html;

			const object = Css2DObjectSopNode.create_css_object({
				class_name,
				html,
			});

			object.position.copy(point.position());
			object.updateMatrix();

			objects.push(object);
		}
		this.set_objects(objects);
	}

	private _create_object_from_scratch() {
		const object = Css2DObjectSopNode.create_css_object({
			class_name: this.pv.class_name,
			html: this.pv.html,
		});

		this.set_objects([object]);
	}

	private static create_css_object(params: Css2DObjectParams) {
		const element = document.createElement('div');
		element.className = params.class_name;
		element.innerHTML = params.html;
		const object = new CSS2DObject(element);

		object.matrixAutoUpdate = false;

		return object;
	}
}
