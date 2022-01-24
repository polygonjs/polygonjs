import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Vector3} from 'three/src/math/Vector3';
import {IcosahedronBufferGeometry} from '../../../core/geometry/operation/Icosahedron';
import {ObjectType} from '../../../core/geometry/Constant';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface IcosahedronSopParams extends DefaultOperationParams {
	radius: number;
	detail: number;
	pointsOnly: boolean;
	center: Vector3;
}

export class IcosahedronSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: IcosahedronSopParams = {
		radius: 1,
		detail: 0,
		pointsOnly: false,
		center: new Vector3(0, 0, 0),
	};
	static override type(): Readonly<'icosahedron'> {
		return 'icosahedron';
	}

	override cook(input_contents: CoreGroup[], params: IcosahedronSopParams) {
		const pointsOnly = isBooleanTrue(params.pointsOnly);
		const geometry = new IcosahedronBufferGeometry(params.radius, params.detail, pointsOnly);
		geometry.translate(params.center.x, params.center.y, params.center.z);
		if (pointsOnly) {
			const object = this.createObject(geometry, ObjectType.POINTS);
			return this.createCoreGroupFromObjects([object]);
		} else {
			geometry.computeVertexNormals();
			return this.createCoreGroupFromGeometry(geometry);
		}
	}
}
