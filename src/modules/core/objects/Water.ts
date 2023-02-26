import {Color} from 'three';
import {FrontSide} from 'three';
import {Matrix4} from 'three';
import {ShaderMaterial} from 'three';
import {UniformsLib} from 'three';
import {UniformsUtils} from 'three';
import {Vector3} from 'three';
import {BufferGeometry} from 'three';
import {Texture} from 'three';
import {IUniformColor, IUniformN, IUniformTexture, IUniformV3} from '../../../engine/nodes/utils/code/gl/Uniforms';
import {BaseReflector, BaseReflectorOptions} from './_BaseReflector';
import VERTEX from './water/vert.glsl';
import FRAGMENT from './water/frag.glsl';
import {WebGLRenderer} from 'three';
import {Scene} from 'three';
import {Camera} from 'three';
import {PolyScene} from '../../../engine/scene/PolyScene';
/**
 * Work based on :
 * http://slayvin.net : Flat mirror for three.js
 * http://www.adelphi.edu/~stemkoski : An implementation of water shader based on the flat mirror
 * http://29a.ch/ && http://29a.ch/slides/2012/webglwater/ : Water shader explanations in WebGL
 */

export interface WaterMaterial extends ShaderMaterial {
	uniforms: {
		sunDirection: IUniformV3;
		sunColor: IUniformColor;
		wavesHeight: IUniformN;
		waterColor: IUniformColor;
		reflectionColor: IUniformColor;
		reflectionFresnel: IUniformN;
		distortionScale: IUniformN;
		size: IUniformN;
		alpha: IUniformN;
		time: IUniformN;
		timeScale: IUniformN;
		direction: IUniformV3;
		normalBias: IUniformN;
		// internals
		mirrorSampler: IUniformTexture;
		textureMatrix: {value: Matrix4};
		eye: IUniformV3;
	};
}

export interface WaterOptions extends BaseReflectorOptions {
	polyScene: PolyScene;
	alpha?: number;
	timeScale?: number;
	size?: number;
	direction?: Vector3;
	sunDirection?: Vector3;
	sunColor?: Color;
	wavesHeight?: number;
	waterColor?: Color;
	reflectionColor?: Color;
	reflectionFresnel?: number;
	waterNormals?: Texture;
	distortionScale?: number;
	normalBias?: number;
	side?: number;
	useFog?: boolean;
}

export class Water extends BaseReflector<BufferGeometry, WaterMaterial> {
	public readonly isWater = true;
	// private _renderReflection = true;
	protected override _mirrorCameraMultipliedByMatrixWorld = false;

