import {BufferGeometry} from 'three';
import {TetGeometry} from '../TetGeometry';
import {BaseSopOperation} from '../../../../../engine/operations/sop/_Base';
import {ObjectType} from '../../../Constant';
import {TetTesselationParams} from '../TetCommon';
import {SphereBuilder} from '../../../builders/SphereBuilder';
import {CoreGeometryBuilderMerge} from '../../../builders/Merge';

export function tetToSphere(tetGeometry: TetGeometry, tesselationParams: TetTesselationParams) {
	const {tetrahedrons} = tetGeometry;

	const geometries: BufferGeometry[] = [];
	tetrahedrons.forEach((tet) => {
		const {radius, center} = tet.sphere;

		const geometry = SphereBuilder.create({
			radius: radius,
			widthSegments: 32,
			heightSegments: 32,
			asLines: true,
			open: false,
		});
		geometry.translate(center.x, center.y, center.z);
		geometries.push(geometry);
	});
	const mergedGeometry = CoreGeometryBuilderMerge.merge(geometries);

	if (mergedGeometry) {
		return BaseSopOperation.createObject(mergedGeometry, ObjectType.LINE_SEGMENTS);
	}
}
