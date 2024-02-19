import {Object3D, SpotLight} from 'three';
import {SpotLightContainer} from '../../core/lights/SpotLight';
import {ObjectNamedFunction2} from './_Base';
import {isFunction} from '../../core/Type';

export class setSpotLightIntensity extends ObjectNamedFunction2<[number, number]> {
	static override type() {
		return 'setSpotLightIntensity';
	}
	func(object3D: Object3D, intensity: number, lerp: number): void {
		let spotLight = object3D as SpotLight;
		// test the presence of the intensity property, instead of testing with instanceof
		// as this is not reliable when using multiple versions of threejs are loaded,
		// or when using PhysicalSpotLight
		if (spotLight.intensity == null) {
			if (isFunction((object3D as SpotLightContainer).light)) {
				spotLight = (object3D as SpotLightContainer).light();
			}
		}
		if (spotLight.intensity == null) {
			return;
		}

		const newIntensity = lerp * intensity + (1 - lerp) * spotLight.intensity;
		spotLight.intensity = newIntensity;
	}
}
