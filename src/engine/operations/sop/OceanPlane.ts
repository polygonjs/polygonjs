import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Color} from 'three/src/math/Color';
import {Vector3} from 'three/src/math/Vector3';
import {CoreTransform} from '../../../core/Transform';
// import {PlaneGeometry} from 'three/src/geometries/PlaneGeometry';
import {IUniformsWithTime} from '../../scene/utils/UniformsController';
import {TypedNodePathParamValue} from '../../../core/Walker';
import {NodeContext} from '../../poly/NodeContext';
import {isBooleanTrue} from '../../../core/Type';
import {Poly} from '../../Poly';
import {Water, WaterOptions} from '../../../modules/core/objects/Water';
import {TransformResetMode, TransformResetSopOperation, TRANSFORM_RESET_MODES} from './TransformReset';
interface OceanPlaneSopParams extends DefaultOperationParams {
	direction: Vector3;
	sunDirection: Vector3;
	sunColor: Color;
	waterColor: Color;
	size: number;
	distortionScale: number;
	timeScale: number;
	normals: TypedNodePathParamValue;
	renderReflection: boolean;
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
	static readonly DEFAULT_PARAMS: OceanPlaneSopParams = {
		direction: new Vector3(0, 1, 0),
		sunDirection: new Vector3(1, 1, 1),
		sunColor: new Color(1, 1, 1),
		waterColor: new Color(0x001e0f),
		distortionScale: 1,
		timeScale: 1,
		size: 10,
		normals: new TypedNodePathParamValue(''),
		renderReflection: true,
	};

	static type(): Readonly<'oceanPlane'> {
		return 'oceanPlane';
	}

	private _transformResetOptions: TransformResetSopOperation | undefined;
	protected _coreTransform = new CoreTransform();
	async cook(inputCoreGroups: CoreGroup[], params: OceanPlaneSopParams) {
		this._transformResetOptions = this._transformResetOptions || new TransformResetSopOperation(this._scene);
		const transformResetMode = TRANSFORM_RESET_MODES.indexOf(TransformResetMode.PROMOTE_GEO_TO_OBJECT);
		const inputCoreGroup = this._transformResetOptions.cook(inputCoreGroups, {mode: transformResetMode});

		const renderer = await Poly.renderersController.waitForRenderer();
		if (!renderer) {
			console.warn('no renderer found');
			return this.createCoreGroupFromObjects([]);
		}

		const objects = inputCoreGroup.objectsWithGeo();
		const waterObjects: Water[] = [];
		const scene = this.scene().threejsScene();
		for (let object of objects) {
			Water.rotateGeometry(object.geometry, params.direction);
			const waterOptions: WaterOptions = {scene, renderer, ...params, ...DEFAULT_PARAMS};
			// const water = this._water(waterOptions, inputCoreGroup);
			const water = new Water(object.geometry, waterOptions);
			waterObjects.push(water);
			// since the object currently needs to be rotated for reflections to work
			// any input geometry should be facing the z axis.
			//
			// water.rotation.x = -Math.PI / 2;
			water.matrixAutoUpdate = false;
			water.position.copy(object.position);
			water.rotation.copy(object.rotation);
			water.scale.copy(object.scale);
			water.updateMatrix();
			Water.compensateGeometryRotation(water, params.direction);
			//

			// water.updateMatrix();
			// water.matrixAutoUpdate = false;
			this.scene().uniformsController.addTimeDependentUniformOwner(
				`oceanPlane-${water.uuid}`,
				water.material.uniforms as IUniformsWithTime
			);
			const material = water.material;
			material.uniforms.direction.value.copy(params.direction);
			material.uniforms.sunDirection.value.copy(params.sunDirection);
			material.uniforms.sunColor.value.copy(params.sunColor);
			material.uniforms.waterColor.value.copy(params.waterColor);
			material.uniforms.distortionScale.value = params.distortionScale;
			material.uniforms.timeScale.value = params.timeScale;
			material.uniforms.size.value = params.size;

			water.setReflectionActive(isBooleanTrue(params.renderReflection));

			const normalsNode = params.normals.nodeWithContext(NodeContext.COP, this.states?.error);
			if (normalsNode) {
				if (normalsNode.isDirty()) {
					await normalsNode.compute();
				}
				const texture = normalsNode.containerController.container().texture();
				material.uniforms.normalSampler.value = texture;
			} else {
				material.uniforms.normalSampler.value = null;
			}
		}

		return this.createCoreGroupFromObjects(waterObjects);
	}

	// private __water__: Water | undefined;
	// private _water(params: WaterOptions, coreGroup?: CoreGroup) {
	// 	// return (this.__water__ = this.__water__ || this._createWaterObject(params, coreGroup));
	// 	return this._createWaterObject(params, coreGroup);
	// }
	// private _createWaterObject(params: WaterOptions, coreGroup?: CoreGroup) {
	// 	let waterGeometry = coreGroup ? coreGroup.geometries()[0] : null;
	// 	waterGeometry = waterGeometry || new PlaneGeometry(10000, 10000);
	// 	const water = new Water(waterGeometry, params);

	// 	return water;
	// }
}
