/**
 * Creates a Volume Material
 *
 * @remarks
 * This is experimental
 *
 */
import {ShaderMaterial} from 'three';
import {FrontSide} from 'three';
import {TypedMatNode} from './_Base';

import VERTEX from '../gl/gl/volume/vert.glsl';
import FRAGMENT from '../gl/gl/volume/frag.glsl';
import {VOLUME_UNIFORMS} from '../gl/gl/volume/uniforms';
import {UniformsUtils} from 'three';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CoreMaterial} from '../../../core/geometry/Material';
import {VolumeController, VolumeParamConfig} from './utils/VolumeController';
class VolumeMatParamsConfig extends VolumeParamConfig(NodeParamsConfig) {}
const ParamsConfig = new VolumeMatParamsConfig();

export class VolumeMatNode extends TypedMatNode<ShaderMaterial, VolumeMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'volume';
	}

	private _volumeController = new VolumeController(this);

	override createMaterial() {
		const mat = new ShaderMaterial({
			vertexShader: VERTEX,
			fragmentShader: FRAGMENT,
			side: FrontSide,
			transparent: true,
			depthTest: true,
			uniforms: UniformsUtils.clone(VOLUME_UNIFORMS),
		});

		CoreMaterial.addUserDataRenderHook(mat, VolumeController.renderHook.bind(VolumeController));

		return mat;
	}

	override initializeNode() {}
	override async cook() {
		this._volumeController.updateUniformsFromParams();

		this.setMaterial(this.material);
	}
}
