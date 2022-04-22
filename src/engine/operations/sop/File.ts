import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Mesh} from 'three';
import {BufferGeometry} from 'three';
import {Object3D} from 'three';
import {CoreLoaderGeometry, GeometryFormat} from '../../../core/loader/Geometry';
import {ASSETS_ROOT} from '../../../core/loader/AssetsUtils';
import {PolyScene} from '../../scene/PolyScene';
import {BaseNodeType} from '../../nodes/_Base';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface FileSopParams extends DefaultOperationParams {
	url: string;
	format: string;
	matrixAutoUpdate: boolean;
}

export class FileSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: FileSopParams = {
		url: `${ASSETS_ROOT}/models/wolf.obj`,
		format: GeometryFormat.AUTO,
		matrixAutoUpdate: false,
	};
	static override type(): Readonly<'file'> {
		return 'file';
	}

	static loader(params: FileSopParams, scene: PolyScene, node: BaseNodeType) {
		return new CoreLoaderGeometry({url: params.url, format: params.format as GeometryFormat}, scene, node);
	}

	override cook(input_contents: CoreGroup[], params: FileSopParams): CoreGroup | Promise<CoreGroup> {
		if (!this._node) {
			return this.createCoreGroupFromObjects([]);
		}
		const loader = FileSopOperation.loader(params, this.scene(), this._node);

		return new Promise((resolve) => {
			loader.load(
				(objects: Object3D[]) => {
					const new_objects = this._onLoad(objects, params);
					resolve(this.createCoreGroupFromObjects(new_objects));
				},
				(message: string) => {
					this._onError(message, params);
				}
			);
		});
	}
	// clearLoadedBlob(params: FileSopParams) {
	// 	const loader = FileSopOperation.loader(params, this.scene(), this._node);
	// 	loader.deregisterUrl();
	// }

	private _onLoad(objects: Object3D[], params: FileSopParams) {
		// .flat() is overzealous and could break the hierarchy
		// objects = objects.flat();

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
	private _onError(message: string, params: FileSopParams) {
		this.states?.error.set(`could not load geometry from ${params.url} (${message})`);
	}

	private _ensureGeometryHasIndex(object: Object3D) {
		const mesh = object as Mesh;
		const geometry = mesh.geometry;
		if (geometry) {
			this.createIndexIfNone(geometry as BufferGeometry);
		}
	}
}