	constructor(geometry: BufferGeometry, protected override _options: WaterOptions) {
		super(geometry, _options);
	}
	protected _createMaterial() {
		const options = this._options;
		const alpha = options.alpha !== undefined ? options.alpha : 1.0;
		const timeScale = options.timeScale !== undefined ? options.timeScale : 1.0;
		const size = options.size !== undefined ? options.size : 0.0;
		const direction = options.direction !== undefined ? options.direction : new Vector3(0.0, 1.0, 0.0);
		const sunDirection =
			options.sunDirection !== undefined ? options.sunDirection : new Vector3(0.70707, 0.70707, 0.0);
		const sunColor = new Color(options.sunColor !== undefined ? options.sunColor : 0xffffff);
		const wavesHeight: number = options.wavesHeight !== undefined ? options.wavesHeight : 1;
		const waterColor = new Color(options.waterColor !== undefined ? options.waterColor : 0x7f7f7f);
		const reflectionColor = new Color(options.reflectionColor !== undefined ? options.reflectionColor : 0xffffff);
		const reflectionFresnel = options.reflectionFresnel !== undefined ? options.reflectionFresnel : 1;

		const distortionScale = options.distortionScale !== undefined ? options.distortionScale : 20.0;
		const side = options.side !== undefined ? options.side : FrontSide;
		const useFog = options.useFog !== undefined ? options.useFog : false;
		const normalBias: number = options.normalBias !== undefined ? options.normalBias : 0.001;

		const mirrorShader = {
			uniforms: UniformsUtils.merge([
				UniformsLib['fog'],
				UniformsLib['lights'],
				{
					mirrorSampler: {value: null},
					alpha: {value: 1.0},
					time: {value: 0.0}, // do not assign time uniform here, as the uniforms as cloned shortly after
					timeScale: {value: 1.0},
					size: {value: 1.0},
					distortionScale: {value: 20.0},
					textureMatrix: {value: new Matrix4()},
					sunColor: {value: new Color(0x7f7f7f)},
					sunDirection: {value: new Vector3(0.70707, 0.70707, 0)},
					direction: {value: new Vector3().copy(BaseReflector.REFLECTOR_DEFAULT_UP)},
					eye: {value: new Vector3()},
					wavesHeight: {value: wavesHeight},
					waterColor: {value: new Color(0x555555)},
					reflectionColor: {value: new Color(0xffffff)},
					reflectionFresnel: {value: 1},
					normalBias: {value: normalBias},
				},
			]),
			vertexShader: VERTEX,
			fragmentShader: FRAGMENT,
		};

		const material = new ShaderMaterial({
			fragmentShader: mirrorShader.fragmentShader,
			vertexShader: mirrorShader.vertexShader,
			uniforms: UniformsUtils.clone(mirrorShader.uniforms),
			lights: true,
			side: side,
			// fog: useFog,
			// transparent: true, // TODO: allow transparency when I have a good alpha model
		}) as WaterMaterial;

		material.fog = useFog;

		material.uniforms['time'] = this._options.polyScene.timeController.timeUniform();
		material.uniforms['timeScale'].value = timeScale;
		material.uniforms['size'].value = size;

		material.uniforms['textureMatrix'].value = this.textureMatrix;
		material.uniforms['alpha'].value = alpha;
		material.uniforms['sunColor'].value = sunColor;
		material.uniforms['wavesHeight'].value = wavesHeight;
		material.uniforms['waterColor'].value = waterColor;
		material.uniforms['reflectionColor'].value = reflectionColor;
		material.uniforms['reflectionFresnel'].value = reflectionFresnel;
		material.uniforms['direction'].value = direction;
		material.uniforms['sunDirection'].value = sunDirection;
		material.uniforms['distortionScale'].value = distortionScale;
		material.uniforms['normalBias'].value = normalBias;

		material.uniforms['eye'].value = new Vector3();

		return material;
	}
	protected _assignMaterialRenderTarget() {
		if (this.renderTarget) {
			this.material.uniforms['mirrorSampler'].value = this.renderTarget.texture;
		}
	}

	protected override _onBeforeRender(renderer: WebGLRenderer, scene: Scene, anyCamera: Camera) {
		super._onBeforeRender(renderer, scene, anyCamera);
		if (this.material) {
			this.material.uniforms['eye'].value.setFromMatrixPosition(anyCamera.matrixWorld);
		}
	}

	setReflectionActive(state: boolean) {
		this._options.active = state;
		if (state) {
			if (this.renderTarget) {
				this.material.uniforms['mirrorSampler'].value = this.renderTarget.texture;
			}
		} else {
			this.material.uniforms['mirrorSampler'].value = null;
		}
	}

	override clone(recursive: boolean): this {
		// we clone so that a cloned reflector does not share the same color
		const clonedOptions = {...this._options};
		clonedOptions.sunDirection = this._options.sunDirection?.clone();
		clonedOptions.sunColor = this._options.sunColor?.clone();
		clonedOptions.waterColor = this._options.waterColor?.clone();
		const clonedGeometry = this.geometry.clone();

		const clonedWater = new Water(clonedGeometry, clonedOptions);
		const material: WaterMaterial = clonedWater.material;
		clonedWater.copy(this, recursive);
		// the material and geometry needs to be added back after the copy, as Mesh.copy would override that
		clonedWater.material = material;
		clonedWater.geometry = clonedGeometry;

		// TODO:
		// - size is not passed correctly
		// - make time dependent to update the time uniform attribute

		clonedWater.updateMatrix();
		return clonedWater as this;
	}
}
