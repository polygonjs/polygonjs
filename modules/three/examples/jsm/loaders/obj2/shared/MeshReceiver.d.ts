import {
	Mesh
} from 'three';

import { MaterialHandler } from 'three';

export class MeshReceiver {

	constructor( materialHandler: MaterialHandler );
	logging: {
		enabled: boolean;
		debug: boolean;
	};
	callbacks: {
		onParseProgress: Function;
		onMeshAlter: Function;
	};
	materialHandler: MaterialHandler;

	buildMeshes( meshPayload: object ): Mesh[];
	setLogging( enabled: boolean, debug: boolean ): void;

}
