import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {TypedMatNode} from './_Base';
import {Vector3} from 'three/src/math/Vector3';
import {Sky} from '../../../../modules/three/examples/jsm/objects/Sky';

interface ShaderMaterialWithSkyUniforms extends ShaderMaterial {
	uniforms: {
		luminance: {value: number};
		turbidity: {value: number};
		rayleigh: {value: number};
		mieCoefficient: {value: number};
		mieDirectionalG: {value: number};
		sunPosition: {value: Vector3};
		up: {value: Vector3};
	};
}

import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
class SkyMatParamsConfig extends NodeParamsConfig {
	luminance = ParamConfig.FLOAT(1, {
		range: [0, 2],
	});
	turbidity = ParamConfig.FLOAT(2, {
		range: [0, 20],
	});
	rayleigh = ParamConfig.FLOAT(1, {
		range: [0, 4],
	});
	mie_coefficient = ParamConfig.FLOAT(0.005);
	mie_directional = ParamConfig.FLOAT(0.8);
	inclination = ParamConfig.FLOAT(0.5);
	azimuth = ParamConfig.FLOAT(0.25);
	up = ParamConfig.VECTOR3([0, 1, 0]);
}
const ParamsConfig = new SkyMatParamsConfig();

export class SkyMatNode extends TypedMatNode<ShaderMaterialWithSkyUniforms, SkyMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'sky';
	}

	create_material() {
		const object = new Sky();
		const mat = object.material as ShaderMaterialWithSkyUniforms;
		mat.depthWrite = true;
		return mat;
	}

	async cook() {
		const uniforms = this.material.uniforms;
		uniforms.luminance.value = 2 - this.pv.luminance;
		uniforms.turbidity.value = this.pv.turbidity;
		uniforms.rayleigh.value = this.pv.rayleigh;
		uniforms.mieCoefficient.value = this.pv.mie_coefficient;
		uniforms.mieDirectionalG.value = this.pv.mie_directional;
		uniforms.up.value.copy(this.pv.up);

		const theta = Math.PI * (this.pv.inclination - 0.5);
		const phi = 2 * Math.PI * (this.pv.azimuth - 0.5);

		uniforms.sunPosition.value.x = Math.cos(phi);
		uniforms.sunPosition.value.y = Math.sin(phi) * Math.sin(theta);
		uniforms.sunPosition.value.z = Math.sin(phi) * Math.cos(theta);

		this.set_material(this.material);
	}
}
