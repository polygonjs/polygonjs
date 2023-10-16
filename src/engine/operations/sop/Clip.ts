import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {
	Box3,
	InterleavedBufferAttribute,
	BufferAttribute,
	BufferGeometry,
	LineSegments,
	Mesh,
	Line3,
	BoxGeometry,
	Object3D,
	Vector3,
	Plane,
} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {MeshWithBVH, ExtendedTriangle} from '../../../core/geometry/bvh/three-mesh-bvh';
import {DEFAULT_MATERIALS, ObjectType} from '../../../core/geometry/Constant';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {ThreeMeshBVHHelper} from '../../../core/geometry/bvh/ThreeMeshBVHHelper';
import {isBooleanTrue} from '../../../core/Type';
import {SUBTRACTION, Brush, Evaluator} from '../../../core/thirdParty/three-bvh-csg';
import {rotateGeometry} from '../../../core/Transform';
import {CoreGeometryBuilderMesh} from '../../../core/geometry/modules/three/builders/Mesh';
import {objectCloneDeep} from '../../../core/ObjectUtils';
import {corePointClassFactory} from '../../../core/geometry/CoreObjectFactory';
import {pointsFromObject} from '../../../core/geometry/entities/point/CorePointUtils';
import {CorePoint} from '../../../core/geometry/entities/point/CorePoint';
import {CoreObjectType} from '../../../core/geometry/ObjectContent';

interface ClipSopParams extends DefaultOperationParams {
	origin: Vector3;
	distance: number;
	direction: Vector3;
	intersectionEdges: boolean;
	keepBelowPlane: boolean;
	keepAbovePlane: boolean;
}

const tempVector = new Vector3();
const tempLine = new Line3();
const _plane = new Plane();
const DEFAULT_UP = new Vector3(0, 1, 0);
const TMP_KEEP_ATTRIBUTE_NAME = '___keep___';
const TMP_KEEP_ATTRIBUTE_SIZE = 1;
const objectsToRemove: Set<Object3D> = new Set();
// const eye = new Vector3(0, 0, 0);
// const UP = new Vector3(0, 1, 0);
// const _matT = new Matrix4();
// const _matR = new Matrix4();
// const _mat = new Matrix4();
const BOOLEAN_SIZE = 10000;
const _points: CorePoint<CoreObjectType>[] = [];
export class ClipSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: ClipSopParams = {
		origin: new Vector3(0, 0, 0),
		distance: 0,
		direction: new Vector3(0, 1, 0),
		intersectionEdges: false,
		keepBelowPlane: true,
		keepAbovePlane: false,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.ALWAYS;
	static override type(): Readonly<'clip'> {
		return 'clip';
	}
	override cook(inputCoreGroups: CoreGroup[], params: ClipSopParams) {
		const coreGroup = inputCoreGroups[0];
		const newObjects: Object3D[] = [];

		_plane.set(params.direction, -params.distance);
		_plane.translate(params.origin);

		const inputObjects = coreGroup.threejsObjects();
		objectsToRemove.clear();
		for (let object of inputObjects) {
			object.traverse((child) => {
				_processObjectClipped(child, params, newObjects);
			});
		}
		objectsToRemove.forEach((child) => {
			child.removeFromParent();
		});

		return this.createCoreGroupFromObjects(newObjects);
	}
}
function _processObjectClipped(object: Object3D, params: ClipSopParams, newObjects: Object3D[]) {
	const geometry = (object as Mesh).geometry;
	if (!geometry) {
		return;
	}
	const mesh = object as Mesh;

	function _addObject(newObject: Object3D) {
		newObjects.push(newObject);
		copyObjectProperties(object, newObject);
		objectsToRemove.add(object);
	}

	if (isBooleanTrue(params.intersectionEdges)) {
		const intersectionEdges = _createClipGeo(mesh);
		if (intersectionEdges) {
			_addObject(intersectionEdges);
		}
	}
	if (isBooleanTrue(params.keepBelowPlane) || isBooleanTrue(params.keepAbovePlane)) {
		if (isBooleanTrue(params.keepBelowPlane)) {
			const box = _createBox(params, true);
			const belowPlane = _createClipped(mesh, box);
			_addObject(belowPlane);
		}
		if (isBooleanTrue(params.keepAbovePlane)) {
			const box = _createBox(params, false);
			const abovePlane = _createClipped(mesh, box);
			_addObject(abovePlane);
		}
	}
}
function _createClipped(mesh: Mesh, box: Mesh) {
	const csgEvaluator = new Evaluator();
	const corePointClass = corePointClassFactory(mesh);

	// add keep attribute for mesh (value=1)
	function _addKeepAttribute(object: Mesh, value: number) {
		corePointClass.addNumericAttribute(object, TMP_KEEP_ATTRIBUTE_NAME, TMP_KEEP_ATTRIBUTE_SIZE, value);
	}
	_addKeepAttribute(mesh, 1);
	_addKeepAttribute(box, 0);

	// perform boolean operation
	const brush1 = new Brush(mesh.geometry, mesh.material);
	const brush2 = new Brush(box.geometry);
	const existingAttributes = corePointClass.attributeNames(mesh);
	csgEvaluator.attributes = [...existingAttributes, TMP_KEEP_ATTRIBUTE_NAME];
	const output = csgEvaluator.evaluate(brush1, brush2, SUBTRACTION);

	output.disposeCacheData();
	BaseSopOperation.createIndexIfNone(output.geometry);

	// delete attributes where keep attribute == 0
	// const outCoreGeometry = new CoreGeometry(output.geometry);
	pointsFromObject(output, _points);
	const keptPoints = _points.filter((p) => p.attribValue(TMP_KEEP_ATTRIBUTE_NAME) == 1);
	const builder = new CoreGeometryBuilderMesh();
	const newGeometry = builder.fromPoints(output, keptPoints);

	const object = BaseSopOperation.createObject(newGeometry, ObjectType.MESH);
	return object;
}

