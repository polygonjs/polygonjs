import {Color} from 'three/src/math/Color';
import {FrontSide} from 'three/src/constants';
import {Matrix4} from 'three/src/math/Matrix4';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {UniformsLib} from 'three/src/renderers/shaders/UniformsLib';
import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
import {Vector3} from 'three/src/math/Vector3';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Texture} from 'three/src/textures/Texture';
import {IUniformColor, IUniformN, IUniformTexture, IUniformV3} from '../../../engine/nodes/utils/code/gl/Uniforms';
import {BaseReflector, BaseReflectorOptions} from './_BaseReflector';
import VERTEX from './water/vert.glsl';
import FRAGMENT from './water/frag.glsl';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {Scene} from 'three/src/scenes/Scene';
import {Camera} from 'three/src/cameras/Camera';
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
		waterColor: IUniformColor;
		distortionScale: IUniformN;
		size: IUniformN;
		normalSampler: IUniformTexture;
		alpha: IUniformN;
		time: IUniformN;
		timeScale: IUniformN;
		// internals
		mirrorSampler: IUniformTexture;
		textureMatrix: {value: Matrix4};
		eye: IUniformV3;
	};
}

export interface WaterOptions extends BaseReflectorOptions {
	alpha?: number;
	time?: number;
	sunDirection?: Vector3;
	sunColor?: Color;
	waterColor?: Color;
	waterNormals?: Texture;
	distortionScale?: number;
	side?: number;
	fog?: boolean;
}

export class Water extends BaseReflector<BufferGeometry, WaterMaterial> {
	public readonly isWater = true;
	// private _renderReflection = true;
	protected _mirrorCameraMultipliedByMatrixWorld = false;

	constructor(geometry: BufferGeometry, protected _options: WaterOptions) {
		super(geometry, _options);
	}
	protected _createMaterial() {
		const options = this._options;
		const alpha = options.alpha !== undefined ? options.alpha : 1.0;
		const time = options.time !== undefined ? options.time : 0.0;
		const normalSampler = options.waterNormals !== undefined ? options.waterNormals : null;
		const sunDirection =
			options.sunDirection !== undefined ? options.sunDirection : new Vector3(0.70707, 0.70707, 0.0);
		const sunColor = new Color(options.sunColor !== undefined ? options.sunColor : 0xffffff);
		const waterColor = new Color(options.waterColor !== undefined ? options.waterColor : 0x7f7f7f);

		const distortionScale = options.distortionScale !== undefined ? options.distortionScale : 20.0;
		const side = options.side !== undefined ? options.side : FrontSide;
		const fog = options.fog !== undefined ? options.fog : false;

		const mirrorShader = {
			uniforms: UniformsUtils.merge([
				UniformsLib['fog'],
				UniformsLib['lights'],
				{
					normalSampler: {value: null},
					mirrorSampler: {value: null},
					alpha: {value: 1.0},
					time: {value: 0.0},
					timeScale: {value: 1.0},
					size: {value: 1.0},
					distortionScale: {value: 20.0},
					textureMatrix: {value: new Matrix4()},
					sunColor: {value: new Color(0x7f7f7f)},
					sunDirection: {value: new Vector3(0.70707, 0.70707, 0)},
					eye: {value: new Vector3()},
					waterColor: {value: new Color(0x555555)},
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
			fog: fog,
		}) as WaterMaterial;

		material.uniforms['mirrorSampler'].value = this.renderTarget.texture;
		material.uniforms['textureMatrix'].value = this.textureMatrix;
		material.uniforms['alpha'].value = alpha;
		material.uniforms['time'].value = time;
		material.uniforms['normalSampler'].value = normalSampler;
		material.uniforms['sunColor'].value = sunColor;
		material.uniforms['waterColor'].value = waterColor;
		material.uniforms['sunDirection'].value = sunDirection;
		material.uniforms['distortionScale'].value = distortionScale;

		material.uniforms['eye'].value = new Vector3();

		return material;
	}

	protected _onBeforeRender(renderer: WebGLRenderer, scene: Scene, anyCamera: Camera) {
		super._onBeforeRender(renderer, scene, anyCamera);
		if (this.material) {
			this.material.uniforms['eye'].value.setFromMatrixPosition(anyCamera.matrixWorld);
		}
	}

	setReflectionActive(state: boolean) {
		this._options.active = state;
		if (state) {
			this.material.uniforms['mirrorSampler'].value = this.renderTarget.texture;
		} else {
			this.material.uniforms['mirrorSampler'].value = null;
		}
	}

	clone(recursive: boolean): this {
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
		// normalsSampler is given asynchronously to the node, so it needs to be passed after the options
		material.uniforms.normalSampler.value = this.material.uniforms.normalSampler.value;

		// TODO:
		// - size is not passed correctly
		// - make time dependent to update the time uniform attribute

		clonedWater.updateMatrix();
		return clonedWater as this;
	}
}