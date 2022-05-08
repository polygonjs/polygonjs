import {BufferGeometry, BufferAttribute, Vector3, Matrix4} from 'three';
import jscad from '@jscad/modeling';
// import {PolyDictionary} from '../../../../types/GlobalTypes';
import {ObjectType} from '../../Constant';
import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';
import {CSG_MATERIAL} from '../CsgConstant';

interface jscadVertexWithIndex extends jscad.maths.vec3.Vec3 {
	// positionAsString: string;
	index: number;
}
// interface Normal {
// 	index: number;
// 	normal: Vector3;
// }

// interface NormalAttributes {
// 	normals: Normal[];
// }

export function geom3ToObject3D(csg: jscad.geometries.geom3.Geom3) {
	const geometry = geom3ToBufferGeometry(csg);
	return BaseSopOperation.createObject(geometry, ObjectType.MESH, CSG_MATERIAL[ObjectType.MESH]);
}

export function geom3ToBufferGeometry(csg: jscad.geometries.geom3.Geom3) {
	const positions: number[] = [];
	const colors: number[] = [];
	const indices: number[] = [];
	const polygons = csg.polygons;
	let currentIndex = 0;
	console.log(csg);
	const color = csg.color;
	const indexByPosition: Map<string, number> = new Map();
	for (let polygon of polygons) {
		const polygonVertices = polygon.vertices as jscadVertexWithIndex[];
		// console.log(polygonVertices.map((v) => v.index));
		for (let vertex of polygonVertices) {
			const positionAsString = `${vertex[0]},${vertex[1]},${vertex[2]}`;
			// vertex.positionAsString = positionAsString;
			let index = indexByPosition.get(positionAsString);
			if (index == null) {
				index = currentIndex;
				indexByPosition.set(positionAsString, index);
				positions.push(vertex[0], vertex[1], vertex[2]);
				if (color) {
					colors.push(color[0], color[1], color[2]);
				} else {
					colors.push(1, 1, 1);
				}
				currentIndex++;
			}
			vertex.index = index;
		}
		const first = (polygonVertices[0] as jscadVertexWithIndex).index;
		for (let i = 2; i < polygon.vertices.length; i++) {
			const second = (polygon.vertices[i - 1] as jscadVertexWithIndex).index;
			const third = (polygon.vertices[i] as jscadVertexWithIndex).index;
			indices.push(first, second, third);
		}
	}
	// let idx = 0;
	// console.log(indexByPosition);
	// for (let polygon of polygons) {
	// 	const polygonVertices = polygon.vertices as jscadVertexWithIndex[];
	// 	// console.log(polygonVertices.map((v) => v.index));
	// 	for (let vertex of polygonVertices) {
	// 		const str = `${vertex[0]},${vertex[1]},${vertex[2]}`;
	// 		if (!indexByPosition.get(str)) {
	// 			indexByPosition.set(str, newIndex++);
	// 		}
	// 		vertex.index = idx;
	// 		vertices.push(vertex[0], vertex[1], vertex[2]);
	// 		if (polygon.color) {
	// 			colors.push(polygon.color[0], polygon.color[1], polygon.color[2]);
	// 		} else {
	// 			colors.push(1, 1, 1);
	// 		}
	// 		idx++;
	// 	}
	// 	const first = (polygonVertices[0] as jscadVertexWithIndex).index;
	// 	for (let i = 2; i < polygon.vertices.length; i++) {
	// 		const second = (polygon.vertices[i - 1] as jscadVertexWithIndex).index;
	// 		const third = (polygon.vertices[i] as jscadVertexWithIndex).index;
	// 		indices.push(first, second, third);
	// 	}
	// }

	const geo = new BufferGeometry();
	geo.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
	geo.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
	geo.setIndex(indices);
	if (csg.transforms) {
		const transforms = new Matrix4();
		transforms.set(...csg.transforms).transpose();
		geo.applyMatrix4(transforms);
	}
	geo.computeVertexNormals();

	// const positions: PolyDictionary<NormalAttributes> = {};
	// for (let i = 0; i < geo.attributes.position.count; i++) {
	// 	const pArray = geo.attributes.position.array;
	// 	const x = Math.round(pArray[i * 3] * 100);
	// 	const y = Math.round(pArray[i * 3 + 1] * 100);
	// 	const z = Math.round(pArray[i * 3 + 2] * 100);
	// 	const position = `${x},${y},${z}`;
	// 	if (!positions[position]) {
	// 		positions[position] = {normals: []};
	// 	}
	// 	const nArray = geo.attributes.normal.array;
	// 	const nx = nArray[i * 3];
	// 	const ny = nArray[i * 3 + 1];
	// 	const nz = nArray[i * 3 + 2];
	// 	const normal = new Vector3(nx, ny, nz);
	// 	positions[position].normals.push({index: i, normal: normal});
	// }

	// const toAverage: Map<number, Vector3> = new Map();
	// const toAverageIndices: number[] = [];
	// for (let p in positions) {
	// 	const currentPosition = positions[p];
	// 	const nl = currentPosition.normals.length;
	// 	for (let i = 0; i < nl - 1; i += 1) {
	// 		for (let j = i + 1; j < nl; j += 1) {
	// 			const n1 = currentPosition.normals[i].normal;
	// 			const n2 = currentPosition.normals[j].normal;
	// 			if (n1.angleTo(n2) < Math.PI * 0.5 && n1.angleTo(n2) !== 0) {
	// 				const i0 = currentPosition.normals[i].index;
	// 				const i1 = currentPosition.normals[j].index;
	// 				toAverage.set(i0, currentPosition.normals[i].normal);
	// 				toAverage.set(i1, currentPosition.normals[j].normal);
	// 				toAverageIndices.push(i0, i1);
	// 			}
	// 		}
	// 	}
	// 	const averageNormal = new Vector3();
	// 	for (let index of toAverageIndices) {
	// 		const normal = toAverage.get(index);
	// 		if (normal) {
	// 			averageNormal.add(normal);
	// 			averageNormal.normalize();
	// 		}
	// 	}
	// 	for (let index of toAverageIndices) {
	// 		(geo.attributes.normal.array as number[])[index * 3] = averageNormal.x;
	// 		(geo.attributes.normal.array as number[])[index * 3 + 1] = averageNormal.y;
	// 		(geo.attributes.normal.array as number[])[index * 3 + 2] = averageNormal.z;
	// 	}

	// 	toAverage.clear();
	// 	toAverageIndices.splice(0, toAverageIndices.length);
	// }

	// geo.attributes.normal.needsUpdate = true;

	// matrix.elements = csg.transforms;
	// geo.applyMatrix4(matrix);

	return geo;
}

export function geom3Positions(csg: jscad.geometries.geom3.Geom3): Vector3[] {
	const bufferGeometry = geom3ToBufferGeometry(csg);
	const positionAttribute = bufferGeometry.getAttribute('position');
	const positionsArray = positionAttribute.array;
	const pointsCount = positionAttribute.itemSize;
	const vectors: Vector3[] = new Array(pointsCount);
	for (let i = 0; i < pointsCount; i++) {
		const vec = new Vector3().fromArray(positionsArray, i * 3);
		vectors[i] = vec;
		i++;
	}
	return vectors;
}
