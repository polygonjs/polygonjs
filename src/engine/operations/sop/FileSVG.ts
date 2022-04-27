import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Mesh} from 'three';
import {BufferGeometry} from 'three';
import {Object3D} from 'three';
import {ASSETS_ROOT} from '../../../core/loader/AssetsUtils';
import {CoreSVGLoader} from '../../../core/loader/SVG';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';

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
export class FileSVGSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: SvgSopParams = {
		url: DEFAULT_URL,
		drawFillShapes: true,
		fillShapesWireframe: false,
		drawStrokes: true,
		strokesWireframe: false,
	};
	static override type(): Readonly<SopTypeFile.FILE_SVG> {
		return SopTypeFile.FILE_SVG;
	}

	override cook(input_contents: CoreGroup[], params: SvgSopParams): Promise<CoreGroup> {
		const loader = new CoreSVGLoader(params.url, this._node);

		return new Promise(async (resolve) => {
			const group = await loader.load(params);

			for (let child of group.children) {
				this._ensure_geometry_has_index(child);
			}

			resolve(this.createCoreGroupFromObjects(group.children));
		});
	}

	private _ensure_geometry_has_index(object: Object3D) {
		const mesh = object as Mesh;
		const geometry = mesh.geometry;
		if (geometry) {
			this.createIndexIfNone(geometry as BufferGeometry);
		}
	}
}