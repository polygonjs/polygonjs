import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {Mesh} from 'three';
import {Float32BufferAttribute, Uint32BufferAttribute} from 'three';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {BufferGeometry} from 'three';
import {Attribute} from '../../../core/geometry/Attribute';
import {XAtlasLoaderHandler, AddMeshStatus, XAtlasManager} from '../../../core/loader/geometry/XAtlas';
import {TypeAssert} from '../../poly/Assert';
import {Vector3} from 'three';
import {Line3} from 'three';
import {Potpack, PotPackBox, PotPackBoxResult} from '../../../core/libs/Potpack';
import {LIBRARY_INSTALL_HINT} from '../../../core/loader/common';

export enum UvUnwrapMethod {
	POTPACK = 'potpack',
	XATLAS = 'xatlas',
}
export const UV_UNWRAP_METHODS: UvUnwrapMethod[] = [UvUnwrapMethod.XATLAS, UvUnwrapMethod.POTPACK];

interface UvUnwrapSopParams extends DefaultOperationParams {
	method: number;
	uv: string;
}

const v1 = new Vector3();
const v2 = new Vector3();
const v3 = new Vector3();
const vMid = new Vector3();
const vEnd = new Vector3();
const line = new Line3();

export class UvUnwrapSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: UvUnwrapSopParams = {
		method: UV_UNWRAP_METHODS.indexOf(UvUnwrapMethod.XATLAS),
		uv: 'uv',
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<SopType.UV_UNWRAP> {
		return SopType.UV_UNWRAP;
	}

	override async cook(inputCoreGroups: CoreGroup[], params: UvUnwrapSopParams) {
		const method = UV_UNWRAP_METHODS[params.method];
		switch (method) {
			case UvUnwrapMethod.XATLAS: {
				return await this._unwrapMeshUVsWithXAtlas(inputCoreGroups, params);
			}
			case UvUnwrapMethod.POTPACK: {
				return this._unwrapMeshUVsWithPotpack(inputCoreGroups, params);
			}
		}
		TypeAssert.unreachable(method);
	}

	private async _unwrapMeshUVsWithXAtlas(inputCoreGroups: CoreGroup[], params: UvUnwrapSopParams) {
		const coreGroup = inputCoreGroups[0];
		if (!this._node) {
			return coreGroup;
		}
		const xatlas = await XAtlasLoaderHandler.xatlas(this._node);
		if (!xatlas) {
			this.states?.error.set(`failed to load xatlas. Make sure this is installed. ${LIBRARY_INSTALL_HINT}`);
			return coreGroup;
		}

		const objects = coreGroup.objectsWithGeo();
		for (let object of objects) {
			const mesh = object as Mesh;
			if (mesh.isMesh) {
				this._unwrapMeshUVsWithAtlas(xatlas, mesh, params);
			}
		}

		return inputCoreGroups[0];
	}

	private _unwrapMeshUVsWithAtlas(xatlas: XAtlasManager, mesh: Mesh, params: UvUnwrapSopParams) {
		const geometry = mesh.geometry;
		if (!geometry.index) {
			return;
		}

		const originalVertexCount = geometry.attributes.position.count;
		const originalIndexCount = geometry.index.count;

		try {
			xatlas.createAtlas();
		} catch (err) {
			this._node?.states.error.set('failed to create atlas');
			return;
		}

		const meshInfo = xatlas.createMesh(originalVertexCount, originalIndexCount, true, true);
		const index = geometry.getIndex();
		const positionAttrib = geometry.getAttribute(Attribute.POSITION);
		const normalAttrib = geometry.getAttribute(Attribute.NORMAL);
		const uvAttrib = geometry.getAttribute(Attribute.UV);
		if (!(index && positionAttrib && normalAttrib && uvAttrib)) {
			this.states?.error.set(`the geometry needs to have an index, position, normal and uv attributes`);
			return;
		}
		xatlas.HEAPU16.set(geometry.index.array, meshInfo.indexOffset / Uint16Array.BYTES_PER_ELEMENT);
		xatlas.HEAPF32.set(
			geometry.attributes.position.array,
			meshInfo.positionOffset / Float32Array.BYTES_PER_ELEMENT
		);
		xatlas.HEAPF32.set(geometry.attributes.normal.array, meshInfo.normalOffset / Float32Array.BYTES_PER_ELEMENT);
		xatlas.HEAPF32.set(geometry.attributes.uv.array, meshInfo.uvOffset / Float32Array.BYTES_PER_ELEMENT);

		const statusCode = xatlas.addMesh();
		if (statusCode !== AddMeshStatus.Success) {
			throw new Error(`UVUnwrapper: Error adding mesh. Status code ${statusCode}`);
		}

		try {
			xatlas.generateAtlas();
		} catch (err) {
			this._node?.states.error.set('failed to generate atlas');
			return;
		}

		const meshData = xatlas.getMeshData(meshInfo.meshId);
		const oldPositionArray = geometry.attributes.position.array;
		const oldNormalArray = geometry.attributes.normal.array;
		const oldUvArray = geometry.attributes.uv.array;
		const newPositionArray = new Float32Array(meshData.newVertexCount * 3);
		const newNormalArray = new Float32Array(meshData.newVertexCount * 3);
		const newUvArray = new Float32Array(meshData.newVertexCount * 2);
		const newUv2Array = new Float32Array(xatlas.HEAPF32.buffer, meshData.uvOffset, meshData.newVertexCount * 2);
		const newIndexArray = new Uint32Array(xatlas.HEAPU32.buffer, meshData.indexOffset, meshData.newIndexCount);
		const originalIndexArray = new Uint32Array(
			xatlas.HEAPU32.buffer,
			meshData.originalIndexOffset,
			meshData.newVertexCount
		);

		for (let i = 0; i < meshData.newVertexCount; i++) {
			const originalIndex = originalIndexArray[i];
			newPositionArray[i * 3] = oldPositionArray[originalIndex * 3];
			newPositionArray[i * 3 + 1] = oldPositionArray[originalIndex * 3 + 1];
			newPositionArray[i * 3 + 2] = oldPositionArray[originalIndex * 3 + 2];
			newNormalArray[i * 3] = oldNormalArray[originalIndex * 3];
			newNormalArray[i * 3 + 1] = oldNormalArray[originalIndex * 3 + 1];
			newNormalArray[i * 3 + 2] = oldNormalArray[originalIndex * 3 + 2];
			newUvArray[i * 2] = oldUvArray[originalIndex * 2];
			newUvArray[i * 2 + 1] = oldUvArray[originalIndex * 2 + 1];
		}

		const newGeometry = new BufferGeometry();
		newGeometry.setAttribute('position', new Float32BufferAttribute(newPositionArray, 3));
		newGeometry.setAttribute('normal', new Float32BufferAttribute(newNormalArray, 3));
		if (params.uv != Attribute.UV) {
			newGeometry.setAttribute('uv', new Float32BufferAttribute(newUvArray, 2));
		}
		newGeometry.setAttribute(params.uv, new Float32BufferAttribute(newUv2Array, 2));
		newGeometry.setIndex(new Uint32BufferAttribute(newIndexArray, 1));

		mesh.geometry = newGeometry;

		xatlas.destroyAtlas();
	}

