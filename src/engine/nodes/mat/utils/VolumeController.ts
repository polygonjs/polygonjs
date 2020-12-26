import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {TypedMatNode} from '../_Base';
import {Material} from 'three/src/materials/Material';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {Scene} from 'three/src/scenes/Scene';
import {Camera} from 'three/src/cameras/Camera';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Geometry} from 'three/src/core/Geometry';
import {Group} from 'three/src/objects/Group';
import {Box3} from 'three/src/math/Box3';
import {Object3D} from 'three/src/core/Object3D';

export function TextureMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		color = ParamConfig.COLOR([1, 1, 1]);
		stepSize = ParamConfig.FLOAT(0.01);
		density = ParamConfig.FLOAT(1);
		shadowDensity = ParamConfig.FLOAT(1);
		lightDir = ParamConfig.VECTOR3([-1, -1, -1]);
	};
}
class VolumeMaterial extends ShaderMaterial {}
class TextureMapParamsConfig extends TextureMapParamConfig(NodeParamsConfig) {}

abstract class VolumeMatNode extends TypedMatNode<VolumeMaterial, TextureMapParamsConfig> {}

export class VolumeController {
	constructor(private node: VolumeMatNode) {}

	private static _object_bbox = new Box3();
	static render_hook(
		renderer: WebGLRenderer,
		scene: Scene,
		camera: Camera,
		geometry: BufferGeometry | Geometry,
		material: Material,
		group: Group | null,
		object: Object3D
	) {
		if (object) {
			this._object_bbox.setFromObject(object);
			const shader_material = material as ShaderMaterial;
			shader_material.uniforms.u_BoundingBoxMin.value.copy(this._object_bbox.min);
			shader_material.uniforms.u_BoundingBoxMax.value.copy(this._object_bbox.max);
		}
	}

	update_uniforms_from_params() {
		const uniforms = this.node.material.uniforms;

		uniforms.u_Color.value.copy(this.node.pv.color);
		uniforms.u_StepSize.value = this.node.pv.stepSize;
		uniforms.u_VolumeDensity.value = this.node.pv.density;
		uniforms.u_ShadowDensity.value = this.node.pv.shadowDensity;

		const dir_light = uniforms.u_DirectionalLightDirection.value; //[0];
		const pv_dir_light = this.node.pv.lightDir;
		if (dir_light) {
			/*
			do not use Vector3.copy, as it fails when the volume material is loaded again after
			being persisted in the persisted config, as the MaterialLoader fails to load a vector array in the uniforms
			*/
			dir_light.x = pv_dir_light.x;
			dir_light.y = pv_dir_light.y;
			dir_light.z = pv_dir_light.z;
		}
	}
}
