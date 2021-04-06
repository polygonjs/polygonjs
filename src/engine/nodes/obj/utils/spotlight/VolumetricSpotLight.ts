// from
// https://github.com/jeromeetienne/threex.volumetricspotlight

import {SpotLightObjNode} from '../../SpotLight';
import {ConeBufferGeometry} from 'three/src/geometries/ConeGeometry';
import {Matrix4} from 'three/src/math/Matrix4';
import {Color} from 'three/src/math/Color';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {Mesh} from 'three/src/objects/Mesh';
import {isBooleanTrue} from '../../../../../core/BooleanValue';
import {SpotLightHelper} from '../helpers/SpotLightHelper';

import VERTEX from './glsl/vert.glsl';
import FRAGMENT from './glsl/frag.glsl';

interface SpotLightVolumetricMaterial extends ShaderMaterial {
	uniforms: {
		attenuation: {value: number};
		anglePower: {value: number};
		// spotPosition: {value: Vector3};
		lightColor: {value: Color};
	};
}

export class VolumetricSpotLight {
	private _mesh: Mesh<ConeBufferGeometry, SpotLightVolumetricMaterial> | undefined;
	constructor(public readonly node: SpotLightObjNode) {}

	update() {
		const pv = this.node.pv;
		if (isBooleanTrue(pv.tvolumetric)) {
			const object = this.object();
			const light = this.node.light;
			SpotLightHelper.updateConeObject(object, {
				sizeMult: pv.helperSize,
				distance: light.distance,
				angle: light.angle,
			});
			const uniforms = object.material.uniforms;
			uniforms.lightColor.value.copy(light.color);
			uniforms.attenuation.value = pv.volAttenuation;
			uniforms.anglePower.value = pv.volAnglePower;

			this.node.light.add(object);
		} else {
			if (this._mesh) {
				this.node.light.remove(this._mesh);
			}
		}
	}

	object() {
		return (this._mesh = this._mesh || this._createMesh());
	}

	private _createMesh() {
		const radius = 1;
		const height = 1;
		const radialSegments = 256;
		const heightSegments = 1;
		// TODO: consider using a tube instead of a cone, to allow:
		// - to have base with non zero radius
		// - possibly better normal interpolation
		// TODO: refactor the attenuation and anglePower in glsl
		// TODO: add a color ramp, or at least 2 colors, to allow for a brighter base
		// TODO: attenuation should depend on light.distance, not just on world distance
		const geometry = new ConeBufferGeometry(radius, height, radialSegments, heightSegments);
		geometry.applyMatrix4(new Matrix4().makeTranslation(0, -0.5 * height, 0));
		geometry.applyMatrix4(new Matrix4().makeRotationX(-Math.PI / 2));
		const material = this._createMaterial();
		const mesh = new Mesh(geometry, material);
		mesh.matrixAutoUpdate = false;
		mesh.name = `Volumetric`;
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
