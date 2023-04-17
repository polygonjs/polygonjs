import through_vert from '../glsl/through.vert.glsl';
import constraints_frag from '../glsl/constraints.frag.glsl';
import integrate_frag from '../glsl/integrate.frag.glsl';
import mouse_frag from '../glsl/mouse.frag.glsl';
import normals_frag from '../glsl/normals.frag.glsl';
import through_frag from '../glsl/through.frag.glsl';

import {RawShaderMaterial, Vector2, Vector3, IUniform} from 'three';
import {ClothController} from '../ClothController';
import {
	IUniformN,
	IUniformV2,
	IUniformTexture,
	IUniformNArray,
	IUniformV3Array,
} from '../../../engine/nodes/utils/code/gl/Uniforms';

type RawMaterialUniforms = {[uniform: string]: IUniform};
interface CopyUniforms extends RawMaterialUniforms {
	order: IUniformN;
	tSize: IUniformV2;
	texture: IUniformTexture;
}
interface IntegrationUniforms extends RawMaterialUniforms {
	dt: IUniformN;
	tSize: IUniformV2;
	order: IUniformN;
	tOriginal: IUniformTexture;
	tPrevious0: IUniformTexture;
	tPrevious1: IUniformTexture;
	tPosition0: IUniformTexture;
	tPosition1: IUniformTexture;
}
interface MouseUniforms extends RawMaterialUniforms {
	vertices: IUniformNArray
	coordinates: IUniformV3Array;
	order: IUniformN;
	tSize: IUniformV2;
	tOriginal: IUniformTexture;
	tPosition0: IUniformTexture;
	tPosition1: IUniformTexture;
}
interface ConstraintsUniforms extends RawMaterialUniforms {
	tSize: IUniformV2;
	order: IUniformN;
	tPosition0: IUniformTexture;
	tPosition1: IUniformTexture;
	tAdjacentsA: IUniformTexture;
	tAdjacentsB: IUniformTexture;
	tDistancesA: IUniformTexture;
	tDistancesB: IUniformTexture;
}
interface NormalsUniforms extends RawMaterialUniforms {
	tSize: IUniformV2;
	tPosition0: IUniformTexture;
	tPosition1: IUniformTexture;
	tAdjacentsA: IUniformTexture;
	tAdjacentsB: IUniformTexture;
}
interface CopyMaterial extends RawShaderMaterial {
	uniforms: CopyUniforms;
}
interface IntegrationMaterial extends RawShaderMaterial {
	uniforms: IntegrationUniforms;
}
interface MouseMaterial extends RawShaderMaterial {
	uniforms: MouseUniforms;
}
interface ConstraintsMaterial extends RawShaderMaterial {
	uniforms: ConstraintsUniforms;
}
interface NormalsMaterial extends RawShaderMaterial {
	uniforms: NormalsUniforms;
}

function createRawMaterial() {
	return new RawShaderMaterial({
		uniforms: {
			order: {value: null},
			tSize: {value: new Vector2()},
			texture: {value: null},
		},
		vertexShader: through_vert,
		fragmentShader: through_frag,
		fog: false,
		lights: false,
		depthWrite: false,
		depthTest: false,
	});
}

export class ClothMaterialController {
	// copyToRenderTarget
	public readonly copyShader: CopyMaterial = createRawMaterial() as CopyMaterial;

	// forward-integration
	public readonly integrateShader: IntegrationMaterial = createRawMaterial() as IntegrationMaterial;
	// mouse displacement
	public readonly mouseShader: MouseMaterial = createRawMaterial() as MouseMaterial;
	// vertices relaxation
	public readonly constraintsShader: ConstraintsMaterial = createRawMaterial() as ConstraintsMaterial;
	// calculate normals
	public readonly normalsShader: NormalsMaterial = createRawMaterial() as NormalsMaterial;

	constructor(public readonly mainController: ClothController) {
		this.integrateShader.fragmentShader = integrate_frag;
		this.integrateShader.uniforms = {
			dt: {value: 0},
			tSize: {value: new Vector2()},
			order: {value: -1},
			tOriginal: {value: null},
			tPrevious0: {value: null},
			tPrevious1: {value: null},
			tPosition0: {value: null},
			tPosition1: {value: null},
		};
		this.mouseShader.fragmentShader = mouse_frag;
		this.mouseShader.uniforms = {
			vertices: {value: []},
			coordinates: {value: [new Vector3()]},
			order: {value: -1},
			tSize: {value: new Vector2()},
			tOriginal: {value: null},
			tPosition0: {value: null},
			tPosition1: {value: null},
		};

		this.constraintsShader.fragmentShader = constraints_frag;
		this.constraintsShader.uniforms = {
			tSize: {value: new Vector2()},
			order: {value: -1},
			tPosition0: {value: null},
			tPosition1: {value: null},
			tAdjacentsA: {value: null},
			tAdjacentsB: {value: null},
			tDistancesA: {value: null},
			tDistancesB: {value: null},
		};

		this.normalsShader.fragmentShader = normals_frag;
		this.normalsShader.uniforms = {
			tSize: {value: new Vector2()},
			tPosition0: {value: null},
			tPosition1: {value: null},
			tAdjacentsA: {value: null},
			tAdjacentsB: {value: null},
		};
	}
}
