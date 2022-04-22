/**
 * Creates a Sky Material
 *
 * @remarks
 *
 * For best result, assign this material to a very large box.
 *
 */
import {ShaderMaterial} from 'three';
import {TypedMatNode} from './_Base';
import {Vector3} from 'three';
import {Sky} from '../../../modules/three/examples/jsm/objects/Sky';

interface ShaderMaterialWithSkyUniforms extends ShaderMaterial {
	uniforms: {
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
	/** @param turbidity */
	turbidity = ParamConfig.FLOAT(2, {
		range: [0, 20],
	});
	/** @param rayleigh */
	rayleigh = ParamConfig.FLOAT(1, {
		range: [0, 4],
	});
	/** @param mieCoefficient */
	mieCoefficient = ParamConfig.FLOAT(0.005);
	/** @param mieDirectional */
	mieDirectional = ParamConfig.FLOAT(0.8);
	/** @param inclination */
	inclination = ParamConfig.FLOAT(0.5);
	/** @param azimuth */
	azimuth = ParamConfig.FLOAT(0.25);
	/** @param up */
	up = ParamConfig.VECTOR3([0, 1, 0]);
}
const ParamsConfig = new SkyMatParamsConfig();

export class SkyMatNode extends TypedMatNode<ShaderMaterialWithSkyUniforms, SkyMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'sky';
	}

	override createMaterial() {
		const object = new Sky();
		const mat = object.material as ShaderMaterialWithSkyUniforms;
		mat.depthWrite = true;
		return mat;
	}

	override async cook() {
		const uniforms = this.material.uniforms;
		uniforms.turbidity.value = this.pv.turbidity;
		uniforms.rayleigh.value = this.pv.rayleigh;
		uniforms.mieCoefficient.value = this.pv.mieCoefficient;
		uniforms.mieDirectionalG.value = this.pv.mieDirectional;
		uniforms.up.value.copy(this.pv.up);

		const theta = Math.PI * (this.pv.inclination - 0.5);
		const phi = 2 * Math.PI * (this.pv.azimuth - 0.5);

		uniforms.sunPosition.value.x = Math.cos(phi);
		uniforms.sunPosition.value.y = Math.sin(phi) * Math.sin(theta);
		uniforms.sunPosition.value.z = Math.sin(phi) * Math.cos(theta);

		this.setMaterial(this.material);
	}
}
