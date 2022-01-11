// Helper for passes that need to fill the viewport with a single quad.

import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Mesh} from 'three/src/objects/Mesh';
import {OrthographicCamera} from 'three/src/cameras/OrthographicCamera';
import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {Material} from 'three/src/materials/Material';

const _camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

// https://github.com/mrdoob/three.js/pull/21358

const _geometry = new BufferGeometry();
_geometry.setAttribute('position', new Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3));
_geometry.setAttribute('uv', new Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));

export class FullScreenQuad {
	private _mesh: Mesh;
	constructor(material?: Material) {
		this._mesh = new Mesh(_geometry, material);
	}

	dispose() {
		this._mesh.geometry.dispose();
	}

	render(renderer: WebGLRenderer) {
		renderer.render(this._mesh, _camera);
	}

	get material() {
		return this._mesh.material;
	}

	set material(value) {
		this._mesh.material = value;
	}
}
