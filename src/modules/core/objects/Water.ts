import {Color} from 'three/src/math/Color';
import {FrontSide} from 'three/src/constants';
import {LinearFilter} from 'three/src/constants';
import {isPowerOfTwo} from 'three/src/math/MathUtils';
import {Matrix4} from 'three/src/math/Matrix4';
import {Mesh} from 'three/src/objects/Mesh';
import {PerspectiveCamera} from 'three/src/cameras/PerspectiveCamera';
import {Plane} from 'three/src/math/Plane';
import {RGBFormat} from 'three/src/constants';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {UniformsLib} from 'three/src/renderers/shaders/UniformsLib';
import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';
import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Texture} from 'three/src/textures/Texture';
import {Camera} from 'three/src/cameras/Camera';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {IUniformColor, IUniformN, IUniformTexture, IUniformV3} from '../../../engine/nodes/utils/code/gl/Uniforms';

import VERTEX from './water/vert.glsl';
import FRAGMENT from './water/frag.glsl';

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
		timeMult: IUniformN;
		// internals
		mirrorSampler: IUniformTexture;
		textureMatrix: {value: Matrix4};
		eye: IUniformV3;
	};
}

interface WaterOptions {
	textureWidth?: number;
	textureHeight?: number;
	clipBias?: number;
	alpha?: number;
	time?: number;
	sunDirection?: Vector3;
	sunColor?: Color;
	waterColor?: Color;
	waterNormals?: Texture;
	eye?: Vector3;
	distortionScale?: number;
	side?: number;
	fog?: boolean;
}

export class Water extends Mesh {
	public readonly isWater = true;
	private _renderTarget: WebGLRenderTarget;
	public material: WaterMaterial;
	private _renderReflection = true;

