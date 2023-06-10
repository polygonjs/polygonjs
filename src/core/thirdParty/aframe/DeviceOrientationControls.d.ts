import type {Object3D} from 'three';

export class DeviceOrientationControls {
	public readonly enabled: boolean;
	constructor(object: Object3D);

	dispose(): void;
	update(): void;
}
