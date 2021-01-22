import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../geometry/Group';
import {Mesh} from 'three/src/objects/Mesh';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Object3D} from 'three/src/core/Object3D';
import {CoreLoaderGeometry} from '../../loader/Geometry';
import {ASSETS_ROOT} from '../../loader/AssetsUtils';

interface FileSopParams extends DefaultOperationParams {
	url: string;
}

const DEFAULT_URL = `${ASSETS_ROOT}/models/wolf.obj`;
export class FileSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: FileSopParams = {
		url: DEFAULT_URL,
	};
	static type(): Readonly<'file'> {
		return 'file';
	}

	cook(input_contents: CoreGroup[], params: FileSopParams): Promise<CoreGroup> {
		const loader = new CoreLoaderGeometry(params.url, this.scene);

		return new Promise((resolve) => {
			loader.load(
				(objects: Object3D[]) => {
					const new_objects = this._on_load(objects);
					resolve(this.create_core_group_from_objects(new_objects));
				},
				(message: string) => {
					this._on_error(message, params);
				}
			);
		});
	}

	private _on_load(objects: Object3D[]) {
		objects = objects.flat();

		for (let object of objects) {
			object.traverse((child) => {
				this._ensure_geometry_has_index(child);
				child.matrixAutoUpdate = false;
			});
		}
		return objects;
	}
	private _on_error(message: string, params: FileSopParams) {
		this.states?.error.set(`could not load geometry from ${params.url} (${message})`);
	}

	private _ensure_geometry_has_index(object: Object3D) {
		const mesh = object as Mesh;
		const geometry = mesh.geometry;
		if (geometry) {
			this.create_index_if_none(geometry as BufferGeometry);
		}
	}
}
