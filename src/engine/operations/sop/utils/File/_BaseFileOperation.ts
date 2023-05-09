import {BaseSopOperation} from '../../_Base';
import {CoreGroup} from '../../../../../core/geometry/Group';
import {Mesh, BufferGeometry, Object3D} from 'three';
import {DefaultOperationParams} from '../../../../../core/operations/_Base';
import {Poly} from '../../../../Poly';
import type {BaseGeoLoaderOutput} from '../../../../../core/loader/geometry/Common';
import {BaseObject3DLoaderHandler} from '../../../../../core/loader/geometry/_BaseLoaderHandler';

export interface BaseFileSopParams extends DefaultOperationParams {
	url: string;
	matrixAutoUpdate: boolean;
}

export abstract class BaseFileSopOperation<O extends BaseGeoLoaderOutput> extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: BaseFileSopParams = {
		url: ``,
		matrixAutoUpdate: false,
	};

	protected abstract _createGeoLoaderHandler(params: BaseFileSopParams): BaseObject3DLoaderHandler<O>;

	override async cook(inputCoreGroups: CoreGroup[], params: BaseFileSopParams): Promise<CoreGroup> {
		if (this._node) {
			Poly.blobs.clearBlobsForNode(this._node);
			const loader = this._createGeoLoaderHandler(params); //new FBXLoaderHandler(params.url, this.scene(), this._node);
			const result = await this._load(loader, params);
			if (result) {
				const processedObjects = this._onLoad(result, params);
				return this.createCoreGroupFromObjects(processedObjects);
			}
		}
		return this.createCoreGroupFromObjects([]);
	}
	protected async _load(loader: BaseObject3DLoaderHandler<O>, params: BaseFileSopParams) {
		if (this._node) {
			return await loader.load({
				node: this._node,
			});
		}
	}

	private _onLoad(objects: Object3D[], params: BaseFileSopParams) {
		for (let object of objects) {
			object.traverse((child) => {
				this._ensureGeometryHasIndex(child);
				if (!params.matrixAutoUpdate) {
					child.updateMatrix();
				}
				child.matrixAutoUpdate = params.matrixAutoUpdate;
			});
		}
		return objects;
	}

	private _ensureGeometryHasIndex(object: Object3D) {
		const mesh = object as Mesh;
		const geometry = mesh.geometry;
		if (geometry) {
			this.createIndexIfNone(geometry as BufferGeometry);
		}
	}
}
