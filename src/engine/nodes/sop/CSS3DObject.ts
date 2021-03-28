/**
 * Creates CSS3DObjects.
 *
 * @remarks
 * This is very useful to create 2D html labels that would be positioned at specific points in the 3D world.
 * Note that the camera must be configured to use a CSS3DRenderer to display them
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CSS3DObject} from '../../../modules/three/examples/jsm/renderers/CSS3DRenderer';
import {CoreGroup} from '../../../core/geometry/Group';

interface CSS3DObjectParams {
	className: string;
	text: string;
}
const ATTRIBUTE_NAME = {
	className: 'class',
	text: 'text',
};
const DEFAULT_VALUE = {
	className: 'CSS2DObject',
	text: 'default text',
};

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class CSS3DObjectSopParamsConfig extends NodeParamsConfig {
	/** @param html class */
	className = ParamConfig.STRING(DEFAULT_VALUE.className);
	/** @param text content */
	text = ParamConfig.STRING(DEFAULT_VALUE.text, {
		multiline: true,
	});
}
const ParamsConfig = new CSS3DObjectSopParamsConfig();

export class CSS3DObjectSopNode extends TypedSopNode<CSS3DObjectSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'CSS3DObject';
	}

	initializeNode() {
		this.io.inputs.setCount(0, 1);
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
			const className = (point.attribValue(ATTRIBUTE_NAME.className) as string) || DEFAULT_VALUE.className;
			const text = (point.attribValue(ATTRIBUTE_NAME.text) as string) || DEFAULT_VALUE.text;

			const object = CSS3DObjectSopNode.create_css_object({
				className,
				text,
			});

			object.position.copy(point.position());
			object.updateMatrix();

			objects.push(object);
		}
		this.setObjects(objects);
	}

	private _create_object_from_scratch() {
		const object = CSS3DObjectSopNode.create_css_object({
			className: this.pv.className,
			text: this.pv.text,
		});

		CSS3DObjectSopNode._assign_clone_method(object);

		this.setObjects([object]);
	}

	private static create_css_object(params: CSS3DObjectParams) {
		const element = document.createElement('div');
		element.className = params.className;
		element.textContent = params.text;
		const object = new CSS3DObject(element);

		object.matrixAutoUpdate = true;

		CSS3DObjectSopNode._assign_clone_method(object);
		return object;
	}

	private static _assign_clone_method(css_object: CSS3DObject) {
		css_object.clone = () => CSS3DObjectSopNode.clone_css_object(css_object);
	}

	static clone_css_object(css_object: CSS3DObject) {
		const new_object = new CSS3DObject(css_object.element);
		new_object.matrixAutoUpdate = css_object.matrixAutoUpdate;
		this._assign_clone_method(new_object);
		return new_object;
	}
}
