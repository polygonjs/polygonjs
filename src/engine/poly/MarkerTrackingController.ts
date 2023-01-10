import type {CoreMarkerTrackingController} from '../../core/webXR/markerTracking/MarkerTrackingController';
import type {CoreMarkerTrackingControllerOptions} from '../../core/webXR/markerTracking/Common';

export type MarkerTrackingControllerCreateFunc = (
	options: CoreMarkerTrackingControllerOptions
) => CoreMarkerTrackingController;
export type MarkerTrackingBarCodeUrlFunc = (type: string, value: number) => string;

export interface MarkerTrackingConfig {
	barcodeUrl: MarkerTrackingBarCodeUrlFunc;
	createController: MarkerTrackingControllerCreateFunc;
	barCodes: {
		types: string[];
		valuesCountByType: Record<string, number>;
	};
}

export class PolyMarkerTrackingController {
	private _config: MarkerTrackingConfig | undefined;
	private _controller: CoreMarkerTrackingController | null = null;
	setConfig(config: MarkerTrackingConfig) {
		console.warn('setConfig', config);
		this._config = config;
	}
	barCodeUrl(type: string, value: number): string | void {
		if (this._config) {
			return this._config.barcodeUrl(type, value);
		}
	}
	barCodeTypes() {
		return this._config?.barCodes.types || [''];
	}
	config() {
		return this._config;
	}

	hasController(): boolean {
		return this._config != null;
	}

	createController(options: CoreMarkerTrackingControllerOptions) {
		if (!this._config) {
			return;
		}
		const controller = this._config.createController(options);
		this._controller = controller;
		return controller;
	}

	controller() {
		return this._controller;
	}
}
