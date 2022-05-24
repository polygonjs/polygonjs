import {BufferGeometry, Float32BufferAttribute, LineBasicMaterial, LineSegments, Mesh, Object3D, Vector3} from 'three';
import type {SpotLightContainer} from '../SpotLight';

export interface CoreSpotLightHelperParams {
	helperSize: number;
}
export interface UpdateSpotLightConeObjectOptions {
	distance: number;
	sizeMult: number;
	angle: number;
}

export class CoreSpotLightHelper {
	public object: Mesh = new Mesh();
	private _cone = new LineSegments();
	private _lineMaterial = new LineBasicMaterial({fog: false});
	constructor(public container: SpotLightContainer) {
		this.object.name = `CoreSpotLightHelper_${this.container.nodeName}`;
		this.object.matrixAutoUpdate = false;
		this.createAndBuildObject({helperSize: 1});
	}

	createAndBuildObject(params: CoreSpotLightHelperParams) {
		this.buildHelper();
		this.update(params);
	}

	buildHelper() {
		this._cone.geometry = CoreSpotLightHelper._buildConeGeometry();
		this._cone.material = this._lineMaterial;
		this._cone.matrixAutoUpdate = false;
		this._cone.name = `CoreSpotLightHelperCone_${this.container.nodeName}`;

		this.object.add(this._cone);
	}

	update(params: CoreSpotLightHelperParams) {
		const light = this.container.light();
		CoreSpotLightHelper.transformObject(this._cone, {
			sizeMult: params.helperSize,
			distance: light.distance,
			angle: light.angle,
		});

		this._lineMaterial.color.copy(light.color);
	}

	private static _matrixScale = new Vector3();
	static transformObject(object: Object3D, options: UpdateSpotLightConeObjectOptions) {
		const coneLength = (options.distance ? options.distance : 1000) * options.sizeMult;
		const coneWidth = coneLength * Math.tan(options.angle);

		this._matrixScale.set(coneWidth, coneWidth, coneLength);
		object.matrix.identity();
		object.matrix.makeRotationX(Math.PI * 1);
		object.matrix.scale(this._matrixScale);
	}
	private static _buildConeGeometry() {
		const geometry = new BufferGeometry();

		const positions = [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, -1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, -1, 1];

		for (let i = 0, j = 1, l = 32; i < l; i++, j++) {
			const p1 = (i / l) * Math.PI * 2;
			const p2 = (j / l) * Math.PI * 2;

			positions.push(Math.cos(p1), Math.sin(p1), 1, Math.cos(p2), Math.sin(p2), 1);
		}

		geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
		return geometry;
	}
}
