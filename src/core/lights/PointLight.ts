import {ParamConfig} from '../../engine/nodes/utils/params/ParamsConfig';
import {Constructor, Number2, Number3} from '../../types/GlobalTypes';
// import {ColorConversion} from '../Color';
import {Vector2, Color, Mesh, Vector3, PointLight, SphereGeometry} from 'three';
import {LIGHT_HELPER_MAT} from './_Base';
import {DefaultOperationParams} from '../operations/_Base';

export interface PointLightParams extends DefaultOperationParams {
	color: Color;
	intensity: number;
	decay: number;
	distance: number;
	name: string;
	//
	castShadow: boolean;
	shadowAutoUpdate: boolean;
	shadowUpdateOnNextRender: boolean;
	shadowRes: Vector2;
	shadowBias: number;
	shadowNear: number;
	shadowFar: number;
	// debugShadow: boolean; // removed (see spotlight for explanation)
	//
	showHelper: boolean;
	helperSize: number;
	//
	raymarchingPenumbra: number;
}

export const DEFAULT_POINT_LIGHT_PARAMS: PointLightParams = {
	color: new Color(1, 1, 1),
	intensity: 2,
	decay: 2,
	distance: 100,
	name: 'pointLight',
	//
	castShadow: false,
	shadowAutoUpdate: true,
	shadowUpdateOnNextRender: false,
	shadowRes: new Vector2(1024, 1024),
	shadowBias: 0.0001,
	shadowNear: 1,
	shadowFar: 100,
	// debugShadow: false,
	//
	showHelper: false,
	helperSize: 1,
	//
	raymarchingPenumbra: 0, // keep as 0 by default since it's more performant
};
const DEFAULT = DEFAULT_POINT_LIGHT_PARAMS;

export function PointLightParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		light = ParamConfig.FOLDER();
		/** @param light color */
		color = ParamConfig.COLOR(DEFAULT.color.toArray() as Number3, {
			// conversion: ColorConversion.SRGB_TO_LINEAR,
		});
		/** @param light intensity */
		intensity = ParamConfig.FLOAT(DEFAULT.intensity, {
			range: [0, 10],
			rangeLocked: [true, false],
		});
		/** @param light decay */
		decay = ParamConfig.FLOAT(DEFAULT.decay, {
			range: [0, 10],
			rangeLocked: [true, false],
		});
		/** @param light distance */
		distance = ParamConfig.FLOAT(DEFAULT.distance, {
			range: [0, 100],
			rangeLocked: [true, false],
		});
		// helper
		/** @param toggle to show helper */
		showHelper = ParamConfig.BOOLEAN(DEFAULT.showHelper);
		/** @param helper size */
		helperSize = ParamConfig.FLOAT(1, {visibleIf: {showHelper: 1}});
		/** @param light name */
		name = ParamConfig.STRING('`$OS`');

		// shadows
		shadow = ParamConfig.FOLDER();
		/** @param toggle to cast shadows */
		castShadow = ParamConfig.BOOLEAN(DEFAULT.castShadow);
		/** @param toggle off if the shadows do not need to be regenerated */
		shadowAutoUpdate = ParamConfig.BOOLEAN(DEFAULT.shadowAutoUpdate, {
			visibleIf: {castShadow: 1},
		});
		/** @param press button to update the shadows on next render */
		shadowUpdateOnNextRender = ParamConfig.BOOLEAN(DEFAULT.shadowUpdateOnNextRender, {
			visibleIf: {castShadow: 1, shadowAutoUpdate: 0},
		});
		/** @param shadow res */
		shadowRes = ParamConfig.VECTOR2(DEFAULT.shadowRes.toArray() as Number2, {visibleIf: {castShadow: 1}});
		/** @param shadow bias */
		shadowBias = ParamConfig.FLOAT(DEFAULT.shadowBias, {
			visibleIf: {castShadow: 1},
			range: [-0.01, 0.01],
			rangeLocked: [false, false],
		});
		/** @param shadow camera near */
		shadowNear = ParamConfig.FLOAT(DEFAULT.shadowNear, {visibleIf: {castShadow: 1}});
		/** @param shadow camera far */
		shadowFar = ParamConfig.FLOAT(DEFAULT.shadowFar, {visibleIf: {castShadow: 1}});
		/** @param display shadow on a plane behind the light */
		// debugShadow = ParamConfig.BOOLEAN(DEFAULT.debugShadow, {
		// 	visibleIf: {castShadow: 1},
		// });

		// raymarching
		raymarching = ParamConfig.FOLDER();
		/** @param this affects the shadows cast inside raymarchingBuilder materials */
		raymarchingPenumbra = ParamConfig.FLOAT(DEFAULT.raymarchingPenumbra);
	};
}

interface Options {
	helperSize: number;
	light: PointLight;
}

export class CorePointLightHelper {
	private _material = LIGHT_HELPER_MAT.clone();
	createObject() {
		return new Mesh();
	}
	createAndBuildObject(options: Options) {
		const object = this.createObject();
		this.buildHelper(object);
		this.update(object, options);
		return object;
	}

	buildHelper(object: Mesh) {
		const size = 1;
		object.geometry = new SphereGeometry(size, 4, 2);
		object.matrixAutoUpdate = false;
		object.material = this._material;
		return object;
	}

	private _matrixScale = new Vector3(1, 1, 1);
	update(object: Mesh, options: Options) {
		const size = options.helperSize;
		this._matrixScale.set(size, size, size);
		object.matrix.identity();
		object.matrix.scale(this._matrixScale);

		this._material.color.copy(options.light.color);
	}
}
