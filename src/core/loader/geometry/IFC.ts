import {Object3D} from 'three';
import {IFCLoader} from 'web-ifc-three/IFCLoader';
import {IFCSPACE} from 'web-ifc';
import type {IFCModel} from 'web-ifc-three/IFC/components/IFCModel';
import {BaseLoaderLoadOptions, CoreBaseLoader} from '../_Base';
import {BaseObject3DLoaderHandler} from './_BaseLoaderHandler';
import {CoreObject} from '../../geometry/modules/three/CoreObject';
import {IFCAttribute} from '../../geometry/ifc/IFCUtils';
import {Poly} from '../../../engine/Poly';
import {sanitizeUrl} from '../../UrlHelper';
import {LIBRARY_INSTALL_HINT} from '../common';

interface IFCLoaderLoadOptions extends BaseLoaderLoadOptions {
	coordinateToOrigin: boolean;
}

export class IFCLoaderHandler extends BaseObject3DLoaderHandler<IFCModel> {
	//
	private static _ifcLoader: IFCLoader | undefined;
	override reset() {
		super.reset();
		// this._ifcLoader?.dispose();
		// this._ifcLoader = undefined;
	}
	override async load(options: IFCLoaderLoadOptions): Promise<Object3D[] | undefined> {
		const loader = IFCLoaderHandler.loader();
		const node = options.node;
		const root = Poly.libs.root();
		const webIFCPath = Poly.libs.webIFCPath();
		if (root || webIFCPath) {
			const filesRoot = sanitizeUrl(`${root || ''}${webIFCPath || ''}/`);
			const workerFileName = 'IFCWorker.js';

			const timestamp = Date.now();
			const files = ['web-ifc.wasm', workerFileName, `${workerFileName}.map`];
			await CoreBaseLoader._loadMultipleBlobGlobal({
				files: files.map((file) => {
					return {
						fullUrl: `${filesRoot}${file}?t=${timestamp}`,
					};
				}),
				node,
				error: `failed to load IFC libraries. Make sure to install them to load .ifc files (${LIBRARY_INSTALL_HINT})`,
			});

			// const workerFilePath =
			// sanitizeUrl([filesRoot, workerFileName].join('/')) + `?v=${Poly.version().replace(/\./g, '-')}`;
			// it seems that the wasm path needs to be set before the worker
			await (loader.ifcManager.state.api as any).SetWasmPath(filesRoot, true);
			// worker
			// do not use worker for now, as setting it up seems inconsistent depending if
			// it is called from the web editor or the local one.
			// await loader.ifcManager.useWebWorkers(true, workerFilePath);
			// set the wasm again, which seems necessary when using the local app
			// (as the path appears to be modified internally when setting the worker)
			// await (loader.ifcManager.state.api as any).SetWasmPath(filesRoot, true);
		}

		await loader.ifcManager.parser.setupOptionalCategories({
			[IFCSPACE]: false,
		});

		await loader.ifcManager.applyWebIfcConfig({
			COORDINATE_TO_ORIGIN: options.coordinateToOrigin,
			USE_FAST_BOOLS: false,
		});

		return super.load(options);
	}

	protected _getLoader(): Promise<IFCLoader> {
		return new Promise((resolve) => {
			const loader = IFCLoaderHandler.loader();
			resolve(loader);
		});
	}
	static loader(): IFCLoader {
		return (this._ifcLoader = this._ifcLoader || new IFCLoader(this.loadingManager));
	}
	static ifcManager() {
		return this.loader().ifcManager;
	}

	protected override _onLoadSuccess(ifcModel: IFCModel): Object3D[] | Promise<Object3D[]> {
		return new Promise(async (resolve) => {
			const ifcManager = ifcModel.ifcManager;
			if (!ifcManager) {
				console.warn('no ifcManager found');
				return resolve([]);
			}

			CoreObject.addAttribute(ifcModel, IFCAttribute.MODEL_ID, ifcModel.modelID);

			return resolve([ifcModel]);
		});
	}
}
