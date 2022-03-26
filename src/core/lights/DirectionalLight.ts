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
import {Line} from 'three/src/objects/Line';
// import {CameraHelper} from 'three/src/helpers/CameraHelper';
import {CoreCameraHelper} from '../helpers/CoreCameraHelper';
import {Group} from 'three/src/objects/Group';

export interface DirectionalLightParams extends DefaultOperationParams {
	color: Color;
	intensity: number;
	distance: number;
	//
	showHelper: boolean;
	//
	castShadow: boolean;
	shadowAutoUpdate: boolean;
	shadowUpdateOnNextRender: boolean;
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
	shadowAutoUpdate: true,
	shadowUpdateOnNextRender: false,
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
		intensity = ParamConfig.FLOAT(DEFAULT.intensity, {
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

		// shadows
		shadow = ParamConfig.FOLDER();
		/** @param toggle on to cast shadows */
		castShadow = ParamConfig.BOOLEAN(DEFAULT.castShadow);
		/** @param toggle off if the shadows do not need to be regenerated */
		shadowAutoUpdate = ParamConfig.BOOLEAN(DEFAULT.shadowAutoUpdate, {
			visibleIf: {castShadow: 1},
		});
		/** @param press button to update the shadows on next render */
		shadowUpdateOnNextRender = ParamConfig.BOOLEAN(DEFAULT.shadowUpdateOnNextRender, {
			visibleIf: {castShadow: 1, shadowAutoUpdate: 0},
		});
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

export interface DirectionalLightContainerParams {
	showHelper: boolean;
}
export class DirectionalLightContainer extends Group {
	private _light = new DirectionalLight();
	private _target = this._light.target;
	public showHelper = false;
	public override matrixAutoUpdate = false;
	constructor(options: DirectionalLightContainerParams, public readonly nodeName: string) {
		super();
		this.showHelper = options.showHelper;
		// set light pos to 0,0,1
		// in order to have it face z axis
		this._light.position.set(0, 0, 1);
		this._light.updateMatrix();
		this._target.updateMatrix();
		this._light.matrixAutoUpdate = false;
		this._target.matrixAutoUpdate = false;
		this.name = `DirectionalLightContainer_${nodeName}`;
		this._light.name = `DirectionalLight_${nodeName}`;
		this._target.name = `DirectionalLightTarget_${nodeName}`;

		this.add(this._light);
		this.add(this._target);
		this.updateHelper();
	}

	light() {
		return this._light;
	}
	override copy(source: this, recursive?: boolean): this {
		if (recursive) {
			this._light.copy(source.light());
		}
		this.position.copy(source.position);
		this.rotation.copy(source.rotation);
		this.scale.copy(source.scale);
		this.quaternion.copy(source.quaternion);
		this.matrix.copy(source.matrix);
		this.matrixWorld.copy(source.matrixWorld);
		if (recursive) {
			this.add(this._light.target);
		}
		return this as this;
	}

	override clone(recursive?: boolean): this {
		const cloned = new DirectionalLightContainer({showHelper: this.showHelper}, this.nodeName);
		cloned.copy(this);

		return cloned as this;
	}

	updateHelper() {
		if (this.showHelper) {
			this.__helper__ = this.__helper__ || new CoreDirectionalLightHelper(this);
			this.add(this.__helper__.object);
			this.__helper__.update();
		} else {
			if (this.__helper__) {
				this.remove(this.__helper__.object);
			}
		}
	}

	private __helper__: CoreDirectionalLightHelper | undefined;
}

export class CoreDirectionalLightHelper {
	public object: Mesh = new Mesh();
	private _lineMaterial = new LineBasicMaterial({fog: false});
	private _cameraHelper!: CoreCameraHelper;
	private _square = new Line();

	constructor(public container: DirectionalLightContainer) {
		this.createAndBuildObject();
	}

	createAndBuildObject() {
		this.buildHelper();
		this.update();
	}

	buildHelper() {
		const light = this.container.light();
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
		this._square.material = this._lineMaterial;
		// this._square.rotateX(Math.PI * 0.5);
		this._square.updateMatrix();
		this._square.matrixAutoUpdate = false;

		this.object.add(this._square);

		this._cameraHelper = new CoreCameraHelper(light.shadow.camera);
		// this._cameraHelper.rotateX(-Math.PI * 0.5);
		this._cameraHelper.updateMatrix();
		this._cameraHelper.matrixAutoUpdate = false;
		this.object.add(this._cameraHelper);

		this.object.name = `CoreDirectionalLightHelper_${this.container.nodeName}`;
		this._square.name = `CoreDirectionalLightHelperSquare_${this.container.nodeName}`;
		this._cameraHelper.name = `CoreDirectionalLightHelperCameraHelper_${this.container.nodeName}`;
	}

	update() {
		this.object.updateMatrix();
		this._cameraHelper.update();

		this._lineMaterial.color.copy(this.container.light().color);
	}
}
