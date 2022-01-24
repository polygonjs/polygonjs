import {ParamConfig} from '../../engine/nodes/utils/params/ParamsConfig';
import {Constructor, Number3} from '../../types/GlobalTypes';
import {ColorConversion} from '../Color';
import {Mesh} from 'three/src/objects/Mesh';
import {DefaultOperationParams} from '../operations/_Base';
import {Color} from 'three/src/math/Color';
import {Vector2} from 'three/src/math/Vector2';
import {DirectionalLight} from 'three/src/lights/DirectionalLight';
import {LineBasicMaterial} from 'three/src/materials/LineBasicMaterial';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {CameraHelper} from 'three/src/helpers/CameraHelper';
import {Line} from 'three/src/objects/Line';

export interface DirectionalLightParams extends DefaultOperationParams {
	color: Color;
	intensity: number;
	distance: number;
	//
	showHelper: boolean;
	//
	castShadow: boolean;
	shadowRes: Vector2;
	shadowSize: Vector2;
	shadowBias: number;
	shadowRadius: number;
}

export const DEFAULT_DIRECTIONAL_LIGHT_PARAMS: DirectionalLightParams = {
	color: new Color(1, 1, 1),
	intensity: 1,
	distance: 100,
	//
	showHelper: false,
	//
	castShadow: false,
	shadowRes: new Vector2(1024, 1024),
	shadowSize: new Vector2(2, 2),
	shadowBias: 0.001,
	shadowRadius: 0,
};
const DEFAULT = DEFAULT_DIRECTIONAL_LIGHT_PARAMS;

export function DirectionalLightParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		light = ParamConfig.FOLDER();
		/** @param light color */
		color = ParamConfig.COLOR(DEFAULT.color.toArray() as Number3, {
			conversion: ColorConversion.SRGB_TO_LINEAR,
		});
		/** @param light intensity */
		intensity = ParamConfig.FLOAT(DEFAULT.intensity);
		/** @param light distance */
		distance = ParamConfig.FLOAT(DEFAULT.distance, {range: [0, 100]});
		// helper
		/** @param toggle to show helper */
		showHelper = ParamConfig.BOOLEAN(DEFAULT.showHelper);

		// shadows
		shadow = ParamConfig.FOLDER();
		/** @param toggle on to cast shadows */
		castShadow = ParamConfig.BOOLEAN(DEFAULT.castShadow);
		/** @param shadow resolution */
		shadowRes = ParamConfig.VECTOR2(DEFAULT.shadowRes.toArray(), {
			visibleIf: {castShadow: true},
		});
		/** @param shadow size */
		shadowSize = ParamConfig.VECTOR2(DEFAULT.shadowSize.toArray(), {
			visibleIf: {castShadow: true},
		});
		/** @param shadow bias */
		shadowBias = ParamConfig.FLOAT(DEFAULT.shadowBias, {
			visibleIf: {castShadow: true},
		});
		/** @param shadows radius. This only has effect when setting the ROP/WebGLRenderer's shadowMapType to VSM */
		shadowRadius = ParamConfig.FLOAT(DEFAULT.shadowRadius, {
			visibleIf: {castShadow: 1},
			range: [0, 10],
			rangeLocked: [true, false],
		});
	};
}

interface Options {
	light: DirectionalLight;
}

export class CoreDirectionalLightHelper {
	private _line_material = new LineBasicMaterial({fog: false});
	private _cameraHelper!: CameraHelper;
	private _square = new Line();
	createObject() {
		return new Mesh();
	}
	createAndBuildObject(options: Options) {
		const object = this.createObject();
		this.buildHelper(object, options.light);
		this.update(object, options);
		return object;
	}

	buildHelper(object: Mesh, light: DirectionalLight) {
		const geometry = new BufferGeometry();
		const size = 1;
		geometry.setAttribute(
			'position',
			new Float32BufferAttribute(
				[-size, size, 0, size, size, 0, size, -size, 0, -size, -size, 0, -size, size, 0],
				3
			)
		);

		this._square.geometry = geometry;
		this._square.material = this._line_material;
		this._square.rotateX(Math.PI * 0.5);
		this._square.updateMatrix();
		this._square.matrixAutoUpdate = false;

		object.add(this._square);

		this._cameraHelper = new CameraHelper(light.shadow.camera);
		this._cameraHelper.rotateX(-Math.PI * 0.5);
		this._cameraHelper.updateMatrix();
		this._cameraHelper.matrixAutoUpdate = false;
		object.add(this._cameraHelper);
	}

	update(object: Mesh, options: Options) {
		object.updateMatrix();
		this._cameraHelper.update();

		this._line_material.color.copy(options.light.color);
	}
}
