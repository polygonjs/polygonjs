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
// import {Water} from '../../../modules/three/examples/jsm/objects/Water';
import {Water} from '../../../modules/core/objects/Water';
import {isBooleanTrue} from '../../../core/Type';

interface OceanPlaneSopParams extends DefaultOperationParams {
	sunDirection: Vector3;
	sunColor: Color;
	waterColor: Color;
	size: number;
	distortionScale: number;
	distortionSpeed: number;
	normals: TypedNodePathParamValue;
	renderReflection: boolean;
}

// const DEFAULT_UP = new Vector3(0, 0, 1);

export class OceanPlaneSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: OceanPlaneSopParams = {
		sunDirection: new Vector3(1, 1, 1),
		sunColor: new Color(1, 1, 1),
		waterColor: new Color(0x001e0f),
		distortionScale: 1,
		distortionSpeed: 1,
		size: 10,
		normals: new TypedNodePathParamValue(''),
		renderReflection: true,
	};

	static type(): Readonly<'oceanPlane'> {
		return 'oceanPlane';
	}

	protected _coreTransform = new CoreTransform();
	async cook(input_contents: CoreGroup[], params: OceanPlaneSopParams) {
		const water = this.water(params);
		const material = water.material;
		material.uniforms.sunDirection.value.copy(params.sunDirection);
		material.uniforms.sunColor.value.copy(params.sunColor);
		material.uniforms.waterColor.value.copy(params.waterColor);
		material.uniforms.distortionScale.value = params.distortionScale;
		material.uniforms.timeMult.value = params.distortionSpeed;
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

	private _water: Water | undefined;
	water(params: OceanPlaneSopParams) {
		return (this._water = this._water || this._createWaterObject(params));
	}
	private _createWaterObject(params: OceanPlaneSopParams) {
		const waterGeometry = new PlaneGeometry(10000, 10000);
		const water = new Water(waterGeometry, {
			textureWidth: 512,
			textureHeight: 512,
			// waterNormals: new TextureLoader().load('/clients/me/waternormals.jpg', function (texture) {
			// 	console.log(texture);
			// 	texture.wrapS = texture.wrapT = RepeatWrapping;
			// }),
			sunDirection: params.sunDirection,
			sunColor: params.sunColor,
			waterColor: params.waterColor,
			distortionScale: params.distortionScale,
			// fog: scene.fog !== undefined
		});
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
