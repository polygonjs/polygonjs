import {Loader, LoadingManager, MathUtils} from 'three';
import {BaseLoaderHandler, BaseGeoLoader} from './_BaseLoaderHandler';
import type {OnSuccess, OnProgress, OnError} from './Common';
import {CadLoader} from '../../geometry/cad/CadLoader';
import {CadGeometryType, cadGeometryTypeFromShape} from '../../geometry/cad/CadCommon';
import {CadLoaderSync} from '../../geometry/cad/CadLoaderSync';
import {CadObject} from '../../geometry/cad/CadObject';
import {BaseLoaderLoadOptions} from '../_Base';

type TypedCadObject = CadObject<CadGeometryType>;
type CadObjectArray = Array<TypedCadObject>;
export class STEPLoaderHandler extends BaseLoaderHandler<CadObjectArray, TypedCadObject> {
	protected async _getLoader(options: BaseLoaderLoadOptions): Promise<BaseGeoLoader<CadObjectArray>> {
		return (this._loader = this._loader || (await new STEPLoader(this.loadingManager)));
	}
	protected _onLoadSuccess(o: CadObjectArray): CadObjectArray {
		return o;
	}
}

class STEPLoader extends Loader {
	constructor(manager: LoadingManager) {
		super(manager);
	}

	load(url: string, onLoad: OnSuccess<CadObjectArray>, onProgress?: OnProgress, onError?: OnError) {
		return new Promise(async (resolve) => {
			const oc = await CadLoader.core();
			const newObjects: CadObject<CadGeometryType>[] = [];

			const reader = new oc.STEPControl_Reader_1();

			const response = await fetch(url);
			const text = await response.text();
			const fileNameShort = MathUtils.generateUUID();
			const FSfileName: string = `file.${fileNameShort}`;
			const canRead = true;
			const canWrite = true;
			const canOwn = true;
			oc.FS.createDataFile('/', FSfileName, text, canRead, canWrite, canOwn);
			const result = reader.ReadFile(FSfileName);
			const isDone = result == oc.IFSelect_ReturnStatus.IFSelect_RetDone;
			if (isDone) {
				reader.TransferRoots(CadLoaderSync.Message_ProgressRange);
				const shapesCount = reader.NbShapes();
				for (let i = 0; i < shapesCount; i++) {
					const shape = reader.Shape(i + 1);
					const type = cadGeometryTypeFromShape(oc, shape);
					if (type) {
						const newObject = new CadObject(shape, type);

						newObjects.push(newObject);
					}
				}
			}
			reader.delete();
			onLoad(newObjects);
		});
	}
}
