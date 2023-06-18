import {NamedFunction0} from './_Base';
import {Ref, ref} from '@vue/reactivity';

interface lngLat {
	lng: number;
	lat: number;
}

const coordinates: Ref<lngLat> = ref({lng: 0, lat: 0});

function getCurrentPositionHandler(position: GeolocationPosition) {
	const {latitude, longitude} = position.coords;
	coordinates.value.lat = latitude;
	coordinates.value.lng = longitude;
}

export class geolocationCurrentPositionRef extends NamedFunction0 {
	static override type() {
		return 'geolocationCurrentPositionRef';
	}
	func(): Ref<lngLat> {
		return coordinates;
	}
}

export class geolocationLatitude extends NamedFunction0 {
	static override type() {
		return 'geolocationLatitude';
	}
	func(): number {
		return coordinates.value.lat;
	}
}
export class geolocationLongitude extends NamedFunction0 {
	static override type() {
		return 'geolocationLongitude';
	}
	func(): number {
		return coordinates.value.lng;
	}
}

export class geolocationGetCurrentPosition extends NamedFunction0 {
	static override type() {
		return 'geolocationGetCurrentPosition';
	}
	func(): void {
		navigator.geolocation.getCurrentPosition(getCurrentPositionHandler);
	}
}
