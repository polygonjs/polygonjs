/**
 * scatters points inside the bounding box of an object
 *
 * @remarks
 * This can be useful to quickly create points in a volume.
 *
 */
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {TypedSopNode} from './_Base';
import {ObjectType} from '../../../core/geometry/Constant';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
class BboxScatterSopParamsConfig extends NodeParamsConfig {
	/** @param the smaller the step size, the more points this will create */
	stepSize = ParamConfig.FLOAT(0.1);
}
const ParamsConfig = new BboxScatterSopParamsConfig();

export class BboxScatterSopNode extends TypedSopNode<BboxScatterSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'bboxScatter';
	}

	static displayedInputNames(): string[] {
		return ['geometry to create points from'];
	}

	initializeNode() {
		this.io.inputs.setCount(1);
	}

	cook(input_contents: CoreGroup[]) {
		const container = input_contents[0];
		const stepSize = this.pv.stepSize;
		const bbox = container.boundingBox();
		const min = bbox.min;
		const max = bbox.max;

		const positions: number[] = [];
		for (let x = min.x; x <= max.x; x += stepSize) {
			for (let y = min.y; y <= max.y; y += stepSize) {
				for (let z = min.z; z <= max.z; z += stepSize) {
					positions.push(x);
					positions.push(y);
					positions.push(z);
				}
			}
		}

		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));

		this.setGeometry(geometry, ObjectType.POINTS);
	}
}
