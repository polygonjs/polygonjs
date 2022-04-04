import {BaseNodeType} from '../../../engine/nodes/_Base';
import {Poly} from '../../../engine/Poly';
import {CoreBaseLoader, modifyUrl} from '../_Base';
// @ts-ignore
import XAtlas from 'xatlas-web';

type MeshId = number;
interface MeshInfo {
	positionOffset: number;
	indexOffset: number;
	normalOffset: number;
	uvOffset: number;
	meshId: MeshId;
}
interface MeshData {
	newVertexCount: number;
	newIndexCount: number;
	uvOffset: number;
	indexOffset: number;
	originalIndexOffset: number;
}
interface ArraySetter {
	set: (array: ArrayLike<number>, count: number) => void;
	buffer: ArrayBufferLike;
}

interface XAtlasOptions {}
export interface XAtlasManager {
	createMesh: (vertexCount: number, originalIndexCount: number, test: boolean, test2: boolean) => MeshInfo;

	createAtlas: () => void;
	generateAtlas: () => void;
	addMesh: () => number;
	getMeshData: (meshId: MeshId) => MeshData;
	destroyAtlas: () => void;
	HEAPU16: ArraySetter;
	HEAPF32: ArraySetter;
	HEAPU32: ArraySetter;
}
interface XAtlasContainer {
	ready: XAtlasManager;
}

export const AddMeshStatus = {
	Success: 0,
	Error: 1,
	IndexOutOfRange: 2,
	InvalidIndexCount: 3,
};

export class XAtlasLoaderHandler extends CoreBaseLoader {
	private static _module: XAtlasContainer | undefined;
	private static _wasmUrl: string | undefined;

	public static async xatlas(node: BaseNodeType) {
		if (!this._module) {
			await this._loadWasm({}, node);
			// const wasmurl = new URL('./UvUnwrap/xatlas-web.wasm', import.meta.url);
			// const wasmurl = new URL('../../../../node_modules/xatlas-web/dist/xatlas-web.wasm', import.meta.url);
			// const wasmurl = new URL('xatlas-web/dist/xatlas-web.wasm', import.meta.url);
			this._module = XAtlas({
				locateFile: (path: string) => {
					if (path.endsWith('.wasm')) {
						return this._wasmUrl;
					}
					return path;
				},
			});
		}
		return this._module ? this._module.ready : undefined;
	}

	private static async _loadWasm(options: XAtlasOptions, node: BaseNodeType) {
		const root = Poly.libs.root();
		const XATLASPath = Poly.libs.XATLASPath();
		if (root || XATLASPath) {
			const decoderPath = `${root || ''}${XATLASPath || ''}/`;

			const fileName = 'xatlas-web.wasm';
			const fullUrl = `${decoderPath}${fileName}`;
			await this._loadMultipleBlobGlobal({
				files: [
					{
						fullUrl,
					},
				],
				node,
				error: 'failed to load draco libraries. Make sure to install them to load .glb files',
			});
			await Poly.blobs.fetchBlobForNode({
				fullUrl,
				node: node,
				multiAssetsForNode: false,
			});

			this._wasmUrl = modifyUrl(fullUrl);
		}
	}
}
