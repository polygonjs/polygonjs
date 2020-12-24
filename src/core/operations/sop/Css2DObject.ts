import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {CSS2DObject} from '../../../modules/core/objects/CSS2DObject';
import {CoreString} from '../../../core/String';
import {CoreGroup} from '../../geometry/Group';
import { CoreType } from '../../Type';

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

interface Css2DObjectSopParams extends DefaultOperationParams {
	use_id_attrib: boolean;
	id: string;
	use_class_attrib: boolean;
	class_name: string;
	use_html_attrib: boolean;
	html: string;
	copy_attributes: boolean;
	attributes_to_copy: string;
}

export class Css2DObjectSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: Css2DObjectSopParams = {
		use_id_attrib: false,
		id: 'my_css_object',
		use_class_attrib: false,
		class_name: 'css2d_object',
		use_html_attrib: false,
		html: '<div>default html</div>',
		copy_attributes: false,
		attributes_to_copy: '',
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'css2d_object'> {
		return 'css2d_object';
	}

	cook(input_contents: CoreGroup[], params: Css2DObjectSopParams) {
		const core_group = input_contents[0];
		if (core_group) {
			const objects = this._create_objects_from_input_points(core_group, params);
			return this.create_core_group_from_objects(objects);
		} else {
			const object = this._create_object_from_scratch(params);
			return this.create_core_group_from_objects([object]);
		}
	}
	private _create_objects_from_input_points(core_group: CoreGroup, params: Css2DObjectSopParams) {
		const points = core_group.points();
		const objects: CSS2DObject[] = [];
		for (let point of points) {
			const id = params.use_id_attrib ? (point.attrib_value(ATTRIBUTE_NAME.id) as string) : params.class_name;
			const class_name = params.use_class_attrib
				? (point.attrib_value(ATTRIBUTE_NAME.class_name) as string)
				: params.class_name;
			const html = params.use_html_attrib ? (point.attrib_value(ATTRIBUTE_NAME.html) as string) : params.html;

			const object = Css2DObjectSopOperation.create_css_object({
				id,
				class_name,
				html,
			});
			const element = object.element;
			if (params.copy_attributes) {
				const attrib_names = CoreString.attrib_names(params.attributes_to_copy);
				for (let attrib_name of attrib_names) {
					const attrib_value = point.attrib_value(attrib_name);
					if (CoreType.isString(attrib_value)) {
						element.setAttribute(attrib_name, attrib_value);
					} else {
						if (CoreType.isNumber(attrib_value)) {
							element.setAttribute(attrib_name, `${attrib_value}`);
						}
					}
				}
			}

			object.position.copy(point.position());
			object.updateMatrix();

			objects.push(object);
		}
		return objects;
	}

	private _create_object_from_scratch(params: Css2DObjectSopParams) {
		const object = Css2DObjectSopOperation.create_css_object({
			id: params.id,
			class_name: params.class_name,
			html: params.html,
		});

		return object;
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
