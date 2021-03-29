import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {isBooleanTrue} from '../../../core/BooleanValue';
interface RestAttributesSopParams extends DefaultOperationParams {
	tposition: boolean;
	position: string;
	restP: string;
	tnormal: boolean;
	normal: string;
	restN: string;
}

export class RestAttributesSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: RestAttributesSopParams = {
		tposition: true,
		position: 'position',
		restP: 'restP',
		tnormal: true,
		normal: 'normal',
		restN: 'restN',
	};
	static type(): Readonly<'restAttributes'> {
		return 'restAttributes';
	}

	cook(input_contents: CoreGroup[], params: RestAttributesSopParams) {
		const core_group = input_contents[0];
		const objects = core_group.objectsWithGeo();
		if (isBooleanTrue(params.tposition)) {
			this._create_rest_attribute(objects, params.position, params.restP);
		}
		if (isBooleanTrue(params.tnormal)) {
			this._create_rest_attribute(objects, params.normal, params.restN);
		}

		return this.createCoreGroupFromObjects(objects);
	}
	private _create_rest_attribute(objects: Object3DWithGeometry[], attrib_name: string, rest_attrib_name: string) {
		for (let object of objects) {
			const geometry = object.geometry;
			if (geometry) {
				const src_attrib = geometry.getAttribute(attrib_name);
				if (src_attrib) {
					geometry.setAttribute(rest_attrib_name, src_attrib.clone());
				}
			}
		}
	}
}
