import {LIBRARY_INSTALL_HINT} from './../common';
import {BaseNodeType} from '../../../engine/nodes/_Base';
import {Poly} from '../../../engine/Poly';
import {CoreBaseLoader, modifyUrl} from '../_Base';
// @ts-ignore
import XAtlas from 'xatlas-web';
import {sanitizeUrl} from '../../UrlHelper';

// type MeshId = number;
// interface MeshInfo {
// 	positionOffset: number;
// 	indexOffset: number;
// 	normalOffset: number;
// 	uvOffset: number;
// 	meshId: MeshId;
// }
// interface MeshData {
// 	newVertexCount: number;
// 	newIndexCount: number;
// 	uvOffset: number;
// 	indexOffset: number;
// 	originalIndexOffset: number;
// }
// interface ArraySetter {
// 	set: (array: ArrayLike<number>, count: number) => void;
// 	buffer: ArrayBufferLike;
// }

// export interface ChartOptions {
// 	maxIterations?: number;
// 	straightnessWeight?: number;
// 	textureSeamWeight?: number;
// 	useInputMeshUvs?: boolean;
// 	maxChartArea?: number;
// 	normalDeviationWeight?: number;
// 	maxCost?: number;
// 	roundnessWeight?: number;
// 	maxBoundaryLength?: number;
// 	normalSeamWeight?: number;
// 	fixWinding?: boolean;
// }
// export interface PackOptions {
// 	maxChartSize?: number;
// 	padding?: number;
// 	bilinear?: boolean;
// 	createImage?: boolean;
// 	rotateCharts?: boolean;
// 	rotateChartsToAxis?: boolean;
// 	blockAlign?: boolean;
// 	resolution?: number;
// 	bruteForce?: boolean;
// 	texelsPerUnit?: number;
// }

// interface XAtlasOptions {}
// export interface XAtlasManager {
// 	createMesh: (vertexCount: number, originalIndexCount: number, test: boolean, test2: boolean) => MeshInfo;

// 	createAtlas: () => void;
// 	generateAtlas: (/*chartOptions?: ChartOptions, packOptions?: PackOptions, test?: boolean*/) => void;
// 	addMesh: () => number;
// 	getMeshData: (meshId: MeshId) => MeshData;
// 	destroyAtlas: () => void;
// 	HEAPU16: ArraySetter;
// 	HEAPF32: ArraySetter;
// 	HEAPU32: ArraySetter;
// }
// interface XAtlasContainer {
// 	ready: XAtlasManager;
// }

// export const AddMeshStatus = {
// 	Success: 0,
// 	Error: 1,
// 	IndexOutOfRange: 2,
// 	InvalidIndexCount: 3,
// };

export class XAtlasLoaderHandler extends CoreBaseLoader<string> {
	// private static _module: XAtlasContainer | undefined;
	// private static _wasmUrl: string | undefined;

	// public static async xatlas(node: BaseNodeType) {
	// 	if (!this._module) {
	// 		await this._loadWasm({}, node);
	// 		// const wasmurl = new URL('./UvUnwrap/xatlas-web.wasm', import.meta.url);
	// 		// const wasmurl = new URL('../../../../node_modules/xatlas-web/dist/xatlas-web.wasm', import.meta.url);
	// 		// const wasmurl = new URL('xatlas-web/dist/xatlas-web.wasm', import.meta.url);
	// 		this._module = XAtlas({
	// 			locateFile: (path: string) => {
	// 				if (path.endsWith('.wasm')) {
	// 					return this._wasmUrl;
	// 				}
	// 				return path;
	// 			},
	// 		});
	// 	}
	// 	return this._module ? this._module.ready : undefined;
	// }

	static async loadWasm(node: BaseNodeType) {
		const root = Poly.libs.root();
		const XATLASPath = Poly.libs.XATLASPath();
		if (root || XATLASPath) {
			const decoderPath = sanitizeUrl(`${root || ''}${XATLASPath || ''}/`);

			const fileNames: string[] = ['xatlas.wasm', 'xatlas.js'];
			const fullUrls = fileNames.map((fileName) => {
				return {
					fullUrl: `${decoderPath}${fileName}`,
				};
			});
			await this._loadMultipleBlobGlobal({
				files: fullUrls,
				node,
				error: `failed to load xatlas libraries. Make sure to install them use the uvUnwrap (${LIBRARY_INSTALL_HINT})`,
			});
			// await Poly.blobs.fetchBlobForNode({
			// 	fullUrl,
			// 	node: node,
			// 	multiAssetsForNode: false,
			// });

			// this._wasmUrl = modifyUrl(fullUrl);
			const _addOrigin = (url: string) => {
				// it seems that if we do not have the origin, the wasm file is not found
				if (!url.startsWith('http')) {
					return `${window.location.origin}/${url}`;
				}
				return url;
			};

			return {
				wasm: _addOrigin(modifyUrl(fullUrls[0].fullUrl)),
				js: _addOrigin(modifyUrl(fullUrls[1].fullUrl)),
			};
		}
	}
}
