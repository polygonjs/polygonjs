// from
// https://github.com/jeromeetienne/threex.volumetricspotlight

import {Mesh, ShaderMaterial, Color, Matrix4, ConeGeometry} from 'three';

import VERTEX from './glsl/vert.glsl';
import FRAGMENT from './glsl/frag.glsl';
import {isBooleanTrue} from '../../Type';
import type {SpotLightContainer} from '../SpotLight';
import {CoreSpotLightHelper} from './CoreSpotLightHelper';

interface SpotLightVolumetricMaterial extends ShaderMaterial {
	uniforms: {
		attenuation: {value: number};
		anglePower: {value: number};
		// spotPosition: {value: Vector3};
		lightColor: {value: Color};
	};
}

export interface VolumetricSpotLightParams {
	tvolumetric: boolean;
	volAttenuation: number;
	volAnglePower: number;
}

export class VolumetricSpotLight {
	private _mesh: Mesh<ConeGeometry, SpotLightVolumetricMaterial> | undefined;
	constructor(public readonly container: SpotLightContainer) {}

	update(params: VolumetricSpotLightParams) {
		const light = this.container.light();
		if (isBooleanTrue(params.tvolumetric)) {
			const object = this.object();

			CoreSpotLightHelper.transformObject(object, {
				sizeMult: 1,
				distance: light.distance,
				angle: light.angle,
			});
			const uniforms = object.material.uniforms;
			uniforms.lightColor.value.copy(light.color);
			uniforms.attenuation.value = params.volAttenuation;
			uniforms.anglePower.value = params.volAnglePower;

			light.add(object);
		} else {
			if (this._mesh) {
				light.remove(this._mesh);
			}
		}
	}

	object() {
		return (this._mesh = this._mesh || this._createMesh());
	}

	private _createMesh() {
		const radius = 1;
		const height = 1;
		const radialSegments = 128;
		const heightSegments = 32;
		// TODO: consider using a tube instead of a cone, to allow:
		// - to have base with non zero radius
		// - possibly better normal interpolation
		// TODO: refactor the attenuation and anglePower in glsl
		// TODO: add a color ramp, or at least 2 colors, to allow for a brighter base
		// TODO: attenuation should depend on light.distance, not just on world distance
		const geometry = new ConeGeometry(radius, height, radialSegments, heightSegments);
		geometry.applyMatrix4(new Matrix4().makeTranslation(0, -0.5 * height, 0));
		geometry.applyMatrix4(new Matrix4().makeRotationX(-Math.PI / 2));
		const material = this._createMaterial();
		const mesh = new Mesh(geometry, material);
		mesh.matrixAutoUpdate = false;
		mesh.name = `VolumetricSpotLight_${this.container.nodeName}`;
		material.uniforms.lightColor.value.set('white');

		return mesh;
	}

	private _createMaterial() {
		const material = new ShaderMaterial({
			uniforms: {
				attenuation: {
					value: 5.0,
				},
				anglePower: {
					value: 1.2,
				},
				lightColor: {
					value: new Color('cyan'),
				},
			},
			vertexShader: VERTEX,
			fragmentShader: FRAGMENT,
			// blending	: THREE.AdditiveBlending,
			transparent: true,
			depthWrite: false,
		}) as SpotLightVolumetricMaterial;
		return material;
	}
}
