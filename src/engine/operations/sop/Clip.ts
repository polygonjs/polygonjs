import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Vector3} from 'three';
import {Plane} from 'three';
import {Line3} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {MeshWithBVH, ExtendedTriangle} from './utils/Bvh/three-mesh-bvh';
import {Mesh} from 'three';
import {LineSegments} from 'three';
import {BufferGeometry} from 'three';
import {BufferAttribute} from 'three';
import {InterleavedBufferAttribute} from 'three';
import {DEFAULT_MATERIALS, ObjectType} from '../../../core/geometry/Constant';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {Box3} from 'three';

interface ClipSopParams extends DefaultOperationParams {
	origin: Vector3;
	distance: number;
	direction: Vector3;
}

const tempVector = new Vector3();
const tempLine = new Line3();

export class ClipSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: ClipSopParams = {
		origin: new Vector3(0, 0, 0),
		distance: 0,
		direction: new Vector3(0, 1, 0),
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'clip'> {
		return 'clip';
	}
	override cook(inputCoreGroups: CoreGroup[], params: ClipSopParams) {
		const coreGroup = inputCoreGroups[0];
		const mesh = coreGroup.objectsWithGeo()[0] as Mesh;

		this._plane.set(params.direction, -params.distance);
		this._plane.translate(params.origin);

		const outlineLines = this._createClipGeo(mesh);

		if (outlineLines) {
			return this.createCoreGroupFromObjects([outlineLines]);
		} else {
			return this.createCoreGroupFromObjects([]);
		}
	}

	private _plane = new Plane();
	private _createClipGeo(mesh: Mesh) {
		const meshWithBVH = mesh as MeshWithBVH;
		const boundsTree = meshWithBVH.geometry.boundsTree;
		if (!boundsTree) {
			this.states?.error.set('no BVH found on input geo, make sure to use a BVH SOP node');
			return;
		}
		const meshBVH = meshWithBVH.geometry.boundsTree;

		const performIntersection = (attrib?: BufferAttribute | InterleavedBufferAttribute) => {
			let index = 0;

			const intersectsBounds = (
				box: Box3,
				isLeaf: boolean,
				score: number | undefined,
				depth: number,
				nodeIndex: number
			) => {
				return this._plane.intersectsBox(box);
			};
			const intersectsTriangle = (tri: ExtendedTriangle) => {
				// check each triangle edge to see if it intersects with the plane. If so then
				// add it to the list of segments.
				let count = 0;
				tempLine.start.copy(tri.a);
				tempLine.end.copy(tri.b);
				if (this._plane.intersectLine(tempLine, tempVector)) {
					attrib?.setXYZ(index, tempVector.x, tempVector.y, tempVector.z);
					index++;
					count++;
				}

				tempLine.start.copy(tri.b);
				tempLine.end.copy(tri.c);
				if (this._plane.intersectLine(tempLine, tempVector)) {
					attrib?.setXYZ(index, tempVector.x, tempVector.y, tempVector.z);
					count++;
					index++;
				}

				tempLine.start.copy(tri.c);
				tempLine.end.copy(tri.a);
				if (this._plane.intersectLine(tempLine, tempVector)) {
					attrib?.setXYZ(index, tempVector.x, tempVector.y, tempVector.z);
					count++;
					index++;
				}

				// If we only intersected with one or three sides then just remove it. This could be handled
				// more gracefully.
				if (count !== 2) {
					index -= count;
				}
			};

			meshBVH.shapecast({
				intersectsBounds,
				intersectsTriangle,
			});
			return {index};
		};
		// we perform the intersection once to know the required size of the position attribute
		const {index} = performIntersection();
		const lineGeometry = new BufferGeometry();
		const linePosAttr = new BufferAttribute(new Float32Array(index * 3), 3, false);
		// linePosAttr.setUsage(DynamicDrawUsage);
		lineGeometry.setAttribute('position', linePosAttr);
		const outlineLines = new LineSegments(lineGeometry, DEFAULT_MATERIALS[ObjectType.LINE_SEGMENTS]);
		outlineLines.frustumCulled = false;

		const posAttr = outlineLines.geometry.attributes.position as BufferAttribute;
		// and we perform the intersection a second time to actually set the position attribute values
		performIntersection(posAttr);

		return outlineLines;
	}
}
