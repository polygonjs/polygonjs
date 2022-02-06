import {ParamConfig} from '../../engine/nodes/utils/params/ParamsConfig';
import {Constructor, Number3} from '../../types/GlobalTypes';
import {ColorConversion} from '../Color';
import {DefaultOperationParams} from '../operations/_Base';
import {Color} from 'three/src/math/Color';

export interface AreaLightParams extends DefaultOperationParams {
	color: Color;
	intensity: number;
	width: number;
	height: number;
	showHelper: boolean;
}

export const DEFAULT_AREA_LIGHT_PARAMS: AreaLightParams = {
	color: new Color(1, 1, 1),
	intensity: 1,
	width: 1,
	height: 1,
	showHelper: true,
};
const DEFAULT = DEFAULT_AREA_LIGHT_PARAMS;

export function AreaLightParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		light = ParamConfig.FOLDER();
		/** @param light color */
		color = ParamConfig.COLOR(DEFAULT.color.toArray() as Number3, {
			conversion: ColorConversion.SRGB_TO_LINEAR,
		});
		/** @param light intensity */
		intensity = ParamConfig.FLOAT(DEFAULT.intensity, {
			range: [0, 10],
			rangeLocked: [true, false],
		});
		/** @param grid width */
		width = ParamConfig.FLOAT(DEFAULT.width, {
			range: [0, 10],
			rangeLocked: [true, false],
		});
		/** @param grid height */
		height = ParamConfig.FLOAT(DEFAULT.height, {
			range: [0, 10],
			rangeLocked: [true, false],
		});
		// helper
		/** @param toggle on to show helper */
		showHelper = ParamConfig.BOOLEAN(DEFAULT.showHelper);
	};
}

import {BackSide} from 'three/src/constants';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {Line} from 'three/src/objects/Line';
import {LineBasicMaterial} from 'three/src/materials/LineBasicMaterial';
import {Mesh} from 'three/src/objects/Mesh';
import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
import {RectAreaLight} from 'three/src/lights/RectAreaLight';

/**
 *  This helper must be added as a child of the light
 */
function createGeometry() {
	const geometry = new BufferGeometry();
	const positions = [1, 1, 0, -1, 1, 0, -1, -1, 0, 1, -1, 0, 1, 1, 0];
	geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
	geometry.computeBoundingSphere();
	return geometry;
}

function createGeo2() {
	const positions = [1, 1, 0, -1, 1, 0, -1, -1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0];

	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
	geometry.computeBoundingSphere();
	return geometry;
}

export class CoreRectAreaLightHelper extends Line {
	public override geometry = createGeometry();
	public override material = new LineBasicMaterial({fog: false});
	public override type = 'RectAreaLightHelper';
	public _childMesh = new Mesh(createGeo2(), new MeshBasicMaterial({side: BackSide, fog: false}));

	constructor(public light: RectAreaLight) {
		super();

		this.add(this._childMesh);
	}

	update() {
		this.scale.set(0.5 * this.light.width, 0.5 * this.light.height, 1);

		this.material.color.copy(this.light.color).multiplyScalar(this.light.intensity);

		// prevent hue shift
		const c = this.material.color;
		const max = Math.max(c.r, c.g, c.b);
		if (max > 1) c.multiplyScalar(1 / max);

		this._childMesh.material.color.copy(this.material.color);

		// ignore world scale on light
		this.matrixWorld.extractRotation(this.light.matrixWorld).scale(this.scale).copyPosition(this.light.matrixWorld);

		this._childMesh.matrixWorld.copy(this.matrixWorld);
	}

	dispose() {
		this.geometry.dispose();
		this.material.dispose();
		this._childMesh.geometry.dispose();
		this._childMesh.material.dispose();
	}
	override clone(recursive?: boolean): this {
		const cloned = new CoreRectAreaLightHelper(this.light) as this;
		cloned.updateMatrixWorld();
		return cloned;
	}
}
