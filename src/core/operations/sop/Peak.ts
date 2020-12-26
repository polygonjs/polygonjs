import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {CoreGeometry} from '../../geometry/Geometry';
import {CorePoint} from '../../geometry/Point';
import {Mesh} from 'three/src/objects/Mesh';

const POSITION = 'position';

interface PeakSopParams extends DefaultOperationParams {
	amount: number;
}

export class PeakSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: PeakSopParams = {
		amount: 1,
	};
	static type(): Readonly<'peak'> {
		return 'peak';
	}

	cook(input_contents: CoreGroup[], params: PeakSopParams) {
		const core_group = input_contents[0];

		let core_geometry: CoreGeometry, point: CorePoint;
		for (let object of core_group.objects()) {
			object.traverse((child_object) => {
				let geometry;
				if ((geometry = (child_object as Mesh).geometry as BufferGeometry) != null) {
					core_geometry = new CoreGeometry(geometry);
					for (point of core_geometry.points()) {
						const normal = point.normal();
						const position = point.position();
						const new_position = position.clone().add(normal.multiplyScalar(params.amount));
						point.setPosition(new_position);
					}

					// if (!this.io.inputs.clone_required(0)) {
					const attrib = core_geometry.geometry().getAttribute(POSITION) as BufferAttribute;
					attrib.needsUpdate = true;
					//}
				}
			});
		}

		return input_contents[0];
	}
}
