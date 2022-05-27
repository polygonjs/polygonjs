// import {AdditiveBlending, NoBlending, NormalBlending} from 'three';
// import {Color} from 'three';
// import {MeshBasicMaterial} from 'three';
// import {ShaderMaterial} from 'three';
// import {UniformsUtils} from 'three';
// import {Vector2} from 'three';
// import {Vector3} from 'three';
// import {WebGLRenderTarget} from 'three';
// import {Pass, FullScreenQuad} from '../../three/examples/jsm/postprocessing/Pass.js';
// import {CopyShader} from '../../three/examples/jsm/shaders/CopyShader.js';
// import {LuminosityHighPassShader} from '../../three/examples/jsm/shaders/LuminosityHighPassShader.js';
// import {
// 	IUniformColor,
// 	IUniformN,
// 	IUniformTexture,
// 	IUniformV2,
// 	IUniformNArray,
// 	IUniformV3Array,
// 	IUniformB,
// } from '../../../engine/nodes/utils/code/gl/Uniforms';
// import {IUniform} from 'three';
// import {WebGLRenderer} from 'three';

// /**
//  * UnrealBloomPass is inspired by the bloom pass of Unreal Engine. It creates a
//  * mip map chain of bloom textures and blurs them with different radii. Because
//  * of the weighted combination of mips, and because larger blurs are done on
//  * higher mips, this effect provides good quality and performance.
//  *
//  * Reference:
//  * - https://docs.unrealengine.com/latest/INT/Engine/Rendering/PostProcessEffects/Bloom/
//  */

// import VERT_SEPARABLE_BLUR from './UnrealBloomPass/separableBlur.vert.glsl';
// import FRAG_SEPARABLE_BLUR from './UnrealBloomPass/separableBlur.frag.glsl';
// import VERT_COMPOSITE from './UnrealBloomPass/composite.vert.glsl';
// import FRAG_COMPOSITE from './UnrealBloomPass/composite.frag.glsl';

// interface ShaderMaterialUniforms {
// 	[uniform: string]: IUniform;
// }
// interface HighPassUniforms extends ShaderMaterialUniforms {
// 	tDiffuse: IUniformTexture;
// 	luminosityThreshold: IUniformN;
// 	smoothWidth: IUniformN;
// 	defaultColor: IUniformColor;
// 	defaultOpacity: IUniformN;
// }
// interface HighPassFilterMaterial extends ShaderMaterial {
// 	uniforms: HighPassUniforms;
// }
// interface CopyShaderUniforms extends ShaderMaterialUniforms {
// 	tDiffuse: IUniformTexture;
// 	opacity: IUniformN;
// }
// interface CopyMaterial extends ShaderMaterial {
// 	uniforms: CopyShaderUniforms;
// }

// interface SeparableBlurUniforms extends ShaderMaterialUniforms {
// 	colorTexture: IUniformTexture;
// 	texSize: IUniformV2;
// 	direction: IUniformV2;
// }
// interface SeparableBlurMaterial extends ShaderMaterial {
// 	uniforms: SeparableBlurUniforms;
// }
// interface CompositeUniforms extends ShaderMaterialUniforms {
// 	blurTexture1: IUniformTexture;
// 	blurTexture2: IUniformTexture;
// 	blurTexture3: IUniformTexture;
// 	blurTexture4: IUniformTexture;
// 	blurTexture5: IUniformTexture;
// 	dirtTexture: IUniformTexture;
// 	bloomStrength: IUniformN;
// 	bloomFactors: IUniformNArray;
// 	bloomTintColors: IUniformV3Array;
// 	bloomRadius: IUniformN;
// 	premult: IUniformB;
// }
// interface CompositeMaterial extends ShaderMaterial {
// 	uniforms: CompositeUniforms;
// }

// type RenderTargetFactory = (resx: number, resy: number) => WebGLRenderTarget;

// interface UnrealBloomPassOptions {
// 	renderTargetFactory: RenderTargetFactory;
// 	resolution: Vector2;
// 	strength: number;
// 	radius: number;
// 	threshold: number;
// 	// premult: boolean;
// 	bloomOnly: boolean;
// }

// export class UnrealBloomPass extends Pass {
// 	private renderTargetFactory: RenderTargetFactory;
// 	static BlurDirectionX = new Vector2(1.0, 0.0);
// 	static BlurDirectionY = new Vector2(0.0, 1.0);

