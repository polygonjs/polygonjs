import {Object3D} from 'three';
import {SpotLightContainer} from '../../core/lights/SpotLight';
import {ObjectNamedFunction2} from './_Base';

export class setSpotLightIntensity extends ObjectNamedFunction2<[number, number]> {
	static override type() {
		return 'setSpotLightIntensity';
	}
	func(object3D: Object3D, intensity: number, lerp: number): void {
		if (!(object3D instanceof SpotLightContainer)) {
			return;
		}
		const spotLight = (object3D as SpotLightContainer).light();
		const newIntensity = lerp * intensity + (1 - lerp) * spotLight.intensity;
		spotLight.intensity = newIntensity;
	}
}