	private _unwrapMeshUVsWithPotpack(inputCoreGroups: CoreGroup[], params: UvUnwrapSopParams) {
		const coreGroup = inputCoreGroups[0];

		const objects = coreGroup.objectsWithGeo();
		for (let object of objects) {
			const mesh = object as Mesh;
			if (mesh.isMesh) {
				this._unwrapUVsWithPotpack(mesh, params);
			}
		}

		return inputCoreGroups[0];
	}

	// TODO: at the moment each polygon will fix a single box
	// when ideally this should find when 2 triangles form a quad or square
	// and could then fit in the box
	private _unwrapUVsWithPotpack(mesh: Mesh, params: UvUnwrapSopParams) {
		const geometry = mesh.geometry;
		const indexArray = geometry.getIndex()?.array;
		if (!indexArray) {
			return;
		}
		const positionArray = geometry.attributes.position?.array;
		if (!positionArray) {
			return;
		}
		const uvArray = geometry.attributes[params.uv]?.array;
		if (!uvArray) {
			return;
		}
		const polyCount = indexArray.length / 3;
		const boxes: PotPackBox[] = new Array(polyCount);
		for (let i = 0; i < polyCount; i++) {
			// this take one edge (v1-v2) of the polygon and calculate its length (w)
			// then we measure the distance between the mid point of that edge (vMid)
			// and its projection again an edge parallel to the first edge (v1-v2), but going through v3.
			v1.fromArray(positionArray, 3 * indexArray[3 * i + 0]);
			v2.fromArray(positionArray, 3 * indexArray[3 * i + 1]);
			v3.fromArray(positionArray, 3 * indexArray[3 * i + 2]);
			let w = v1.distanceTo(v2);
			vMid.copy(v1).add(v2).multiplyScalar(0.5);
			line.start.copy(v3);
			line.end.copy(v3).add(v2).sub(v1);
			line.closestPointToPoint(vMid, false, vEnd);
			let h = vMid.distanceTo(vEnd);

			// we try and get some order to that by
			// always having h and sorted
			if (h < w) {
				const tmp = h;
				h = w;
				w = tmp;
			}

			boxes[i] = {w, h};
		}

		const result = Potpack(boxes);
		const newUvValues = new Array(uvArray.length);
		// function setnewValue(index: number, newValue: number) {
		// 	// if (newUvValues[index] == null) {
		// 	newUvValues[index] = newValue;
		// 	// } else {
		// 	// 	if (newUvValues[index] <= newValue) {
		// 	// 		newUvValues[index] = newValue;
		// 	// 	} else {
		// 	// 		console.log(`${index} already has ${newUvValues[index]}, cannot be set to ${newValue}`);
		// 	// 	}
		// 	// }
		// }
		for (let i = 0; i < polyCount; i++) {
			const box = boxes[i] as PotPackBoxResult;
			const x = box.x / result.w;
			const y = box.y / result.h;
			const w = box.w / result.w;
			const h = box.h / result.h;
			const index0 = 2 * indexArray[i * 3 + 0];
			const index1 = 2 * indexArray[i * 3 + 1];
			const index2 = 2 * indexArray[i * 3 + 2];

			newUvValues[index0] = x;
			newUvValues[index0 + 1] = y;
			newUvValues[index1] = x + w;
			newUvValues[index1 + 1] = y;
			newUvValues[index2] = x;
			newUvValues[index2 + 1] = y + h;
		}
		geometry.setAttribute(params.uv, new Float32BufferAttribute(newUvValues, 2));
	}
}
