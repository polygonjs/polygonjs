import {RGBAFormat, FloatType, DataTexture, BufferGeometry, Vector3, BufferAttribute} from 'three';
import {Attribute} from '../../geometry/Attribute';
import {ClothGeometryAttributeName} from '../ClothAttribute';
import {TextureAllocationsController} from '../../../engine/nodes/gl/code/utils/TextureAllocationsController';

// const _v1 = new Vector3();
// const _v2 = new Vector3();

export function positionTexture(geometry: BufferGeometry, vertices: Vector3[], resolution: number): DataTexture {
	const data = new Float32Array(resolution * resolution * 4);
	const positionAttribute = geometry.getAttribute(Attribute.POSITION) as BufferAttribute;
	const pointsCount = positionAttribute.count;

	for (let i = 0; i < pointsCount; i++) {
		const vertex = vertices[i];
		const i4 = i * 4;
		// _v1.fromBufferAttribute(positionAttribute, i);
		vertex.toArray(data, i4);
		// data[i4 + 0] = geoVertices[i].x;
		// data[i4 + 1] = geoVertices[i].y;
		// data[i4 + 2] = geoVertices[i].z;
	}

	const texture = new DataTexture(data, resolution, resolution, RGBAFormat, FloatType);
	texture.needsUpdate = true;
	return texture;
}

export function adjacencyTexture(
	geometry: BufferGeometry,
	resolution: number,
	adjacency: number[][],
	k: number
): DataTexture {
	const data = new Float32Array(resolution * resolution * 4);
	// const geoVertices = this.mainController.geometryInit.vertices;
	// const adjacency = this.mainController.geometryInit.adjacency;
	// const length = geoVertices.length;
	const positionAttribute = geometry.getAttribute(Attribute.POSITION) as BufferAttribute;
	const pointsCount = positionAttribute.count;

	for (let i = 0; i < pointsCount; i++) {
		const i4 = i * 4;
		const adj = adjacency[i];
		// const len = adj.length - 1;

		// for (let j = 0; j < 4; j++) data[i4 + j] = len < k * 4 + j ? -1 : adj[k * 4 + j];
		for (let j = 0; j < 4; j++) {
			const adjacentIndex = adj[k * 4 + j];
			if (adjacentIndex != null) {
				data[i4 + j] = adjacentIndex;
			} else {
				data[i4 + j] = -1;
			}
		}
	}

	// console.log('createAdjacentsTexture', k, data);
	const texture = new DataTexture(data, resolution, resolution, RGBAFormat, FloatType);
	texture.needsUpdate = true;
	return texture;
}

export function distancesTexture(
	geometry: BufferGeometry,
	vertices: Vector3[],
	resolution: number,
	adjacency: number[][],
	k: number
) {
	const data = new Float32Array(resolution * resolution * 4).fill(-1);
	// const geoVertices = this.mainController.geometryInit.vertices;
	const positionAttribute = geometry.getAttribute(Attribute.POSITION) as BufferAttribute;
	const pointsCount = positionAttribute.count;

	for (let i = 0; i < pointsCount; i++) {
		const i4 = i * 4;
		const adj = adjacency[i];
		const len = adj.length - 1;

		const v = vertices[i];

		// for (let j = 0; j < 4; j++) data[i4 + j] = len < k * 4 + j ? -1 : v.distanceTo(geoVertices[adj[k * 4 + j]]);
		for (let j = 0; j < 4; j++) {
			if (len < k * 4 + j) {
				data[i4 + j] = -1;
			} else {
				const adjacentIndex = adj[k * 4 + j];
				if (adjacentIndex < 0) {
					data[i4 + j] = -1;
				} else {
					const neighbourPosition = vertices[adjacentIndex];
					const dist = v.distanceTo(neighbourPosition);
					data[i4 + j] = dist;
					if (dist < 0.0001) {
						console.log('bad dist');
					}
				}
			}
		}
	}

	const texture = new DataTexture(data, resolution, resolution, RGBAFormat, FloatType);
	texture.needsUpdate = true;
	return texture;
}

export function viscositySpringTexture(geometry: BufferGeometry, resolution: number): DataTexture {
	const data = new Float32Array(resolution * resolution * 4);
	const positionAttribute = geometry.getAttribute(Attribute.POSITION) as BufferAttribute;
	const pointsCount = positionAttribute.count;
	const viscosityAttribute = geometry.getAttribute(ClothGeometryAttributeName.VISCOSITY) as
		| BufferAttribute
		| undefined;
	const springAttribute = geometry.getAttribute(ClothGeometryAttributeName.SPRING) as BufferAttribute | undefined;
	const viscosityArray = viscosityAttribute ? viscosityAttribute.array : undefined;
	const springArray = springAttribute ? springAttribute.array : undefined;

	for (let i = 0; i < pointsCount; i++) {
		const i4 = i * 4;
		data[i4] = viscosityArray ? viscosityArray[i] : 1;
		data[i4 + 1] = springArray ? springArray[i] : 1;
	}

	const texture = new DataTexture(data, resolution, resolution, RGBAFormat, FloatType);
	texture.needsUpdate = true;
	return texture;
}
export function createTexturesFromAllocation(
	geometry: BufferGeometry,
	resolution: number,
	allocationsController: TextureAllocationsController
): Record<string, DataTexture> {
	const data: Record<string, DataTexture> = {};

	const positionAttribute = geometry.getAttribute(Attribute.POSITION) as BufferAttribute;
	const pointsCount = positionAttribute.count;

	allocationsController.readonlyAllocations().forEach((allocation) => {
		const textureData = new Float32Array(resolution * resolution * 4);
		allocation.variables()?.forEach((variable) => {
			const attribName = variable.name();
			const attribSize = variable.size();
			const attribute = geometry.getAttribute(attribName) as BufferAttribute | undefined;
			if (attribute) {
				const array = attribute.array;
				for (let i = 0; i < pointsCount; i++) {
					const i4 = i * 4;
					for (let j = 0; j < attribSize; j++) {
						textureData[i4 + j] = array[i * attribSize + j];
					}
				}
				const texture = new DataTexture(textureData, resolution, resolution, RGBAFormat, FloatType);
				texture.needsUpdate = true;
				data[attribName] = texture;
			}
		});
	});

	return data;
}
