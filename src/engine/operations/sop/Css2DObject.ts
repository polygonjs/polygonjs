import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {CSS2DObject} from '../../../modules/core/objects/CSS2DObject';
import {CoreString} from '../../../core/String';
import {CoreGroup} from '../../../core/geometry/Group';
import {CoreType} from '../../../core/Type';

interface Css2DObjectParams {
	id: string;
	className: string;
	html: string;
}
const ATTRIBUTE_NAME = {
	id: 'id',
	className: 'class',
	html: 'html',
};

interface Css2DObjectSopParams extends DefaultOperationParams {
	useIdAttrib: boolean;
	id: string;
	useClassAttrib: boolean;
	className: string;
	useHtmlAttrib: boolean;
	html: string;
	copyAttributes: boolean;
	attributesToCopy: string;
}

export class Css2DObjectSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: Css2DObjectSopParams = {
		useIdAttrib: false,
		id: 'my_css_object',
		useClassAttrib: false,
		className: 'css2DObject',
		useHtmlAttrib: false,
		html: '<div>default html</div>',
		copyAttributes: false,
		attributesToCopy: '',
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'css2DObject'> {
		return 'css2DObject';
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
			const id = params.useIdAttrib ? (point.attribValue(ATTRIBUTE_NAME.id) as string) : params.className;
			const className = params.useClassAttrib
				? (point.attribValue(ATTRIBUTE_NAME.className) as string)
				: params.className;
			const html = params.useHtmlAttrib ? (point.attribValue(ATTRIBUTE_NAME.html) as string) : params.html;

			const object = Css2DObjectSopOperation.create_css_object({
				id,
				className,
				html,
			});
			const element = object.element;
			if (params.copyAttributes) {
				const attrib_names = CoreString.attribNames(params.attributesToCopy);
				for (let attrib_name of attrib_names) {
					const attrib_value = point.attribValue(attrib_name);
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
			className: params.className,
			html: params.html,
		});

		return object;
	}

	private static create_css_object(params: Css2DObjectParams) {
		const element = document.createElement('div');
		element.id = params.id;
		element.className = params.className;
		element.innerHTML = params.html;

		const object = new CSS2DObject(element);

		object.matrixAutoUpdate = false;

		return object;
	}
}
