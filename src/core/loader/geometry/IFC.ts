import {Object3D} from 'three';
import {IFCLoader} from 'web-ifc-three/IFCLoader';
// import type {IFCModel} from 'web-ifc-three/IFC/components/IFCModel';
type IFCModel = Object3D;
import {BaseLoaderLoadOptions} from '../_Base';
import {BaseGeoLoader, BaseObject3DLoaderHandler} from './_BaseLoaderHandler';

interface IFCLoaderLoadOptions extends BaseLoaderLoadOptions {
	// draco: boolean;
	// ktx2: boolean;
}

export class IFCLoaderHandler extends BaseObject3DLoaderHandler<IFCModel> {
	//
	private _ifcLoader: IFCLoader | undefined;
	override reset() {
		super.reset();
		// this._ifcLoader?.dispose();
		this._ifcLoader = undefined;
	}
	override async load(options: IFCLoaderLoadOptions): Promise<Object3D[] | undefined> {
		return super.load(options);
	}

	protected async _getLoader(options: IFCLoaderLoadOptions): Promise<BaseGeoLoader<IFCModel>> {
		return (this._ifcLoader = this._ifcLoader || new IFCLoader(this.loadingManager));
	}

	protected override _onLoadSuccess(ifcModel: IFCModel): Object3D[] {
		return [ifcModel];
	}
}
