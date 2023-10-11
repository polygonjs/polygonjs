import {Box3, Vector3, Sphere} from 'three';
import {BaseCorePoint} from '../../geometry/entities/point/CorePoint';
import {PolyDictionary} from '../../../types/GlobalTypes';

const _position = new Vector3();

export type OctreeNodeTraverseCallback = (node: OctreeNode) => void;

export class OctreeNode {
	private _leavesByOctant: PolyDictionary<OctreeNode> = {};
	private _pointsByOctantId: PolyDictionary<BaseCorePoint[]> = {};
	private _leaves: OctreeNode[] = [];
	private _center: Vector3;
	private _boundingBoxesByOctant: PolyDictionary<Box3> = {};
	private _boundingBoxesByOctantPrepared: boolean = false;

	constructor(private _bbox: Box3, private _level: number = 0) {
		this._center = this._bbox.max.clone().add(this._bbox.min).multiplyScalar(0.5);
	}

	level() {
		return this._level;
	}

	traverse(callback: OctreeNodeTraverseCallback) {
		callback(this);
		const octants = Object.values(this._leavesByOctant);
		octants.forEach((node) => {
			node.traverse(callback);
		});
	}

	intersectsSphere(sphere: Sphere): boolean {
		if (this._bbox) {
			return this._bbox.intersectsSphere(sphere);
		}
		return false;
	}

	pointsInSphere(sphere: Sphere, accumulatedPoints: BaseCorePoint[]): void {
		if (this._leaves.length == 0) {
			const foundPoints = Object.values(this._pointsByOctantId).flat();
			const selectedPoints = foundPoints.filter((point) => sphere.containsPoint(point.position(_position)));
			selectedPoints.forEach((point) => {
				accumulatedPoints.push(point);
			});
		} else {
			const leaves_intersecting_with_sphere = this._leaves.filter((leaf) => leaf.intersectsSphere(sphere));

			leaves_intersecting_with_sphere.forEach((leaf) => leaf.pointsInSphere(sphere, accumulatedPoints));
		}
	}

	boundingBox(): Box3 | undefined {
		return this._bbox;
	}

	setPoints(points: BaseCorePoint[]) {
		this._pointsByOctantId = {};
		for (const point of points) {
			this.addPoint(point);
		}

		const octantIds = Object.keys(this._pointsByOctantId);
		if (octantIds.length > 1) {
			for (const octantId of octantIds) {
				this.createLeaf(octantId);
			}
		}
	}

	createLeaf(octantId: string) {
		const box = this._leafBbox(octantId);
		const leaf = new OctreeNode(box, this._level + 1);
		this._leavesByOctant[octantId] = leaf;
		this._leaves.push(leaf);

		leaf.setPoints(this._pointsByOctantId[octantId]);
	}

	addPoint(point: BaseCorePoint) {
		const octantId = this._octantId(point.position(_position));
		if (this._pointsByOctantId[octantId] == null) {
			this._pointsByOctantId[octantId] = [];
		}
		this._pointsByOctantId[octantId].push(point);
	}

	private _octantId(position: Vector3): string {
		const x_pos = position.x > this._center.x ? 1 : 0;
		const y_pos = position.y > this._center.y ? 1 : 0;
		const z_pos = position.z > this._center.z ? 1 : 0;
		return `${x_pos}${y_pos}${z_pos}`;
	}

	private _leafBbox(octantId: string): Box3 {
		if (!this._boundingBoxesByOctantPrepared) {
			this._prepareLeavesBboxes();
			this._boundingBoxesByOctantPrepared = true;
		}
		return this._boundingBoxesByOctant[octantId];
	}

	private _bboxCenter(x_pos: number, y_pos: number, z_pos: number, target: Vector3): void {
		target.copy(this._bbox.min);
		if (x_pos == 1) {
			target.x = this._bbox.max.x;
		}
		if (y_pos == 1) {
			target.y = this._bbox.max.y;
		}
		if (z_pos == 1) {
			target.z = this._bbox.max.z;
		}

		target.add(this._center).multiplyScalar(0.5);
	}

	private _prepareLeavesBboxes() {
		const bboxCenters = [
			new Vector3(),
			new Vector3(),
			new Vector3(),
			new Vector3(),
			new Vector3(),
			new Vector3(),
			new Vector3(),
			new Vector3(),
		];
		this._bboxCenter(0, 0, 0, bboxCenters[0]);
		this._bboxCenter(0, 0, 1, bboxCenters[1]);
		this._bboxCenter(0, 1, 0, bboxCenters[2]);
		this._bboxCenter(0, 1, 1, bboxCenters[3]);
		this._bboxCenter(1, 0, 0, bboxCenters[4]);
		this._bboxCenter(1, 0, 1, bboxCenters[5]);
		this._bboxCenter(1, 1, 0, bboxCenters[6]);
		this._bboxCenter(1, 1, 1, bboxCenters[7]);

		const bboxSizeQuarter = this._bbox.max.clone().sub(this._bbox.min).multiplyScalar(0.25);
		for (const bboxCenter of bboxCenters) {
			const octantId = this._octantId(bboxCenter);
			const bbox = new Box3(bboxCenter.clone().sub(bboxSizeQuarter), bboxCenter.clone().add(bboxSizeQuarter));
			this._boundingBoxesByOctant[octantId] = bbox;
		}
	}
}
