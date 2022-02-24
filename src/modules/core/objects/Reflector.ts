// converted to typescript from:
// https://github.com/mrdoob/three.js/blob/dev/examples/jsm/objects/Reflector.js

import {Color} from 'three/src/math/Color';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {BaseReflector, BaseReflectorOptions} from './_BaseReflector';
import VERTEX from './reflector/vert.glsl';
import FRAGMENT from './reflector/frag.glsl';

const ReflectorShader = {
	uniforms: {
		color: {
			value: null,
		},
		tDiffuse: {
			value: null,
		},
		textureMatrix: {
			value: null,
		},
		opacity: {
			value: 0.5,
		},
	},
	vertexShader: VERTEX,
	fragmentShader: FRAGMENT,
};

interface ReflectorOptions extends BaseReflectorOptions {
	color: Color;
	opacity: number;
}

export class Reflector extends BaseReflector<BufferGeometry, ShaderMaterial> {
	constructor(public override geometry: BufferGeometry, protected override _options: ReflectorOptions) {
		super(geometry, _options);
	}
	protected _createMaterial() {
		const material = new ShaderMaterial({
			uniforms: UniformsUtils.clone(ReflectorShader.uniforms),
			fragmentShader: ReflectorShader.fragmentShader,
			vertexShader: ReflectorShader.vertexShader,
		});

		material.uniforms['color'].value = this._options.color;
		material.uniforms['textureMatrix'].value = this.textureMatrix;
		material.uniforms['opacity'].value = this._options.opacity;
		material.transparent = this._options.opacity < 1;
		return material;
	}
	protected _assignMaterialRenderTarget() {
		if (this.renderTarget) {
			this.material.uniforms['tDiffuse'].value = this.renderTarget.texture;
		}
	}

	override clone(recursive: boolean): this {
		// we clone so that a cloned reflector does not share the same color
		const clonedOptions = {...this._options};
		clonedOptions.color = this._options.color.clone();
		const clonedGeometry = this.geometry.clone();

		const clonedReflector = new Reflector(clonedGeometry, clonedOptions);
		const {material} = clonedReflector;
		clonedReflector.copy(this, recursive);
		// the material and geometry needs to be added back after the copy, as Mesh.copy would override that
		clonedReflector.material = material;
		clonedReflector.geometry = clonedGeometry;

		clonedReflector.updateMatrix();
		return clonedReflector as this;
	}
}