// 	private clearColor = new Color(0, 0, 0);
// 	private bloomTintColors = [
// 		new Vector3(1, 1, 1),
// 		new Vector3(1, 1, 1),
// 		new Vector3(1, 1, 1),
// 		new Vector3(1, 1, 1),
// 		new Vector3(1, 1, 1),
// 	];
// 	private nMips = 5;
// 	private renderTargetsHorizontal: WebGLRenderTarget[];
// 	private renderTargetsVertical: WebGLRenderTarget[];
// 	private renderTargetBright: WebGLRenderTarget;
// 	private highPassUniforms: HighPassUniforms;
// 	private materialHighPassFilter: HighPassFilterMaterial;
// 	private _oldClearColor = new Color();
// 	private oldClearAlpha = 1;
// 	private fsQuad = new FullScreenQuad();
// 	private basic = new MeshBasicMaterial();
// 	private separableBlurMaterials: SeparableBlurMaterial[] = [];
// 	private compositeMaterial: CompositeMaterial;
// 	private copyUniforms: CopyShaderUniforms;
// 	private materialCopy: CopyMaterial;

// 	// public props
// 	private resolution: Vector2;
// 	public strength: number;
// 	public radius: number;
// 	public threshold: number;
// 	public premult: boolean = true;
// 	public bloomOnly: boolean;
// 	constructor(options: UnrealBloomPassOptions) {
// 		super();
// 		this.renderTargetFactory = options.renderTargetFactory;
// 		this.resolution = options.resolution;
// 		this.strength = options.strength;
// 		this.radius = options.radius;
// 		this.threshold = options.threshold;
// 		// this.premult = options.premult;
// 		this.bloomOnly = options.bloomOnly;

// 		// render targets
// 		this.renderTargetsHorizontal = [];
// 		this.renderTargetsVertical = [];
// 		let resx = Math.round(this.resolution.x / 2);
// 		let resy = Math.round(this.resolution.y / 2);

// 		this.renderTargetBright = this.renderTargetFactory(resx, resy); //new WebGLRenderTarget(resx, resy, pars);
// 		this.renderTargetBright.texture.name = 'UnrealBloomPass.bright';
// 		this.renderTargetBright.texture.generateMipmaps = false;

// 		for (let i = 0; i < this.nMips; i++) {
// 			const renderTargetHorizonal = this.renderTargetFactory(resx, resy);

// 			renderTargetHorizonal.texture.name = 'UnrealBloomPass.h' + i;
// 			renderTargetHorizonal.texture.generateMipmaps = false;

// 			this.renderTargetsHorizontal.push(renderTargetHorizonal);

// 			const renderTargetVertical = this.renderTargetFactory(resx, resy);

// 			renderTargetVertical.texture.name = 'UnrealBloomPass.v' + i;
// 			renderTargetVertical.texture.generateMipmaps = false;

// 			this.renderTargetsVertical.push(renderTargetVertical);

// 			resx = Math.round(resx / 2);

// 			resy = Math.round(resy / 2);
// 		}

// 		// luminosity high pass material

// 		if (LuminosityHighPassShader === undefined)
// 			console.error('THREE.UnrealBloomPass relies on LuminosityHighPassShader');

// 		const highPassShader = LuminosityHighPassShader;
// 		this.highPassUniforms = UniformsUtils.clone(highPassShader.uniforms);

// 		this.highPassUniforms['luminosityThreshold'].value = this.threshold;
// 		this.highPassUniforms['smoothWidth'].value = 0.01;

// 		this.materialHighPassFilter = new ShaderMaterial({
// 			uniforms: this.highPassUniforms,
// 			vertexShader: highPassShader.vertexShader,
// 			fragmentShader: highPassShader.fragmentShader,
// 			defines: {},
// 		}) as HighPassFilterMaterial;

// 		// Gaussian Blur Materials
// 		const kernelSizeArray = [3, 5, 7, 9, 11];
// 		resx = Math.round(this.resolution.x / 2);
// 		resy = Math.round(this.resolution.y / 2);

// 		for (let i = 0; i < this.nMips; i++) {
// 			this.separableBlurMaterials.push(this._getSeperableBlurMaterial(kernelSizeArray[i]));

// 			this.separableBlurMaterials[i].uniforms['texSize'].value = new Vector2(resx, resy);

// 			resx = Math.round(resx / 2);

