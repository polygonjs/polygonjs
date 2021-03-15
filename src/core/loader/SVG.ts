import {SVGLoader, SVGResult, StrokeStyle} from '../../modules/three/examples/jsm/loaders/SVGLoader';
import {Color} from 'three/src/math/Color';
import {Group} from 'three/src/objects/Group';
import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
import {DoubleSide} from 'three/src/constants';
import {Mesh} from 'three/src/objects/Mesh';
import {ShapeBufferGeometry} from 'three/src/geometries/ShapeGeometry';
import {ShapePath} from 'three/src/extras/core/ShapePath';
import {PolyScene} from '../../engine/scene/PolyScene';
import {isBooleanTrue} from '../BooleanValue';
import {Poly} from '../../engine/Poly';

interface CoreSVGLoaderOptions {
	// fill
	drawFillShapes: boolean;
	fillShapesWireframe: boolean;
	// strokes
	drawStrokes: boolean;
	strokesWireframe: boolean;
}

interface StrokeStyleExtended extends StrokeStyle {
	fill: string;
	fillOpacity: number;
	stroke: string;
	strokeOpacity: number;
}
interface SVGPathUserData {
	style: StrokeStyleExtended;
}

export class CoreSVGLoader {
	constructor(private url: string, private scene: PolyScene) {}

	load(options: CoreSVGLoaderOptions): Promise<Group> {
		return new Promise((resolve, reject) => {
			const loader = new SVGLoader();

			let url = this.url; //.includes('?') ? this.url : `${this.url}?${Date.now()}`;
			const blobUrl = Poly.blobs.blobUrl(url);
			if (blobUrl) {
				url = blobUrl;
			} else {
				if (url[0] != 'h') {
					const assets_root = this.scene.assets.root();
					if (assets_root) {
						url = `${assets_root}${url}`;
					}
				}
			}

			loader.load(url, (data) => {
				try {
					const group = this._onLoaded(data, options);
					resolve(group);
				} catch (err) {
					reject([]);
				}
			});
		});
	}

	private _onLoaded(data: SVGResult, options: CoreSVGLoaderOptions) {
		const paths = data.paths;

		const group = new Group();

		for (let i = 0; i < paths.length; i++) {
			const path = paths[i];

			const userData: SVGPathUserData = (path as any).userData;
			const fillColor = userData.style.fill;
			if (isBooleanTrue(options.drawFillShapes) && fillColor !== undefined && fillColor !== 'none') {
				this._drawShapes(group, path, options);
			}

			const strokeColor = userData.style.stroke;

			if (isBooleanTrue(options.drawStrokes) && strokeColor !== undefined && strokeColor !== 'none') {
				this._drawStrokes(group, path, options);
			}
		}

		return group;
	}

	private _drawShapes(group: Group, path: ShapePath, options: CoreSVGLoaderOptions) {
		const userData: SVGPathUserData = (path as any).userData;
		const material = new MeshBasicMaterial({
			color: new Color().setStyle(userData.style.fill),
			opacity: userData.style.fillOpacity,
			transparent: userData.style.fillOpacity < 1,
			side: DoubleSide,
			depthWrite: false,
			wireframe: options.fillShapesWireframe,
		});

		const shapes = path.toShapes(true);

		for (let j = 0; j < shapes.length; j++) {
			const shape = shapes[j];

			const geometry = new ShapeBufferGeometry(shape);
			const mesh = new Mesh(geometry, material);

			group.add(mesh);
		}
	}

	private _drawStrokes(group: Group, path: ShapePath, options: CoreSVGLoaderOptions) {
		const userData: SVGPathUserData = (path as any).userData;
		const material = new MeshBasicMaterial({
			color: new Color().setStyle(userData.style.stroke),
			opacity: userData.style.strokeOpacity,
			transparent: userData.style.strokeOpacity < 1,
			side: DoubleSide,
			depthWrite: false,
			wireframe: options.strokesWireframe,
		});

		for (let j = 0, jl = path.subPaths.length; j < jl; j++) {
			const subPath = path.subPaths[j];

			const geometry = SVGLoader.pointsToStroke(subPath.getPoints(), userData.style);

			if (geometry) {
				const mesh = new Mesh(geometry, material);

				group.add(mesh);
			}
		}
	}
}
