import {Constructor} from '../../../../types/GlobalTypes';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {TypedMatNode} from '../_Base';
import {
	Material,
	WebGLRenderer,
	Scene,
	Camera,
	BufferGeometry,
	Group,
	Object3D,
	Box3,
	ShaderMaterial,
	Vector3,
	Light,
	SpotLight,
} from 'three';

// import {ShaderMaterialWithCustomMaterials} from '../../../../core/geometry/Material';

export function RayMarchingParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param this volume material currently can only use a single white light, whose direction is defined by this parameter */
		lightDir = ParamConfig.VECTOR3([-1, -1, -1]);
	};
}
class RayMarchingMaterial extends Material {}
class RayMarchingParamsConfig extends RayMarchingParamConfig(NodeParamsConfig) {}

abstract class RayMarchingMatNode extends TypedMatNode<RayMarchingMaterial, RayMarchingParamsConfig> {}

const tmpV = new Vector3();

export class RayMarchingController {
	constructor(protected node: RayMarchingMatNode) {}

	private static _objectBbox = new Box3();
	static render_hook(
		renderer: WebGLRenderer,
		scene: Scene,
		camera: Camera,
		geometry: BufferGeometry,
		material: Material,
		group: Group | null,
		object: Object3D
	) {
		if (object) {
			// here I set uniforms containing the worldPosition of the spotLights
			// since I could not find a way to convert the threejs spotLights uniforms
			// which contain the lights positions in camera space, into world space.
			// TODO: ideally this should be done once for the scene, not for each object/material.
			this._objectBbox.setFromObject(object);
			const shaderMaterial = material as ShaderMaterial;
			// shader_material.uniforms.u_BoundingBoxMin.value.copy(this._objectBbox.min);
			// shader_material.uniforms.u_BoundingBoxMax.value.copy(this._objectBbox.max);
			let i = 0;
			scene.traverse((child) => {
				if ((child as Light).isLight) {
					if ((child as SpotLight).isSpotLight) {
						(child as SpotLight).getWorldPosition(tmpV);
						// console.log(tmpV.toArray());
						shaderMaterial.uniforms.spotLightsRayMarching.value[i] = shaderMaterial.uniforms
							.spotLightsRayMarching.value[i] || {
							worldPos: new Vector3(),
						};
						shaderMaterial.uniforms.spotLightsRayMarching.value[i].worldPos.copy(tmpV);
						shaderMaterial.uniforms.spotLightsRayMarching.value.needsUpdate = true;
						i++;
					}
				}
			});
		}
	}

	updateUniformsFromParams() {
		// const shaderMaterial = this.node.material as ShaderMaterialWithCustomMaterials;
		// const uniforms = shaderMaterial.uniforms;
		// if (!uniforms) {
		// 	return;
		// }
		// const dir_light = uniforms.u_DirectionalLightDirection.value; //[0];
		// const pv_dir_light = this.node.pv.lightDir;
		// if (dir_light) {
		// 	/*
		// 	do not use Vector3.copy, as it fails when the volume material is loaded again after
		// 	being persisted in the persisted config, as the MaterialLoader fails to load a vector array in the uniforms
		// 	*/
		// 	dir_light.x = pv_dir_light.x;
		// 	dir_light.y = pv_dir_light.y;
		// 	dir_light.z = pv_dir_light.z;
		// }
	}
}