// 			resy = Math.round(resy / 2);
// 		}

// 		// Composite material
// 		this.compositeMaterial = this._getCompositeMaterial(this.nMips);
// 		this.compositeMaterial.uniforms['blurTexture1'].value = this.renderTargetsVertical[0].texture;
// 		this.compositeMaterial.uniforms['blurTexture2'].value = this.renderTargetsVertical[1].texture;
// 		this.compositeMaterial.uniforms['blurTexture3'].value = this.renderTargetsVertical[2].texture;
// 		this.compositeMaterial.uniforms['blurTexture4'].value = this.renderTargetsVertical[3].texture;
// 		this.compositeMaterial.uniforms['blurTexture5'].value = this.renderTargetsVertical[4].texture;
// 		this.compositeMaterial.uniforms['bloomStrength'].value = this.strength;
// 		this.compositeMaterial.uniforms['bloomRadius'].value = this.radius;
// 		this.compositeMaterial.uniforms['bloomPremult'].value = this.premult;
// 		this.compositeMaterial.needsUpdate = true;

// 		const bloomFactors = [1.0, 0.8, 0.6, 0.4, 0.2];
// 		this.compositeMaterial.uniforms['bloomFactors'].value = bloomFactors;

// 		this.compositeMaterial.uniforms['bloomTintColors'].value = this.bloomTintColors;

// 		// copy material
// 		if (CopyShader === undefined) {
// 			console.error('THREE.UnrealBloomPass relies on CopyShader');
// 		}

// 		const copyShader = CopyShader;

// 		this.copyUniforms = UniformsUtils.clone(copyShader.uniforms);
// 		this.copyUniforms['opacity'].value = 1.0;

// 		this.materialCopy = new ShaderMaterial({
// 			uniforms: this.copyUniforms,
// 			vertexShader: copyShader.vertexShader,
// 			fragmentShader: copyShader.fragmentShader,
// 			blending: this._blending(),
// 			depthTest: false,
// 			depthWrite: false,
// 			transparent: true,
// 		}) as CopyMaterial;

// 		this.enabled = true;
// 		this.needsSwap = false;
// 	}

// 	dispose() {
// 		for (let i = 0; i < this.renderTargetsHorizontal.length; i++) {
// 			this.renderTargetsHorizontal[i].dispose();
// 		}

// 		for (let i = 0; i < this.renderTargetsVertical.length; i++) {
// 			this.renderTargetsVertical[i].dispose();
// 		}

// 		this.renderTargetBright.dispose();
// 	}

// 	override setSize(width: number, height: number) {
// 		let resx = Math.round(width / 2);
// 		let resy = Math.round(height / 2);

// 		this.renderTargetBright.setSize(resx, resy);

// 		for (let i = 0; i < this.nMips; i++) {
// 			this.renderTargetsHorizontal[i].setSize(resx, resy);
// 			this.renderTargetsVertical[i].setSize(resx, resy);

// 			this.separableBlurMaterials[i].uniforms['texSize'].value = new Vector2(resx, resy);

// 			resx = Math.round(resx / 2);
// 			resy = Math.round(resy / 2);
// 		}
// 	}

// 	private _blending() {
// 		return this.bloomOnly ? NoBlending : [AdditiveBlending, NormalBlending][1];
// 	}
// 	private _updateBlending() {
// 		this.materialCopy.blending = this._blending();
// 	}

// 	override render(
// 		renderer: WebGLRenderer,
// 		writeBuffer: WebGLRenderTarget,
// 		readBuffer: WebGLRenderTarget,
// 		deltaTime: number,
// 		maskActive: boolean
// 	) {
// 		renderer.getClearColor(this._oldClearColor);
// 		this.oldClearAlpha = renderer.getClearAlpha();
// 		const oldAutoClear = renderer.autoClear;
// 		renderer.autoClear = false;

// 		this._updateBlending();

// 		renderer.setClearColor(this.clearColor, 0);

// 		if (maskActive) renderer.state.buffers.stencil.setTest(false);

// 		// Render input to screen

// 		if (this.renderToScreen) {
// 			this.fsQuad.material = this.basic;
// 			this.basic.map = readBuffer.texture;

// 			renderer.setRenderTarget(null);
// 			renderer.clear();
// 			this.fsQuad.render(renderer);
// 		}

// 		// 1. Extract Bright Areas

