import {BufferAttribute, Object3D, Vector3} from 'three';
import {tileCubeLatticeDeform} from './WFCTileDeform';
import {TileCorners} from './WFCCommon';
import {QuadObject} from '../geometry/modules/quad/QuadObject';
import {NeighbourIndex} from '../geometry/modules/quad/graph/QuadGraphCommon';
import {ThreejsCoreObject} from '../geometry/modules/three/ThreejsCoreObject';
import {QuadPrimitivePointIndices, quadPrimitivePointIndexIndices} from '../geometry/modules/quad/utils/QuadUtils';
import {Attribute} from '../geometry/Attribute';

const tileCorners: TileCorners = {
	p0: new Vector3(),
	p1: new Vector3(),
	p2: new Vector3(),
	p3: new Vector3(),
	height: 1,
};

export interface PlaceObjectOnQuadOptions {
	object: Object3D;
	quadObject: QuadObject;
	primitiveIndex: number;
	rotation: NeighbourIndex;
	height: number;
}

export function placeObjectOnQuad(options: PlaceObjectOnQuadOptions) {
	const tileObject = ThreejsCoreObject.clone(options.object);
	quadNodeCorners(options.quadObject, options.primitiveIndex, tileCorners);
	tileCorners.height = options.height;
	tileObject.traverse((child) => {
		tileCubeLatticeDeform(child, tileCorners, options.rotation);
	});
	// this._objects.push(tileObject);
	return tileObject;
}
const _indices: QuadPrimitivePointIndices = {
	i0: 0,
	i1: 0,
	i2: 0,
	i3: 0,
};

export function quadNodeCorners(quadObject: QuadObject, primitiveIndex: number, target: TileCorners) {
	// quadPrimitiveCorners(quadObject,primitiveIndex,target)
	const quadGeometry = quadObject.geometry;
	const index = quadGeometry.index;
	const positionAttribute = quadGeometry.attributes[Attribute.POSITION] as BufferAttribute | undefined;
	if (!positionAttribute) {
		return target;
	}

	quadPrimitivePointIndexIndices(primitiveIndex, _indices);
	const positionArray = positionAttribute.array;
	// const i0 = primitiveIndex * stride + 0;
	// const i1 = primitiveIndex * stride + 1;
	// const i2 = primitiveIndex * stride + 2;
	// const i3 = primitiveIndex * stride + 3;
	target.p0.fromArray(positionArray, index[_indices.i0] * 3);
	target.p1.fromArray(positionArray, index[_indices.i3] * 3);
	target.p2.fromArray(positionArray, index[_indices.i2] * 3);
	target.p3.fromArray(positionArray, index[_indices.i1] * 3);
}
