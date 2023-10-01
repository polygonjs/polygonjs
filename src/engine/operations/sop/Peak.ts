import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Vector3} from 'three';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {pointsCountFromObject} from '../../../core/geometry/entities/point/CorePointUtils';
import {corePointInstanceFactory} from '../../../core/geometry/CoreObjectFactory';

// const POSITION = 'position';
const _normal = new Vector3();
const _position = new Vector3();
// const _corePoint = new CorePoint();

interface PeakSopParams extends DefaultOperationParams {
	amount: number;
}

export class PeakSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: PeakSopParams = {
		amount: 0,
	};
	static override type(): Readonly<'peak'> {
		return 'peak';
	}

	override cook(inputCoreGroups: CoreGroup[], params: PeakSopParams) {
		const coreGroup = inputCoreGroups[0];
		const objects = coreGroup.allObjects();
		for (const object of objects) {
			object.traverse((childObject) => {
				const corePoint = corePointInstanceFactory(childObject);
				// const geometry = (childObject as Mesh).geometry;

				// if (geometry) {
				// corePoint.setGeometry(geometry);
				const pointsCount = pointsCountFromObject(childObject);
				for (let i = 0; i < pointsCount; i++) {
					corePoint.setIndex(i);
					corePoint.normal(_normal);
					corePoint.position(_position);
					_position.add(_normal.multiplyScalar(params.amount));
					corePoint.setPosition(_position);
				}

				// if (!this.io.inputs.clone_required(0)) {
				// const attrib = geometry.getAttribute(POSITION) as BufferAttribute;
				// attrib.needsUpdate = true;
				//}
				// }
			});
		}

		return coreGroup;
	}
}
