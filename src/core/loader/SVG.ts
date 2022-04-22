import {SVGLoader, SVGResult, StrokeStyle} from '../../modules/three/examples/jsm/loaders/SVGLoader';
import {Color} from 'three';
import {Group} from 'three';
import {MeshBasicMaterial} from 'three';
import {LineBasicMaterial} from 'three';
import {DoubleSide} from 'three';
import {Mesh} from 'three';
import {ShapeBufferGeometry} from 'three';
import {ShapePath} from 'three';
import {PolyScene} from '../../engine/scene/PolyScene';
import {isBooleanTrue} from '../BooleanValue';
import {CoreBaseLoader} from './_Base';
import {BaseNodeType} from '../../engine/nodes/_Base';
import {LineSegments} from 'three';
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

export class CoreSVGLoader extends CoreBaseLoader {
	constructor(url: string, scene: PolyScene, _node?: BaseNodeType) {
		super(url, scene, _node);
	}

	load(options: CoreSVGLoaderOptions): Promise<Group> {
		if (this._node) {
			Poly.blobs.clearBlobsForNode(this._node);
		}
		return new Promise(async (resolve, reject) => {
			const loader = new SVGLoader(this.loadingManager);

			// let resolvedUrl = this.url; //.includes('?') ? this.url : `${this.url}?${Date.now()}`;
			// const paramUrl = this.url;
			// const blobUrl = Poly.blobs.blobUrl(resolvedUrl);
			// if (blobUrl) {
			// 	resolvedUrl = blobUrl;
			// } else {
			// 	if (resolvedUrl[0] != 'h') {
			// 		const assets_root = this.scene.assets.root();
			// 		if (assets_root) {
			// 			resolvedUrl = `${assets_root}${resolvedUrl}`;
			// 		}
			// 	}
			// }
			const url = await this._urlToLoad();

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
	parse(text: string, options: CoreSVGLoaderOptions) {
		const loader = new SVGLoader(this.loadingManager);
		const data = loader.parse(text);
		const group = this._onLoaded(data, options);
		return group;
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
		if (options.strokesWireframe) {
			const material = new LineBasicMaterial({
				color: new Color().setStyle(userData.style.stroke),
				opacity: userData.style.strokeOpacity,
				transparent: userData.style.strokeOpacity < 1,
				side: DoubleSide,
				depthWrite: false,
			});

			for (let j = 0, jl = path.subPaths.length; j < jl; j++) {
				const subPath = path.subPaths[j];

				const geometry = SVGLoader.pointsToStroke(subPath.getPoints(), userData.style);

				if (geometry) {
					const mesh = new LineSegments(geometry, material);

					group.add(mesh);
				}
			}
		} else {
			const material = new MeshBasicMaterial({
				color: new Color().setStyle(userData.style.stroke),
				opacity: userData.style.strokeOpacity,
				transparent: userData.style.strokeOpacity < 1,
				side: DoubleSide,
				depthWrite: false,
				// wireframe: options.strokesWireframe,
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
}
