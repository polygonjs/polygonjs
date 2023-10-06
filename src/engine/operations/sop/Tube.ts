import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Vector3, CylinderGeometry} from 'three';
import {rotateGeometry} from '../../../core/Transform';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/Type';
import {DefaultOperationParams} from '../../../core/operations/_Base';

const DEFAULT_UP = new Vector3(0, 1, 0);

interface TubeSopParams extends DefaultOperationParams {
	singleRadius: boolean;
	radius: number;
	radiusTop: number;
	radiusBottom: number;
	height: number;
	segmentsRadial: number;
	segmentsHeight: number;
	cap: boolean;
	center: Vector3;
	direction: Vector3;
	open: boolean;
	thetaStart: number;
	thetaLength: number;
}

export class TubeSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: TubeSopParams = {
		singleRadius: true,
		radius: 1,
		radiusTop: 1,
		radiusBottom: 1,
		height: 1,
		segmentsRadial: 12,
		segmentsHeight: 1,
		cap: true,
		center: new Vector3(0, 0, 0),
		direction: new Vector3(0, 0, 1),
		open: false,
		thetaStart: 0,
		thetaLength: Math.PI,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'tube'> {
		return 'tube';
	}
	override cook(inputCoreGroups: CoreGroup[], params: TubeSopParams) {
		const radiusTop = params.singleRadius ? params.radius : params.radiusTop;
		const radiusBottom = params.singleRadius ? params.radius : params.radiusBottom;
		const geometry = isBooleanTrue(params.open)
			? new CylinderGeometry(
					radiusTop,
					radiusBottom,
					params.height,
					params.segmentsRadial,
					params.segmentsHeight,
					!isBooleanTrue(params.cap),
					params.thetaStart,
					params.thetaLength
			  )
			: new CylinderGeometry(
					radiusTop,
					radiusBottom,
					params.height,
					params.segmentsRadial,
					params.segmentsHeight,
					!isBooleanTrue(params.cap)
			  );

		rotateGeometry(geometry, DEFAULT_UP, params.direction);
		geometry.translate(params.center.x, params.center.y, params.center.z);
		return this.createCoreGroupFromGeometry(geometry);
	}
}
