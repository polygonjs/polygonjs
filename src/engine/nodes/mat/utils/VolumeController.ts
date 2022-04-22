import {Constructor} from '../../../../types/GlobalTypes';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {TypedMatNode} from '../_Base';
import {Material} from 'three';
import {ShaderMaterial} from 'three';
import {WebGLRenderer} from 'three';
import {Scene} from 'three';
import {Camera} from 'three';
import {BufferGeometry} from 'three';
import {Geometry} from '../../../../modules/three/examples/jsm/deprecated/Geometry';
import {Group} from 'three';
import {Box3} from 'three';
import {Object3D} from 'three';
import {ShaderMaterialWithCustomMaterials} from '../../../../core/geometry/Material';

export function VolumeParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param color */
		color = ParamConfig.COLOR([1, 1, 1]);
		/** @param stepSize. The smaller the value the more step the shader will make */
		stepSize = ParamConfig.FLOAT(0.01);
		/** @param volume density */
		density = ParamConfig.FLOAT(1);
		/** @param volume shadow density */
		shadowDensity = ParamConfig.FLOAT(1);
		/** @param this volume material currently can only use a single white light, whose direction is defined by this parameter */
		lightDir = ParamConfig.VECTOR3([-1, -1, -1]);
	};
}
class VolumeMaterial extends Material {}
class VolumeParamsConfig extends VolumeParamConfig(NodeParamsConfig) {}

abstract class VolumeMatNode extends TypedMatNode<VolumeMaterial, VolumeParamsConfig> {}

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
		const shaderMaterial = this.node.material as ShaderMaterialWithCustomMaterials;
		const uniforms = shaderMaterial.uniforms;
		if (!uniforms) {
			return;
		}

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
