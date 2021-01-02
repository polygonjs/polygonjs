import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../geometry/Group';
import {Vector3} from 'three/src/math/Vector3';
import {IcosahedronBufferGeometry} from '../../geometry/operation/Icosahedron';
import {ObjectType} from '../../geometry/Constant';

interface IcosahedronSopParams extends DefaultOperationParams {
	radius: number;
	detail: number;
	pointsOnly: boolean;
	center: Vector3;
}

export class IcosahedronSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: IcosahedronSopParams = {
		radius: 1,
		detail: 0,
		pointsOnly: false,
		center: new Vector3(0, 0, 0),
	};
	static type(): Readonly<'icosahedron'> {
		return 'icosahedron';
	}

	cook(input_contents: CoreGroup[], params: IcosahedronSopParams) {
		const pointsOnly = params.pointsOnly;
		const geometry = new IcosahedronBufferGeometry(params.radius, params.detail, pointsOnly);
		geometry.translate(params.center.x, params.center.y, params.center.z);
		if (pointsOnly) {
			const object = this.create_object(geometry, ObjectType.POINTS);
			return this.create_core_group_from_objects([object]);
		} else {
			geometry.computeVertexNormals();
			return this.create_core_group_from_geometry(geometry);
		}
	}
}
