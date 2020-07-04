import {TypedSopNode} from './_Base';
import {CSS3DObject} from '../../../../modules/three/examples/jsm/renderers/CSS3DRenderer';
import {CoreGroup} from '../../../core/geometry/Group';

interface Css2DObjectParams {
	class_name: string;
	text: string;
}
const ATTRIBUTE_NAME = {
	class_name: 'class',
	text: 'text',
};
const DEFAULT_VALUE = {
	class_name: 'css2d_object',
	text: 'default text',
};

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class Css3DObjectSopParamsConfig extends NodeParamsConfig {
	class_name = ParamConfig.STRING(DEFAULT_VALUE.class_name);
	text = ParamConfig.STRING(DEFAULT_VALUE.text, {
		multiline: true,
	});
}
const ParamsConfig = new Css3DObjectSopParamsConfig();

export class Css3DObjectSopNode extends TypedSopNode<Css3DObjectSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'css3d_object';
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
		const objects: CSS3DObject[] = [];
		for (let point of points) {
			const class_name = (point.attrib_value(ATTRIBUTE_NAME.class_name) as string) || DEFAULT_VALUE.class_name;
			const text = (point.attrib_value(ATTRIBUTE_NAME.text) as string) || DEFAULT_VALUE.text;

			const object = Css3DObjectSopNode.create_css_object({
				class_name,
				text,
			});

			object.position.copy(point.position());
			object.updateMatrix();

			objects.push(object);
		}
		this.set_objects(objects);
	}

	private _create_object_from_scratch() {
		const object = Css3DObjectSopNode.create_css_object({
			class_name: this.pv.class_name,
			text: this.pv.text,
		});

		Css3DObjectSopNode._assign_clone_method(object);

		this.set_objects([object]);
	}

	private static create_css_object(params: Css2DObjectParams) {
		const element = document.createElement('div');
		element.className = params.class_name;
		element.textContent = params.text;
		const object = new CSS3DObject(element);

		object.matrixAutoUpdate = true;

		Css3DObjectSopNode._assign_clone_method(object);
		return object;
	}

	private static _assign_clone_method(css_object: CSS3DObject) {
		css_object.clone = () => Css3DObjectSopNode.clone_css_object(css_object);
	}

	static clone_css_object(css_object: CSS3DObject) {
		const new_object = new CSS3DObject(css_object.element);
		new_object.matrixAutoUpdate = css_object.matrixAutoUpdate;
		this._assign_clone_method(new_object);
		return new_object;
	}
}
