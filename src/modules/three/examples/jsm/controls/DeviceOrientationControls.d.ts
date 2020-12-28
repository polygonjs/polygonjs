import { Camera, EventDispatcher } from 'three';

export class DeviceOrientationControls extends EventDispatcher {

	constructor( object: Camera );

	object: Camera;

	// API

	alphaOffset: number;
	deviceOrientation: any;
	enabled: boolean;
	screenOrientation: number;

	connect(): void;
	disconnect(): void;
	dispose(): void;
	update(): void;

}
