import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Mesh} from 'three/src/objects/Mesh';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Object3D} from 'three/src/core/Object3D';
import {CoreLoaderGeometry, GeometryFormat} from '../../../core/loader/Geometry';
import {ASSETS_ROOT} from '../../../core/loader/AssetsUtils';
import {PolyScene} from '../../index_all';
import {BaseNodeType} from '../../nodes/_Base';

interface FileSopParams extends DefaultOperationParams {
	url: string;
	format: string;
}

export class FileSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: FileSopParams = {
		url: `${ASSETS_ROOT}/models/wolf.obj`,
		format: GeometryFormat.AUTO,
	};
	static type(): Readonly<'file'> {
		return 'file';
	}

	static loader(params: FileSopParams, scene: PolyScene, node?: BaseNodeType) {
		return new CoreLoaderGeometry({url: params.url, format: params.format as GeometryFormat}, scene, node);
	}

	cook(input_contents: CoreGroup[], params: FileSopParams): Promise<CoreGroup> {
		const loader = FileSopOperation.loader(params, this.scene(), this._node);

		return new Promise((resolve) => {
			loader.load(
				(objects: Object3D[]) => {
					const new_objects = this._onLoad(objects);
					resolve(this.createCoreGroupFromObjects(new_objects));
				},
				(message: string) => {
					this._onError(message, params);
				}
			);
		});
	}
	clearLoadedBlob(params: FileSopParams) {
		const loader = FileSopOperation.loader(params, this.scene(), this._node);
		loader.deregisterUrl();
	}

	private _onLoad(objects: Object3D[]) {
		objects = objects.flat();

		for (let object of objects) {
			object.traverse((child) => {
				this._ensureGeometryHasIndex(child);
				child.matrixAutoUpdate = false;
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
