import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {BufferAttribute, Mesh, Vector3} from 'three';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {CorePoint} from '../../../core/geometry/Point';
import {DefaultOperationParams} from '../../../core/operations/_Base';

const POSITION = 'position';
const _normal = new Vector3();
const _position = new Vector3();
const _corePoint = new CorePoint();

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
		const objects = coreGroup.threejsObjects();
		for (const object of objects) {
			object.traverse((childObject) => {
				const geometry = (childObject as Mesh).geometry;
				if (geometry) {
					const coreGeometry = new CoreGeometry(geometry);
					_corePoint.setGeometry(geometry);
					const pointsCount = coreGeometry.pointsCount();
					for (let i = 0; i < pointsCount; i++) {
						_corePoint.setIndex(i);
						_corePoint.normal(_normal);
						_corePoint.position(_position);
						_position.add(_normal.multiplyScalar(params.amount));
						_corePoint.setPosition(_position);
					}

					// if (!this.io.inputs.clone_required(0)) {
					const attrib = coreGeometry.geometry().getAttribute(POSITION) as BufferAttribute;
					attrib.needsUpdate = true;
					//}
				}
			});
		}

		return coreGroup;
	}
}
