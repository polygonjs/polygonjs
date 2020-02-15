import {BaseController} from './_BaseController';
import {TypedMatNode} from '../_Base';

import {VertexColors} from 'three/src/constants';
import {NoColors} from 'three/src/constants';
import {Material} from 'three/src/materials/Material';
import {Color} from 'three/src/math/Color';
// import {Material} from 'three/src/materials/Material';
// import {IUniform} from 'three/src/renderers/shaders/UniformsLib';
// import {Color} from 'three/src/math/Color';
// import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';

// interface AddParamsOptions {
// 	flat_shading?: boolean;
// }

// interface MaterialWithUniforms extends Material {
// 	color: Color;
// 	uniforms: {
// 		diffuse: IUniform;
// 		opacity: IUniform;
// 		use_fog: IUniform;
// 	};
// }

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';

export function ColorParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		color = ParamConfig.COLOR([1, 1, 1]);
		use_vertex_colors = ParamConfig.BOOLEAN(0);
		transparent = ParamConfig.BOOLEAN(0);
		opacity = ParamConfig.FLOAT(1);
		alpha_test = ParamConfig.FLOAT(0);
		use_fog = ParamConfig.BOOLEAN(0);
	};
}

class ColoredMaterial extends Material {
	public color!: Color;
	vertexColors!: number;
	transparent!: boolean;
	depthTest!: boolean;
	alphaTest!: number;
	fog!: boolean;
}
class ColorParamsConfig extends ColorParamConfig(NodeParamsConfig) {}
class ColoredMatNode extends TypedMatNode<ColoredMaterial, ColorParamsConfig> {
	create_material() {
		return new ColoredMaterial();
	}
}

export class ColorsController extends BaseController {
	// add_params(options: AddParamsOptions = {}) {
	// 	// this.node.add_param(ParamType.COLOR, 'color', [1, 1, 1]);
	// 	// this.node.add_param(ParamType.BOOLEAN, 'use_vertex_colors', 0);
	// 	// if (options['flat_shading'] != false) {
	// 	// 	// for points
	// 	// 	this.node.add_param(ParamType.BOOLEAN, 'flat_shading', 0);
	// 	// }
	// 	// this.node.add_param(ParamType.BOOLEAN, 'transparent', 0);
	// 	// this.node.add_param(ParamType.FLOAT, 'opacity', 1);
	// 	// this.node.add_param(ParamType.FLOAT, 'alpha_test', 0);
	// 	// if (this.__fog_used_in_uniforms()) {
	// 	// 	this.node.add_param(ParamType.BOOLEAN, 'use_fog', 1);
	// 	// }
	// }

	static update(node: ColoredMatNode) {
		const material = node.material;
		const pv = node.pv;
		material.color.copy(pv.color);
		material.vertexColors = pv.use_vertex_colors ? VertexColors : NoColors;

		material.opacity = pv.opacity;
		material.transparent = pv.transparent || pv.opacity < 1;
		if (material.transparent) {
			material.depthTest = true;
		}
		material.alphaTest = pv.alpha_test;
		material.fog = pv.use_fog;
	}

	// update() {
	// 	if (this.__has_uniforms()) {
	// 		this.material.uniforms.diffuse.value = this._param_color;
	// 	} else {
	// 		this.material.color = this._param_color;
	// 		this.material.flatShading = this._param_flat_shading;
	// 	}

	// 	if (this.__has_uniforms()) {
	// 		this.material.uniforms.opacity.value = this._param_opacity;
	// 	} else {
	// 		this.material.opacity = this._param_opacity;
	// 	}
	// 	this.material.transparent = this._param_transparent || this.material.opacity < 1;
	// 	if (this.material.transparent) {
	// 		this.material.depthTest = true;
	// 	}
	// 	this.material.alphaTest = this._param_alpha_test;

	// 	this.set_user_vertex_colors(this.material, this._param_use_vertex_colors);

	// 	if (this.__fog_used_in_uniforms()) {
	// 		this.material.fog = this._param_use_fog;
	// 	}
	// }

	// get material() {
	// 	return this.node.material as MaterialWithUniforms;
	// }
	// get _param_color() {
	// 	return this.node.params.color('color');
	// }
	// get _param_flat_shading() {
	// 	return this.node.params.boolean('flat_shading');
	// }
	// get _param_opacity() {
	// 	return this.node.params.float('opacity');
	// }
	// get _param_transparent() {
	// 	return this.node.params.boolean('transparent');
	// }
	// get _param_alpha_test() {
	// 	return this.node.params.float('alpha_test');
	// }
	// get _param_use_vertex_colors() {
	// 	return this.node.params.boolean('use_vertex_colors');
	// }
	// get _param_use_fog() {
	// 	return this.node.params.boolean('use_fog');
	// }

	// protected __has_uniforms(): boolean {
	// 	return this.material && this.material.uniforms != null;
	// }
	// protected __fog_used_in_uniforms(): boolean {
	// 	return this.material && (this.material.uniforms == null || this.material.uniforms.use_fog != null);
	// }

	// private set_user_vertex_colors(material: Material, use_vertex_colors: boolean) {
	// 	material.vertexColors = use_vertex_colors ? VertexColors : NoColors;
	// 	if (this.__has_uniforms()) {
	// 		material.needsUpdate = true;
	// 	}
	// }
}
