/**
 * Creates a Volume Material
 *
 * @remarks
 * This is experimental
 *
 */
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {FrontSide} from 'three/src/constants';
import {TypedMatNode} from './_Base';

import VERTEX from '../gl/gl/volume/vert.glsl';
import FRAGMENT from '../gl/gl/volume/frag.glsl';
import {VOLUME_UNIFORMS} from '../gl/gl/volume/uniforms';
import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreMaterial} from '../../../core/geometry/Material';
import {VolumeController} from './utils/VolumeController';
class VolumeMatParamsConfig extends NodeParamsConfig {
	color = ParamConfig.COLOR([1, 1, 1]);
	stepSize = ParamConfig.FLOAT(0.01);
	density = ParamConfig.FLOAT(1);
	shadowDensity = ParamConfig.FLOAT(1);
	lightDir = ParamConfig.VECTOR3([-1, -1, -1]);
}
const ParamsConfig = new VolumeMatParamsConfig();

export class VolumeMatNode extends TypedMatNode<ShaderMaterial, VolumeMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'volume';
	}

	private _volume_controller = new VolumeController(this);

	create_material() {
		const mat = new ShaderMaterial({
			vertexShader: VERTEX,
			fragmentShader: FRAGMENT,
			side: FrontSide,
			transparent: true,
			depthTest: true,
			uniforms: UniformsUtils.clone(VOLUME_UNIFORMS),
		});

		CoreMaterial.add_user_data_render_hook(mat, VolumeController.render_hook.bind(VolumeController));

		return mat;
	}

	initialize_node() {}
	async cook() {
		this._volume_controller.update_uniforms_from_params();

		this.set_material(this.material);
	}
}
