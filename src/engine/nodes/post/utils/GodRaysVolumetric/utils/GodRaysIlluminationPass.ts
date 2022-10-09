import {GODRAYS_RESOLUTION_SCALE} from './GodRaysConstant';
import {GodraysPassParams} from './GodRaysPassParams';
import {GodraysPassProps} from './GodRaysPassProps';
import {
	Quaternion,
	Vector3,
	BasicDepthPacking,
	PointLight,
	Plane,
	DirectionalLight,
	Frustum,
	Matrix4,
	WebGLRenderer,
	WebGLRenderTarget,
	Texture,
	DepthPackingStrategies,
} from 'three';
import {Pass, Resizable} from 'postprocessing';
import {GodraysMaterial} from './GodRaysMaterial';
const q = new Quaternion();
const s = new Vector3();

export class GodraysIllumPass extends Pass implements Resizable {
	private material!: GodraysMaterial;
	private shadowMapSet = false;
	private props: GodraysPassProps;
	private lastParams: GodraysPassParams;
	private lightWorldPos = new Vector3();

	constructor(props: GodraysPassProps, private params: GodraysPassParams) {
		super('GodraysPass');

		this.props = props;
		this.lastParams = params;
		this.material = new GodraysMaterial(this.props);

		this.updateUniforms(this.props, this.params);

		this.fullscreenMaterial = this.material;
	}

	override setSize(width: number, height: number): void {
		this.material.uniforms.resolution.value.set(
			Math.ceil(width * GODRAYS_RESOLUTION_SCALE),
			Math.ceil(height * GODRAYS_RESOLUTION_SCALE)
		);
	}

	override render(
		renderer: WebGLRenderer,
		_inputBuffer: WebGLRenderTarget,
		outputBuffer: WebGLRenderTarget,
		_deltaTime?: number | undefined,
		_stencilTest?: boolean | undefined
	): void {
		if (!this.shadowMapSet && this.props.light.shadow.map?.texture) {
			this.updateUniforms(this.props, this.lastParams);
			this.shadowMapSet = true;
		}
		this._updateLightPosition(this.props);

		renderer.setRenderTarget(outputBuffer);
		renderer.render(this.scene, this.camera);
	}

	override setDepthTexture(depthTexture: Texture, depthPacking?: DepthPackingStrategies | undefined): void {
		this.material.uniforms.sceneDepth.value = depthTexture;
		if (depthPacking && depthPacking !== BasicDepthPacking) {
			throw new Error('Only BasicDepthPacking is supported');
		}
	}
	private _updateLightPosition({light, camera}: GodraysPassProps) {
		light.matrixWorld.decompose(this.lightWorldPos, q, s);
		// updated from https://github.com/Ameobea/three-good-godrays,
		// so that the point light world position is used
		const uniforms = this.material.uniforms;
		uniforms.lightPos.value = this.lightWorldPos; //light.position;
	}

	public updateUniforms({light, camera}: GodraysPassProps, params: GodraysPassParams): void {
		const shadow = light.shadow;
		if (!shadow) {
			throw new Error('Light used for godrays must have shadow');
		}

		const shadowMap = shadow.map?.texture ?? null;
		const mapSize = shadow.map?.height ?? 1;

		const uniforms = this.material.uniforms;
		uniforms.density.value = params.density;
		uniforms.maxDensity.value = params.maxDensity;

		uniforms.cameraPos.value = camera.position;
		uniforms.lightCameraProjectionMatrix.value = light.shadow.camera.projectionMatrix;
		uniforms.lightCameraMatrixWorldInverse.value = light.shadow.camera.matrixWorldInverse;
		uniforms.cameraProjectionMatrixInv.value = camera.projectionMatrixInverse;
		uniforms.cameraMatrixWorld.value = camera.matrixWorld;
		uniforms.shadowMap.value = shadowMap;
		uniforms.mapSize.value = mapSize;
		uniforms.lightCameraNear.value = shadow?.camera.near ?? 0.1;
		uniforms.lightCameraFar.value = shadow?.camera.far ?? 1000;
		uniforms.density.value = params.density;
		uniforms.maxDensity.value = params.maxDensity;
		uniforms.distanceAttenuation.value = params.distanceAttenuation;
		if (light instanceof PointLight || (light as any).isPointLight) {
			const planes = [];
			const directions = [
				new Vector3(1, 0, 0),
				new Vector3(-1, 0, 0),
				new Vector3(0, 1, 0),
				new Vector3(0, -1, 0),
				new Vector3(0, 0, 1),
				new Vector3(0, 0, -1),
			];
			for (const direction of directions) {
				planes.push(
					new Plane().setFromNormalAndCoplanarPoint(
						direction,
						light.position.clone().add(direction.clone().multiplyScalar(uniforms.lightCameraFar.value))
					)
				);
			}
			uniforms.fNormals.value = planes.map((x) => x.normal.clone());
			uniforms.fConstants.value = planes.map((x) => x.constant);
		} else if (light instanceof DirectionalLight || (light as any).isDirectionalLight) {
			const frustum = new Frustum();
			frustum.setFromProjectionMatrix(
				new Matrix4().multiplyMatrices(
					light.shadow.camera.projectionMatrix,
					light.shadow.camera.matrixWorldInverse
				)
			);
			uniforms.fNormals.value = frustum.planes.map((x) => x.normal.clone().multiplyScalar(-1));
			uniforms.fConstants.value = frustum.planes.map((x) => x.constant * -1);
		}
	}
}
