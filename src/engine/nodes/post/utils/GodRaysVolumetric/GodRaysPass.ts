import {GodRaysVolumetricAcceptedLightType} from './utils/AcceptedLightType';

/*
 * Code taken + adapted from: https://github.com/Ameobea/three-good-godrays
 * Originally from: https://github.com/n8python
 *
 * Main goal of this adaptation is to update the light object from the post node
 *
 */
import {GODRAYS_RESOLUTION_SCALE} from './utils/GodRaysConstant';
import {GodraysIllumPass} from './utils/GodRaysIlluminationPass';
import {GodraysPassProps} from './utils/GodRaysPassProps';
import {
	DepthPackingStrategies,
	Texture,
	PerspectiveCamera,
	WebGLRenderer,
	BasicDepthPacking,
	Color,
	WebGLRenderTarget,
	LinearFilter,
	RGBAFormat,
} from 'three';
import {Disposable, Pass} from 'postprocessing';
import {GodraysCompositorMaterial, GodraysCompositorMaterialProps} from './utils/GodRaysCompositorMaterial';
import {GodraysPassParams, GodRaysPassDefaultParams} from './utils/GodRaysPassParams';

class GodraysCompositorPass extends Pass {
	sceneCamera: PerspectiveCamera;
	constructor(props: GodraysCompositorMaterialProps) {
		super('GodraysCompositorPass');
		this.fullscreenMaterial = new GodraysCompositorMaterial(props);
		this.sceneCamera = props.camera;
	}

	public updateUniforms(params: GodraysPassParams): void {
		(this.fullscreenMaterial as GodraysCompositorMaterial).updateUniforms(
			params.edgeStrength,
			params.edgeRadius,
			params.color,
			this.sceneCamera.near,
			this.sceneCamera.far
		);
	}

	override render(
		renderer: WebGLRenderer,
		inputBuffer: WebGLRenderTarget,
		outputBuffer: WebGLRenderTarget | null,
		_deltaTime?: number | undefined,
		_stencilTest?: boolean | undefined
	): void {
		(this.fullscreenMaterial as GodraysCompositorMaterial).uniforms.sceneDiffuse.value = inputBuffer.texture;
		renderer.setRenderTarget(outputBuffer);
		renderer.render(this.scene, this.camera);
	}

	override setDepthTexture(depthTexture: Texture, depthPacking?: DepthPackingStrategies | undefined): void {
		if (depthPacking && depthPacking !== BasicDepthPacking) {
			throw new Error('Only BasicDepthPacking is supported');
		}
		(this.fullscreenMaterial as GodraysCompositorMaterial).uniforms.sceneDepth.value = depthTexture;
	}

	override setSize(width: number, height: number): void {
		(this.fullscreenMaterial as GodraysCompositorMaterial).setSize(width, height);
	}
}

const populateParams = (partialParams: Partial<GodraysPassParams>): GodraysPassParams => {
	return {
		...GodRaysPassDefaultParams,
		...partialParams,
		color: new Color(partialParams.color ?? GodRaysPassDefaultParams.color),
	};
};

export class GodraysPass extends Pass implements Disposable {
	private props: GodraysPassProps;

	private godraysRenderTarget = new WebGLRenderTarget(1, 1, {
		minFilter: LinearFilter,
		magFilter: LinearFilter,
		format: RGBAFormat,
	});
	private illumPass: GodraysIllumPass;
	private compositorPass: GodraysCompositorPass;

	/**
	 * Constructs a new GodraysPass.  Casts godrays from a point light source.  Add to your scene's composer like this:
	 *
	 * ```ts
	 * import { EffectComposer, RenderPass } from 'postprocessing';
	 * import { GodraysPass } from 'three-good-godrays';
	 *
	 * const composer = new EffectComposer(renderer);
	 * const renderPass = new RenderPass(scene, camera);
	 * renderPass.renderToScreen = false;
	 * composer.addPass(renderPass);
	 *
	 * const godraysPass = new GodraysPass(pointLight, camera);
	 * godraysPass.renderToScreen = true;
	 * composer.addPass(godraysPass);
	 *
	 * function animate() {
	 *   composer.render(scene, camera);
	 * }
	 * ```
	 *
	 * @param light The light source to use for the godrays.
	 * @param camera The camera used to render the scene.
	 * @param partialParams The parameters to use for the godrays effect.  Will use default values for any parameters not specified.
	 */
	constructor(
		light: GodRaysVolumetricAcceptedLightType,
		camera: PerspectiveCamera,
		partialParams: Partial<GodraysPassParams> = {}
	) {
		super('GodraysPass');

		this.props = {
			light: light,
			camera,
		};
		const params = populateParams(partialParams);

		this.illumPass = new GodraysIllumPass(this.props, params);
		this.illumPass.needsDepthTexture = true;

		this.compositorPass = new GodraysCompositorPass({
			godrays: this.godraysRenderTarget.texture,
			edgeStrength: params.edgeStrength,
			edgeRadius: params.edgeRadius,
			color: params.color,
			camera,
		});
		this.compositorPass.needsDepthTexture = true;

		// Indicate to the composer that this pass needs depth information from the previous pass
		this.needsDepthTexture = true;

		this.setParams(params);
	}

	setLight(light: GodRaysVolumetricAcceptedLightType) {
		this.props.light = light;
	}

	/**
	 * Updates the parameters used for the godrays effect.  Will use default values for any parameters not specified.
	 */
	public setParams(partialParams: Partial<GodraysPassParams>): void {
		const params = populateParams(partialParams);
		this.illumPass.updateUniforms(this.props, params);
		this.compositorPass.updateUniforms(params);
	}

	override render(
		renderer: WebGLRenderer,
		inputBuffer: WebGLRenderTarget,
		outputBuffer: WebGLRenderTarget,
		_deltaTime?: number | undefined,
		_stencilTest?: boolean | undefined
	): void {
		this.illumPass.render(renderer, inputBuffer, this.godraysRenderTarget);

		this.compositorPass.render(renderer, inputBuffer, this.renderToScreen ? null : outputBuffer);
	}

	override setDepthTexture(depthTexture: Texture, depthPacking?: DepthPackingStrategies | undefined): void {
		this.illumPass.setDepthTexture(depthTexture, depthPacking);
		this.compositorPass.setDepthTexture(depthTexture, depthPacking);
	}

	override setSize(width: number, height: number): void {
		this.godraysRenderTarget.setSize(
			Math.ceil(width * GODRAYS_RESOLUTION_SCALE),
			Math.ceil(height * GODRAYS_RESOLUTION_SCALE)
		);
		this.illumPass.setSize(width, height);
		this.compositorPass.setSize(width, height);
	}

	override dispose(): void {
		this.godraysRenderTarget.dispose();
		this.illumPass.dispose();
		this.compositorPass.dispose();
		super.dispose();
	}
}
