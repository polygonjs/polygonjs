import {BufferAttribute, BufferGeometry, MathUtils} from 'three';
import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';
import {ObjectType} from '../../Constant';
import {SDFGeometry, SDFTesselationParams} from '../SDFCommon';
import {sdfMaterialMesh} from '../SDFConstant';
import {toCreasedNormals} from '../../../../modules/three/examples/jsm/utils/BufferGeometryUtils';

export function SDFGeometryToObject3D(sdfGeometry: SDFGeometry, options: SDFTesselationParams) {
	const geometry = SDFGeometryToBufferGeometry(sdfGeometry, options);

	return BaseSopOperation.createObject(
		geometry,
		ObjectType.MESH,
		sdfMaterialMesh(options.meshesColor, options.wireframe)
	);
}

export function SDFGeometryToBufferGeometry(sdfGeometry: SDFGeometry, options: SDFTesselationParams) {
	const sdfMesh = sdfGeometry.getMesh();
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(sdfMesh.vertProperties, 3));
	geometry.setIndex(new BufferAttribute(sdfMesh.triVerts, 1));

	return toCreasedNormals(geometry, MathUtils.degToRad(options.facetAngle));
}
