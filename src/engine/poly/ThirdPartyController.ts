import {PolyThirdPartyMapboxController} from './thirdParty/Mapbox';
import {PolyMarkerTrackingController} from './thirdParty/MarkerTracking';

export class PolyThirdPartyController {
	//
	private _markerTracking: PolyMarkerTrackingController | undefined;
	markerTracking() {
		return (this._markerTracking = this._markerTracking || new PolyMarkerTrackingController());
	}
	//
	private _mapbox: PolyThirdPartyMapboxController | undefined;
	mapbox() {
		return (this._mapbox = this._mapbox || new PolyThirdPartyMapboxController());
	}
}
