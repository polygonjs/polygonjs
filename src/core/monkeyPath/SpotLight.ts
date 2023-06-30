import {SpotLight} from 'three';

export function monkeyPatchSpotLight(spotLight: SpotLight) {
	const previousCopy = spotLight.copy.bind(spotLight);
	spotLight.copy = function (source: SpotLight, recursive: boolean) {
		const clonedSpotLight = previousCopy(source, recursive);
		clonedSpotLight.map = source.map;
		monkeyPatchSpotLight(clonedSpotLight);
		return clonedSpotLight;
	};
}