// 		this.highPassUniforms['tDiffuse'].value = readBuffer.texture;
// 		this.highPassUniforms['luminosityThreshold'].value = this.threshold;
// 		this.fsQuad.material = this.materialHighPassFilter;

// 		renderer.setRenderTarget(this.renderTargetBright);
// 		renderer.clear();
// 		this.fsQuad.render(renderer);

// 		// 2. Blur All the mips progressively

// 		let inputRenderTarget = this.renderTargetBright;

// 		for (let i = 0; i < this.nMips; i++) {
// 			this.fsQuad.material = this.separableBlurMaterials[i];

// 			this.separableBlurMaterials[i].uniforms['colorTexture'].value = inputRenderTarget.texture;
// 			this.separableBlurMaterials[i].uniforms['direction'].value = UnrealBloomPass.BlurDirectionX;
// 			renderer.setRenderTarget(this.renderTargetsHorizontal[i]);
// 			renderer.clear();
// 			this.fsQuad.render(renderer);

// 			this.separableBlurMaterials[i].uniforms['colorTexture'].value = this.renderTargetsHorizontal[i].texture;
// 			this.separableBlurMaterials[i].uniforms['direction'].value = UnrealBloomPass.BlurDirectionY;
// 			renderer.setRenderTarget(this.renderTargetsVertical[i]);
// 			renderer.clear();
// 			this.fsQuad.render(renderer);

// 			inputRenderTarget = this.renderTargetsVertical[i];
// 		}

// 		// Composite All the mips

// 		this.fsQuad.material = this.compositeMaterial;
// 		this.compositeMaterial.uniforms['bloomStrength'].value = this.strength;
// 		this.compositeMaterial.uniforms['bloomRadius'].value = this.radius;
// 		this.compositeMaterial.uniforms['bloomPremult'].value = this.premult;
// 		this.compositeMaterial.uniforms['bloomTintColors'].value = this.bloomTintColors;

// 		renderer.setRenderTarget(this.renderTargetsHorizontal[0]);
// 		renderer.clear();
// 		this.fsQuad.render(renderer);

// 		// Blend it additively over the input texture

// 		this.fsQuad.material = this.materialCopy;
// 		this.copyUniforms['tDiffuse'].value = this.renderTargetsHorizontal[0].texture;

// 		if (maskActive) renderer.state.buffers.stencil.setTest(true);

// 		if (this.renderToScreen) {
// 			renderer.setRenderTarget(null);
// 			this.fsQuad.render(renderer);
// 		} else {
// 			renderer.setRenderTarget(readBuffer);
// 			this.fsQuad.render(renderer);
// 		}

// 		// Restore renderer settings

// 		renderer.setClearColor(this._oldClearColor, this.oldClearAlpha);
// 		renderer.autoClear = oldAutoClear;
// 	}

// 	private _getSeperableBlurMaterial(kernelRadius: number): SeparableBlurMaterial {
// 		return new ShaderMaterial({
// 			defines: {
// 				KERNEL_RADIUS: kernelRadius,
// 				SIGMA: kernelRadius,
// 			},

// 			uniforms: {
// 				colorTexture: {value: null},
// 				texSize: {value: new Vector2(0.5, 0.5)},
// 				direction: {value: new Vector2(0.5, 0.5)},
// 			},

// 			vertexShader: VERT_SEPARABLE_BLUR,

// 			fragmentShader: FRAG_SEPARABLE_BLUR,
// 		}) as SeparableBlurMaterial;
// 	}

// 	private _getCompositeMaterial(nMips: number): CompositeMaterial {
// 		return new ShaderMaterial({
// 			defines: {
// 				NUM_MIPS: nMips,
// 			},

// 			uniforms: {
// 				blurTexture1: {value: null},
// 				blurTexture2: {value: null},
// 				blurTexture3: {value: null},
// 				blurTexture4: {value: null},
// 				blurTexture5: {value: null},
// 				dirtTexture: {value: null},
// 				bloomStrength: {value: 1.0},
// 				bloomFactors: {value: null},
// 				bloomTintColors: {value: null},
// 				bloomRadius: {value: 0.0},
// 				bloomPremult: {value: 0.0},
// 			},

// 			vertexShader: VERT_COMPOSITE,

// 			fragmentShader: FRAG_COMPOSITE,
// 		}) as CompositeMaterial;
// 	}
// }
