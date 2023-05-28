import VERTEX from './GroundProjectedSkybox.vert.glsl';
import FRAGMENT from './GroundProjectedSkybox.frag.glsl';
import {
	Mesh,
	IcosahedronGeometry,
	ShaderMaterial,
	DoubleSide,
	Texture,
	CubeTexture,
	IUniform,
	BufferGeometry,
	Material,
} from 'three';
import {IUniformN, IUniformTexture} from '../../../../engine/nodes/utils/code/gl/Uniforms';

/**
 * Ground projected env map adapted from @react-three/drei.
 * https://github.com/pmndrs/drei/blob/master/src/core/Environment.tsx
 * and
 * https://github.com/mrdoob/three.js/blob/master/examples/webgl_materials_envmaps_groundprojected.html
 */
type ShaderMaterialUniform = {[uniform: string]: IUniform};
interface GroundProjectedSkyboxMaterialUniforms extends ShaderMaterialUniform {
	map: IUniformTexture;
	height: IUniformN;
	radius: IUniformN;
}

interface GroundProjectedSkyboxMaterial extends ShaderMaterial {
	uniforms: GroundProjectedSkyboxMaterialUniforms;
}
function _geometry() {
	return new IcosahedronGeometry(1, 16);
}
function _material() {
	const uniforms: GroundProjectedSkyboxMaterialUniforms = {
		map: {value: null},
		height: {value: 15},
		radius: {value: 100},
	};
	const material: GroundProjectedSkyboxMaterial = new ShaderMaterial({
		uniforms,
		fragmentShader: '',
		vertexShader: VERTEX,
		side: DoubleSide,
	}) as GroundProjectedSkyboxMaterial;

	return material;
}

export class GroundProjectedSkybox extends Mesh {
	public override material!: GroundProjectedSkyboxMaterial;
	public override geometry = new IcosahedronGeometry(1, 16);

	constructor(geometry?: BufferGeometry, material?: Material) {
		super(_geometry(), _material());
	}
	setTexture(texture: Texture) {
		const isCubeMap = (texture as CubeTexture).isCubeTexture;

		const defines = [isCubeMap ? '#define ENVMAP_TYPE_CUBE' : ''];

		const fragmentShader = defines.join('\n') + FRAGMENT;
		this.material.fragmentShader = fragmentShader;
		this.material.needsUpdate = true;

		this.material.uniforms.map.value = texture;
	}

	set radius(radius) {
		this.material.uniforms.radius.value = radius;
	}

	get radius() {
		return this.material.uniforms.radius.value;
	}

	set height(height) {
		this.material.uniforms.height.value = height;
	}

	get height() {
		return this.material.uniforms.height.value;
	}

	override copy(source: this, recursive: boolean) {
		super.copy(source, recursive);

		this.radius = source.radius;
		this.height = source.height;

		return this;
	}
}
