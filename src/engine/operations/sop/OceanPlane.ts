import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Color} from 'three/src/math/Color';
import {Vector3} from 'three/src/math/Vector3';
import {CoreTransform} from '../../../core/Transform';
import {PlaneGeometry} from 'three/src/geometries/PlaneGeometry';
import {IUniformsWithTime} from '../../scene/utils/UniformsController';
import {TypedNodePathParamValue} from '../../../core/Walker';
import {NodeContext} from '../../poly/NodeContext';
import {isBooleanTrue} from '../../../core/Type';
import {Poly} from '../../Poly';
import {Water, WaterOptions} from '../../../modules/core/objects/Water';
interface OceanPlaneSopParams extends DefaultOperationParams {
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

	protected _coreTransform = new CoreTransform();
	async cook(input_contents: CoreGroup[], params: OceanPlaneSopParams) {
		const renderer = await Poly.renderersController.firstRenderer();
		if (!renderer) {
			return this.createCoreGroupFromObjects([]);
		}

		const scene = this.scene().threejsScene();
		const waterOptions: WaterOptions = {scene, renderer, ...params, ...DEFAULT_PARAMS};
		const water = this._water(waterOptions);
		const material = water.material;
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
		// this._coreTransform.rotateGeometry(object.geometry, params.direction, DEFAULT_UP);
		// const water = new Water(waterGeometry, {
		// 	textureWidth: 512,
		// 	textureHeight: 512,
		// 	waterNormals: new TextureLoader().load('/clients/me/waternormals.jpg', function (texture) {
		// 		console.log(texture);
		// 		texture.wrapS = texture.wrapT = RepeatWrapping;
		// 	}),
		// 	sunDirection: new Vector3(),
		// 	sunColor: 0xffffff,
		// 	waterColor: 0x001e0f,
		// 	distortionScale: 3.7,
		// 	// fog: scene.fog !== undefined
		// });
		// water.rotation.x = -Math.PI / 2;
		// water.updateMatrix();
		// water.matrixAutoUpdate = false;
		// this._coreTransform.rotateObject(reflector, DEFAULT_UP, params.direction);

		return this.createCoreGroupFromObjects([water]);
	}

	private __water__: Water | undefined;
	private _water(params: WaterOptions) {
		return (this.__water__ = this.__water__ || this._createWaterObject(params));
	}
	private _createWaterObject(params: WaterOptions) {
		const waterGeometry = new PlaneGeometry(10000, 10000);
		const water = new Water(waterGeometry, params);
		water.rotation.x = -Math.PI / 2;
		// water.updateMatrix();
		// water.matrixAutoUpdate = false;

		this.scene().uniformsController.addTimeDependentUniformOwner(
			`oceanPlane-${water.uuid}`,
			water.material.uniforms as IUniformsWithTime
		);

		return water;
	}
}