function _createBox(params: ClipSopParams, above: boolean) {
	const {origin, direction, distance} = params;
	const geometry = new BoxGeometry(BOOLEAN_SIZE, BOOLEAN_SIZE, BOOLEAN_SIZE, 2, 2, 2);
	geometry.translate(0, BOOLEAN_SIZE * 0.5 * (above ? 1 : -1), 0);

	geometry.translate(origin.x, origin.y + distance, origin.z);
	rotateGeometry(geometry, DEFAULT_UP, direction);
	// geometry.lookAt(direction);
	const object = BaseSopOperation.createObject(geometry, ObjectType.MESH);
	// _matT.identity();
	// _matR.identity();
	// _mat.identity();
	// _matT.makeTranslation(origin.x, origin.y + distance, origin.z);
	// _matR.lookAt(eye, direction, UP);
	// _mat.multiplyMatrices(_matT, _matR);
	// object.matrix.copy(_mat);
	return object;
}

function _createClipGeo(mesh: Mesh) {
	const meshBVH = mesh as MeshWithBVH;

	let bvh = meshBVH.geometry.boundsTree;
	if (!bvh) {
		ThreeMeshBVHHelper.assignDefaultBVHIfNone(mesh);
		bvh = meshBVH.geometry.boundsTree;
	}

	const performIntersection = (posAttrib?: BufferAttribute | InterleavedBufferAttribute) => {
		let index = 0;

		const intersectsBounds = (
			box: Box3,
			isLeaf: boolean,
			score: number | undefined,
			depth: number,
			nodeIndex: number
		) => {
			return _plane.intersectsBox(box);
		};
		const intersectsTriangle = (tri: ExtendedTriangle) => {
			// check each triangle edge to see if it intersects with the plane. If so then
			// add it to the list of segments.
			let count = 0;
			tempLine.start.copy(tri.a);
			tempLine.end.copy(tri.b);
			if (_plane.intersectLine(tempLine, tempVector)) {
				posAttrib?.setXYZ(index, tempVector.x, tempVector.y, tempVector.z);
				index++;
				count++;
			}

			tempLine.start.copy(tri.b);
			tempLine.end.copy(tri.c);
			if (_plane.intersectLine(tempLine, tempVector)) {
				posAttrib?.setXYZ(index, tempVector.x, tempVector.y, tempVector.z);
				count++;
				index++;
			}

			tempLine.start.copy(tri.c);
			tempLine.end.copy(tri.a);
			if (_plane.intersectLine(tempLine, tempVector)) {
				posAttrib?.setXYZ(index, tempVector.x, tempVector.y, tempVector.z);
				count++;
				index++;
			}

			// If we only intersected with one or three sides then just remove it. This could be handled
			// more gracefully.
			if (count !== 2) {
				index -= count;
			}
		};

		bvh.shapecast({
			intersectsBounds,
			intersectsTriangle,
		});
		return {index};
	};
	// we perform the intersection once to know the required size of the position attribute
	const {index} = performIntersection();
	const lineGeometry = new BufferGeometry();
	const linePosAttr = new BufferAttribute(new Float32Array(index * 3), 3, false);
	// No index is added for now, as this would add internal lines.
	// But this means that this geometry cannot yet be processed by operations that require indices,
	// such as sop/polywire.
	// const indices: number[] = new Array(index * 2);
	// for (let i = 0; i < index - 1; i++) {
	// 	indices[i * 2] = i;
	// 	indices[i * 2 + 1] = i + 1;
	// }
	// lineGeometry.setIndex(indices);
	lineGeometry.setAttribute('position', linePosAttr);
	const outlineLines = new LineSegments(lineGeometry, DEFAULT_MATERIALS[ObjectType.LINE_SEGMENTS]);
	outlineLines.frustumCulled = false;

	const posAttr = outlineLines.geometry.attributes.position as BufferAttribute;
	// and we perform the intersection a second time to actually set the position attribute values
	performIntersection(posAttr);

	return outlineLines;
}

export function copyObjectProperties(src: Object3D, target: Object3D) {
	target.visible = src.visible;
	target.name = src.name;
	target.castShadow = src.castShadow;
	target.receiveShadow = src.receiveShadow;
	target.userData = objectCloneDeep(src.userData);
}