	constructor(geometry: BufferGeometry, options: WaterOptions = {}) {
		super(geometry);

		const scope = this;

		const textureWidth = options.textureWidth !== undefined ? options.textureWidth : 512;
		const textureHeight = options.textureHeight !== undefined ? options.textureHeight : 512;

		const clipBias = options.clipBias !== undefined ? options.clipBias : 0.0;
		const alpha = options.alpha !== undefined ? options.alpha : 1.0;
		const time = options.time !== undefined ? options.time : 0.0;
		const normalSampler = options.waterNormals !== undefined ? options.waterNormals : null;
		const sunDirection =
			options.sunDirection !== undefined ? options.sunDirection : new Vector3(0.70707, 0.70707, 0.0);
		const sunColor = new Color(options.sunColor !== undefined ? options.sunColor : 0xffffff);
		const waterColor = new Color(options.waterColor !== undefined ? options.waterColor : 0x7f7f7f);
		const eye = options.eye !== undefined ? options.eye : new Vector3(0, 0, 0);
		const distortionScale = options.distortionScale !== undefined ? options.distortionScale : 20.0;
		const side = options.side !== undefined ? options.side : FrontSide;
		const fog = options.fog !== undefined ? options.fog : false;

		//

		const mirrorPlane = new Plane();
		const normal = new Vector3();
		const mirrorWorldPosition = new Vector3();
		const cameraWorldPosition = new Vector3();
		const rotationMatrix = new Matrix4();
		const lookAtPosition = new Vector3(0, 0, -1);
		const clipPlane = new Vector4();

		const view = new Vector3();
		const target = new Vector3();
		const q = new Vector4();

		const textureMatrix = new Matrix4();

		const mirrorCamera = new PerspectiveCamera();

		const parameters = {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			format: RGBFormat,
		};

		this._renderTarget = new WebGLRenderTarget(textureWidth, textureHeight, parameters);

		if (!isPowerOfTwo(textureWidth) || !isPowerOfTwo(textureHeight)) {
			this._renderTarget.texture.generateMipmaps = false;
		}

		const mirrorShader = {
			uniforms: UniformsUtils.merge([
				UniformsLib['fog'],
				UniformsLib['lights'],
				{
					normalSampler: {value: null},
					mirrorSampler: {value: null},
					alpha: {value: 1.0},
					time: {value: 0.0},
					timeMult: {value: 1.0},
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

		this.material = new ShaderMaterial({
			fragmentShader: mirrorShader.fragmentShader,
			vertexShader: mirrorShader.vertexShader,
			uniforms: UniformsUtils.clone(mirrorShader.uniforms),
			lights: true,
			side: side,
			fog: fog,
		}) as WaterMaterial;

		this.material.uniforms['mirrorSampler'].value = this._renderTarget.texture;
		this.material.uniforms['textureMatrix'].value = textureMatrix;
		this.material.uniforms['alpha'].value = alpha;
		this.material.uniforms['time'].value = time;
		this.material.uniforms['normalSampler'].value = normalSampler;
		this.material.uniforms['sunColor'].value = sunColor;
		this.material.uniforms['waterColor'].value = waterColor;
		this.material.uniforms['sunDirection'].value = sunDirection;
		this.material.uniforms['distortionScale'].value = distortionScale;

		this.material.uniforms['eye'].value = eye;

		scope.material = this.material;

		scope.onBeforeRender = (renderer, scene, camera) => {
			if (!this._renderReflection) {
				return;
			}

			mirrorWorldPosition.setFromMatrixPosition(scope.matrixWorld);
			cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);

			rotationMatrix.extractRotation(scope.matrixWorld);

			normal.set(0, 0, 1);
			normal.applyMatrix4(rotationMatrix);

			view.subVectors(mirrorWorldPosition, cameraWorldPosition);

			// Avoid rendering when mirror is facing away

			if (view.dot(normal) > 0) return;

			view.reflect(normal).negate();
			view.add(mirrorWorldPosition);

			rotationMatrix.extractRotation(camera.matrixWorld);

			lookAtPosition.set(0, 0, -1);
			lookAtPosition.applyMatrix4(rotationMatrix);
			lookAtPosition.add(cameraWorldPosition);

			target.subVectors(mirrorWorldPosition, lookAtPosition);
			target.reflect(normal).negate();
			target.add(mirrorWorldPosition);

			mirrorCamera.position.copy(view);
			mirrorCamera.up.set(0, 1, 0);
			mirrorCamera.up.applyMatrix4(rotationMatrix);
			mirrorCamera.up.reflect(normal);
			mirrorCamera.lookAt(target);

			mirrorCamera.far = (camera as PerspectiveCamera).far; // Used in WebGLBackground

			mirrorCamera.updateMatrixWorld();
			mirrorCamera.projectionMatrix.copy(camera.projectionMatrix);

			// Update the texture matrix
			textureMatrix.set(0.5, 0.0, 0.0, 0.5, 0.0, 0.5, 0.0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0, 1.0);
			textureMatrix.multiply(mirrorCamera.projectionMatrix);
			textureMatrix.multiply(mirrorCamera.matrixWorldInverse);

			// Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
			// Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
			mirrorPlane.setFromNormalAndCoplanarPoint(normal, mirrorWorldPosition);
			mirrorPlane.applyMatrix4(mirrorCamera.matrixWorldInverse);

			clipPlane.set(mirrorPlane.normal.x, mirrorPlane.normal.y, mirrorPlane.normal.z, mirrorPlane.constant);

			const projectionMatrix = mirrorCamera.projectionMatrix;

			q.x = (Math.sign(clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
			q.y = (Math.sign(clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
			q.z = -1.0;
			q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

			// Calculate the scaled plane vector
			clipPlane.multiplyScalar(2.0 / clipPlane.dot(q));

			// Replacing the third row of the projection matrix
			projectionMatrix.elements[2] = clipPlane.x;
			projectionMatrix.elements[6] = clipPlane.y;
			projectionMatrix.elements[10] = clipPlane.z + 1.0 - clipBias;
			projectionMatrix.elements[14] = clipPlane.w;

			eye.setFromMatrixPosition(camera.matrixWorld);

			// Render

			const currentRenderTarget = renderer.getRenderTarget();

			const currentXrEnabled = renderer.xr.enabled;
			const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

			scope.visible = false;

			renderer.xr.enabled = false; // Avoid camera modification and recursion
			renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows

			renderer.setRenderTarget(this._renderTarget);

			renderer.state.buffers.depth.setMask(true); // make sure the depth buffer is writable so it can be properly cleared, see #18897

			if (renderer.autoClear === false) renderer.clear();
			renderer.render(scene, mirrorCamera);

			scope.visible = true;

			renderer.xr.enabled = currentXrEnabled;
			renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

			renderer.setRenderTarget(currentRenderTarget);

			this._restoreViewport(camera, renderer);
		};
	}

	setReflectionActive(state: boolean) {
		this._renderReflection = state;
		if (this._renderReflection) {
			this.material.uniforms['mirrorSampler'].value = this._renderTarget.texture;
		} else {
			this.material.uniforms['mirrorSampler'].value = null;
		}
	}

	private _restoreViewport(camera: Camera, renderer: WebGLRenderer) {
		// const viewport = (camera as PerspectiveCamera).viewport;
		// if (viewport !== undefined) {
		// 	renderer.state.viewport(viewport);
		// }
	}
}
