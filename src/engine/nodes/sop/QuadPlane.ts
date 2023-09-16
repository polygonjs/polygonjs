/**
 * Creates a quad plane.
 *
 *
 */
import {QuadSopNode} from './_BaseQuad';
import {Vector3, Matrix4, BufferAttribute} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {QuadGeometry} from '../../../core/geometry/modules/quad/QuadGeometry';
import {Attribute} from '../../../core/geometry/Attribute';
import {rotationMatrix} from '../../../core/Transform';

const _v3 = new Vector3();
const _m4R = new Matrix4();
const _m4T = new Matrix4();
const _m4 = new Matrix4();
const _dirOrigin = new Vector3(0, 1, 0);

class QuadPlaneSopParamsConfig extends NodeParamsConfig {
	/** @param sizes */
	size = ParamConfig.VECTOR2([1, 1]);
	/** @param defines if the plane resolution is sets via the number of segments or via the step size */
	useSegmentsCount = ParamConfig.BOOLEAN(0);
	/** @param step size */
	stepSize = ParamConfig.FLOAT(1, {
		range: [0.001, 2],
		rangeLocked: [false, false],
		visibleIf: {useSegmentsCount: 0},
	});
	/** @param segments count */
	segments = ParamConfig.VECTOR2([1, 1], {visibleIf: {useSegmentsCount: 1}});
	/** @param axis perpendicular to the plane */
	direction = ParamConfig.VECTOR3([0, 1, 0]);
	/** @param center of the plane */
	center = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new QuadPlaneSopParamsConfig();

export class QuadPlaneSopNode extends QuadSopNode<QuadPlaneSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.QUAD_PLANE;
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const geometry = this.pv.useSegmentsCount ? this._createWithSegmentsCount() : this._createWithStepSize();

		const center = this.pv.center;
		rotationMatrix(_dirOrigin, this.pv.direction, _m4R);
		_m4T.makeTranslation(center.x, center.y, center.z);
		_m4.multiplyMatrices(_m4T, _m4R);
		geometry.applyMatrix(_m4);
		this.setQuadGeometry(geometry);
	}
	private _createWithStepSize() {
		const {size, stepSize} = this.pv;
		const segmentsX = Math.round(size.x / stepSize);
		const segmentsY = Math.round(size.y / stepSize);
		return this._createQuadPlane(segmentsX, segmentsY);
	}
	private _createWithSegmentsCount() {
		const {segments} = this.pv;
		const segmentsX = Math.round(segments.x);
		const segmentsY = Math.round(segments.y);
		return this._createQuadPlane(segmentsX, segmentsY);
	}
	private _createQuadPlane(segmentsX: number, segmentsY: number) {
		const {size} = this.pv;
		const geometry = new QuadGeometry();

		const quadsCountX = segmentsX;
		const quadsCountY = segmentsY;
		const pointsCountX = quadsCountX + 1;
		const pointsCountY = quadsCountY + 1;
		const quadsCount = quadsCountX * quadsCountY;
		const positionsCount = pointsCountX * pointsCountY;
		const positions = new Array(positionsCount * 3);
		const indices = new Array(4);

		for (let x = 0; x < pointsCountX; x++) {
			for (let y = 0; y < pointsCountY; y++) {
				const i = x * pointsCountY + y;
				_v3.set((x / segmentsX - 0.5) * size.x, 0, (y / segmentsY - 0.5) * size.y);
				_v3.toArray(positions, i * 3);
			}
		}
		for (let i = 0; i < quadsCount; i++) {
			const x = i % quadsCountX;
			const y = Math.floor(i / quadsCountX);
			const i0 = x * pointsCountY + y;
			const i1 = i0 + 1;
			const i2 = i0 + pointsCountY;
			const i3 = i2 + 1;
			const quadIndex = i * 4;
			indices[quadIndex] = i0;
			indices[quadIndex + 1] = i1;
			indices[quadIndex + 2] = i3;
			indices[quadIndex + 3] = i2;
		}

		const position = new BufferAttribute(new Float32Array(positions), 3);
		geometry.setAttribute(Attribute.POSITION, position);
		geometry.setIndex(indices);

		return geometry;
	}
}
