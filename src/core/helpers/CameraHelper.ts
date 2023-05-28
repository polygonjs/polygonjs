import {
	BufferAttribute,
	Camera,
	PerspectiveCamera,
	Vector3,
	LineSegments,
	Color,
	LineBasicMaterial,
	BufferGeometry,
	Float32BufferAttribute,
} from 'three';
import {PolyDictionary} from '../../types/GlobalTypes';

const _vector = /*@__PURE__*/ new Vector3();
const _camera = /*@__PURE__*/ new PerspectiveCamera();

/*
The CameraHelper is a modified version of the one shipped with Three.js.
The only modification is that the line

this.matrix = camera.matrixWorld;

has been commented out.
*/

/**
 *	- shows frustum, line of sight and up of the camera
 *	- suitable for fast updates
 * 	- based on frustum visualization in lightgl.js shadowmap example
 *		http://evanw.github.com/lightgl.js/tests/shadowmap.html
 */

type PointMap = PolyDictionary<number[]>;

function _createGeometry() {
	const geometry = new BufferGeometry();
	const colorFrustum = new Color(0xffaa00);
	const colorCone = new Color(0xff0000);
	const colorUp = new Color(0x00aaff);
	const colorTarget = new Color(0xffffff);
	const colorCross = new Color(0x333333);

	const vertices: number[] = [];
	const colors: number[] = [];

	const pointMap: PointMap = {};
	function addLine(a: string, b: string, color: Color) {
		addPoint(a, color);
		addPoint(b, color);
	}
	function addPoint(id: string, color: Color) {
		vertices.push(0, 0, 0);
		colors.push(color.r, color.g, color.b);

		if (pointMap[id] === undefined) {
			pointMap[id] = [];
		}

		pointMap[id].push(vertices.length / 3 - 1);
	}

	// near

	addLine('n1', 'n2', colorFrustum);
	addLine('n2', 'n4', colorFrustum);
	addLine('n4', 'n3', colorFrustum);
	addLine('n3', 'n1', colorFrustum);

	// far

	addLine('f1', 'f2', colorFrustum);
	addLine('f2', 'f4', colorFrustum);
	addLine('f4', 'f3', colorFrustum);
	addLine('f3', 'f1', colorFrustum);

	// sides

	addLine('n1', 'f1', colorFrustum);
	addLine('n2', 'f2', colorFrustum);
	addLine('n3', 'f3', colorFrustum);
	addLine('n4', 'f4', colorFrustum);

	// cone

	addLine('p', 'n1', colorCone);
	addLine('p', 'n2', colorCone);
	addLine('p', 'n3', colorCone);
	addLine('p', 'n4', colorCone);

	// up

	addLine('u1', 'u2', colorUp);
	addLine('u2', 'u3', colorUp);
	addLine('u3', 'u1', colorUp);

	// target

	addLine('c', 't', colorTarget);
	addLine('p', 'c', colorCross);

	// cross

	addLine('cn1', 'cn2', colorCross);
	addLine('cn3', 'cn4', colorCross);

	addLine('cf1', 'cf2', colorCross);
	addLine('cf3', 'cf4', colorCross);

	geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
	geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

	return {geometry, pointMap};
}
function _createMaterial() {
	return new LineBasicMaterial({color: 0xffffff, vertexColors: true, toneMapped: false});
}

class CameraHelper extends LineSegments {
	public readonly camera: Camera;
	private _pointMap: PointMap = {};
	constructor(camera: Camera) {
		super();
		this.camera = camera;
		if ((this.camera as PerspectiveCamera).updateProjectionMatrix) {
			(this.camera as PerspectiveCamera).updateProjectionMatrix();
		}

		this.name = 'CameraHelper';
		(this as any).type = 'CameraHelper';
		this.matrixAutoUpdate = false;

		const {geometry, pointMap} = _createGeometry();
		this.geometry = geometry;
		this._pointMap = pointMap;

		this.material = _createMaterial();
	}
	// private setCamera(camera: Camera) {
	// 	this._camera = camera;
	// 	if ((this._camera as PerspectiveCamera).updateProjectionMatrix) {
	// 		(this._camera as PerspectiveCamera).updateProjectionMatrix();
	// 	}
	// 	this.update();
	// }

	override clone() {
		const helper = new CameraHelper(this.camera);
		return helper as this;
	}

	update() {
		const geometry = this.geometry;
		const pointMap = this._pointMap;

		const w = 1,
			h = 1;

		// we need just camera projection matrix inverse
		// world matrix must be identity

		_camera.projectionMatrixInverse.copy(this.camera.projectionMatrixInverse);

		// center / target

		setPoint('c', pointMap, geometry, _camera, 0, 0, -1);
		setPoint('t', pointMap, geometry, _camera, 0, 0, 1);

		// near

		setPoint('n1', pointMap, geometry, _camera, -w, -h, -1);
		setPoint('n2', pointMap, geometry, _camera, w, -h, -1);
		setPoint('n3', pointMap, geometry, _camera, -w, h, -1);
		setPoint('n4', pointMap, geometry, _camera, w, h, -1);

		// far

		setPoint('f1', pointMap, geometry, _camera, -w, -h, 1);
		setPoint('f2', pointMap, geometry, _camera, w, -h, 1);
		setPoint('f3', pointMap, geometry, _camera, -w, h, 1);
		setPoint('f4', pointMap, geometry, _camera, w, h, 1);

		// up

		setPoint('u1', pointMap, geometry, _camera, w * 0.7, h * 1.1, -1);
		setPoint('u2', pointMap, geometry, _camera, -w * 0.7, h * 1.1, -1);
		setPoint('u3', pointMap, geometry, _camera, 0, h * 2, -1);

		// cross

		setPoint('cf1', pointMap, geometry, _camera, -w, 0, 1);
		setPoint('cf2', pointMap, geometry, _camera, w, 0, 1);
		setPoint('cf3', pointMap, geometry, _camera, 0, -h, 1);
		setPoint('cf4', pointMap, geometry, _camera, 0, h, 1);

		setPoint('cn1', pointMap, geometry, _camera, -w, 0, -1);
		setPoint('cn2', pointMap, geometry, _camera, w, 0, -1);
		setPoint('cn3', pointMap, geometry, _camera, 0, -h, -1);
		setPoint('cn4', pointMap, geometry, _camera, 0, h, -1);

		geometry.getAttribute('position').needsUpdate = true;
	}
}

function setPoint(
	point: string,
	pointMap: PointMap,
	geometry: BufferGeometry,
	camera: Camera,
	x: number,
	y: number,
	z: number
) {
	_vector.set(x, y, z).unproject(camera);

	const points = pointMap[point];

	if (points !== undefined) {
		const position = geometry.getAttribute('position') as BufferAttribute;

		for (let i = 0, l = points.length; i < l; i++) {
			position.setXYZ(points[i], _vector.x, _vector.y, _vector.z);
		}
	}
}

export {CameraHelper};
