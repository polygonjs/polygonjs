import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Mesh} from 'three';
import {BufferGeometry} from 'three';
import {Object3D} from 'three';
import {ASSETS_ROOT} from '../../../core/loader/AssetsUtils';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {GLTFLoaderHandler} from '../../../core/loader/geometry/GLTF';
import {Poly} from '../../Poly';

interface FileGLTFSopParams extends DefaultOperationParams {
	url: string;
	draco: boolean;
	matrixAutoUpdate: boolean;
}

export class FileGLTFSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: FileGLTFSopParams = {
		url: `${ASSETS_ROOT}/models/resources/threedscans.com/eagle.glb`,
		draco: true,
		matrixAutoUpdate: false,
	};
	static override type(): Readonly<'fileGLTF'> {
		return 'fileGLTF';
	}

	override async cook(inputCoreGroups: CoreGroup[], params: FileGLTFSopParams): Promise<CoreGroup> {
		if (this._node) {
			Poly.blobs.clearBlobsForNode(this._node);
			const loader = new GLTFLoaderHandler(params.url, this.scene(), this._node);
			const result = await loader.load({
				draco: params.draco,
				node: this._node,
			});
			if (result) {
				const processedObjects = this._onLoad(result, params);
				return this.createCoreGroupFromObjects(processedObjects);
			}
		}
		return this.createCoreGroupFromObjects([]);
	}

	private _onLoad(objects: Object3D[], params: FileGLTFSopParams) {
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
