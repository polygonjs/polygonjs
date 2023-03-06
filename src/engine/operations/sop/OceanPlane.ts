import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Color} from 'three';
import {Vector3} from 'three';
import {CoreTransform} from '../../../core/Transform';
// import {PlaneGeometry} from 'three';
import {isBooleanTrue} from '../../../core/Type';
import {Water, WaterOptions} from '../../../modules/core/objects/Water';
import {TransformResetMode, TransformResetSopOperation, TRANSFORM_RESET_MODES} from './TransformReset';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
interface OceanPlaneSopParams extends DefaultOperationParams {
	direction: Vector3;
	sunDirection: Vector3;
	sunColor: Color;
	wavesHeight: number;
	waterColor: Color;
	reflectionColor: Color;
	reflectionFresnel: number;
	size: number;
	distortionScale: number;
	timeScale: number;
	renderReflection: boolean;
	normalBias: number;
	multisamples: number;
	useFog: boolean;
}

const DEFAULT_PARAMS = {
	pixelRatio: 1,
	clipBias: 0, // if clipBias is 0.03 like in BaseReflector, the bottom of the reflection appears cut out
	active: true,
	tblur: false,
	blur: 0,
	verticalBlurMult: 0,
	tblur2: false,
	blur2: 0,
	verticalBlur2Mult: 0,
};

// const DEFAULT_UP = new Vector3(0, 0, 1);

export class OceanPlaneSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: OceanPlaneSopParams = {
		direction: new Vector3(0, 1, 0),
		sunDirection: new Vector3(1, 1, 1),
		sunColor: new Color(1, 1, 1),
		wavesHeight: 1,
		waterColor: new Color(0x001e0f),
		reflectionColor: new Color(0xffffff),
		reflectionFresnel: 1,
		distortionScale: 1,
		timeScale: 1,
		size: 10,
		renderReflection: true,
		normalBias: 0.001,
		multisamples: 1,
		useFog: false,
	};

	static override type(): Readonly<'oceanPlane'> {
		return 'oceanPlane';
	}

	private _transformResetOptions: TransformResetSopOperation | undefined;
	protected _coreTransform = new CoreTransform();
	override cook(inputCoreGroups: CoreGroup[], params: OceanPlaneSopParams) {
		this._transformResetOptions = this._transformResetOptions || new TransformResetSopOperation(this._scene);
		const transformResetMode = TRANSFORM_RESET_MODES.indexOf(TransformResetMode.CENTER_GEO_RESET_OBJECT);
		const inputCoreGroup = this._transformResetOptions.cook(inputCoreGroups, {mode: transformResetMode});

		const renderer = this._node?.scene().renderersRegister.lastRegisteredRenderer();

		const objects = inputCoreGroup.threejsObjectsWithGeo();
		const waterObjects: ObjectContent<CoreObjectType>[] = [];
		const scene = this.scene().threejsScene();
		for (let object of objects) {
			Water.rotateGeometry(object.geometry, params.direction);
			const waterOptions: WaterOptions = {
				polyScene: this.scene(),
				scene,
				renderer,
				...DEFAULT_PARAMS,
				direction: params.direction,
				sunDirection: params.sunDirection,
				sunColor: params.sunColor,
				wavesHeight: params.wavesHeight,
				waterColor: params.waterColor,
				reflectionColor: params.reflectionColor,
				reflectionFresnel: params.reflectionFresnel,
				distortionScale: params.distortionScale,
				timeScale: params.timeScale,
				size: params.size,
				// renderReflection: params.renderReflection,
				normalBias: params.normalBias,
				multisamples: params.multisamples,
				useFog: params.useFog,
			};
			const water = new Water(object.geometry, waterOptions);
			waterObjects.push(water as any as ObjectContent<CoreObjectType>);
			water.matrixAutoUpdate = false;
			// make sure object attributes are up to date
			object.matrix.decompose(object.position, object.quaternion, object.scale);
			water.position.copy(object.position);
			water.rotation.copy(object.rotation);
			water.scale.copy(object.scale);
			water.updateMatrix();
			Water.compensateGeometryRotation(water, params.direction);
			//

			// water.updateMatrix();
			// water.matrixAutoUpdate = false;
			const material = water.material;
			material.uniforms.direction.value.copy(params.direction);
			material.uniforms.sunDirection.value.copy(params.sunDirection);
			material.uniforms.sunColor.value.copy(params.sunColor);
			material.uniforms.wavesHeight.value = params.wavesHeight;
			material.uniforms.waterColor.value.copy(params.waterColor);
			material.uniforms.reflectionColor.value.copy(params.reflectionColor);
			material.uniforms.reflectionFresnel.value = params.reflectionFresnel;
			material.uniforms.distortionScale.value = params.distortionScale;
			material.uniforms.timeScale.value = params.timeScale;
			material.uniforms.size.value = params.size;
			material.uniforms.normalBias.value = params.normalBias;
			water.setReflectionActive(isBooleanTrue(params.renderReflection));
		}

		return this.createCoreGroupFromObjects(waterObjects);
	}
}
