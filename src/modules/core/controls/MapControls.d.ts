import {Camera} from 'three';

import {OrbitControls} from './OrbitControls';

export class MapControls extends OrbitControls {
	constructor(object: Camera, domElement?: HTMLElement);
}
