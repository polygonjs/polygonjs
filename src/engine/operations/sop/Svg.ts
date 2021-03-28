import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Mesh} from 'three/src/objects/Mesh';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Object3D} from 'three/src/core/Object3D';
import {ASSETS_ROOT} from '../../../core/loader/AssetsUtils';
import {CoreSVGLoader} from '../../../core/loader/SVG';

interface SvgSopParams extends DefaultOperationParams {
	url: string;
	// fill
	drawFillShapes: boolean;
	fillShapesWireframe: boolean;
	// strokes
	drawStrokes: boolean;
	strokesWireframe: boolean;
}

const DEFAULT_URL = `${ASSETS_ROOT}/models/svg/tiger.svg`;
export class SvgSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: SvgSopParams = {
		url: DEFAULT_URL,
		drawFillShapes: true,
		fillShapesWireframe: false,
		drawStrokes: true,
		strokesWireframe: false,
	};
	static type(): Readonly<'svg'> {
		return 'svg';
	}

	cook(input_contents: CoreGroup[], params: SvgSopParams): Promise<CoreGroup> {
		const loader = new CoreSVGLoader(params.url, this.scene(), this._node);

		return new Promise(async (resolve) => {
			const group = await loader.load(params);

			for (let child of group.children) {
				this._ensure_geometry_has_index(child);
			}

			resolve(this.create_core_group_from_objects(group.children));
		});
	}

	private _ensure_geometry_has_index(object: Object3D) {
		const mesh = object as Mesh;
		const geometry = mesh.geometry;
		if (geometry) {
			this.create_index_if_none(geometry as BufferGeometry);
		}
	}
}
