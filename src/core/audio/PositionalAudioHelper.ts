import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Line} from 'three/src/objects/Line';
import {LineBasicMaterial} from 'three/src/materials/LineBasicMaterial';
import {degToRad} from 'three/src/math/MathUtils';
import {CorePositionalAudio} from './PositionalAudio';

function createGeometry(divisionsInnerAngle: number, divisionsOuterAngle: number) {
	const geometry = new BufferGeometry();
	const divisions = divisionsInnerAngle + divisionsOuterAngle * 2;
	const positions = new Float32Array((divisions * 3 + 3) * 3);
	geometry.setAttribute('position', new BufferAttribute(positions, 3));
	return geometry;
}
function createInnerAngleMaterial() {
	return new LineBasicMaterial({color: 0x00ff00});
}
function createOuterAngleMaterial() {
	return new LineBasicMaterial({color: 0xffff00});
}

export class CorePositionalAudioHelper extends Line {
	public readonly type = 'PositionalAudioHelper';
	constructor(
		private audio: CorePositionalAudio,
		public range = 1,
		private divisionsInnerAngle = 16,
		private divisionsOuterAngle = 2
	) {
		super(createGeometry(divisionsInnerAngle, divisionsOuterAngle), [
			createInnerAngleMaterial(),
			createOuterAngleMaterial(),
		]);

		this.update();
	}

	update() {
		const audio = this.audio;
		const range = this.range;
		const divisionsInnerAngle = this.divisionsInnerAngle;
		const divisionsOuterAngle = this.divisionsOuterAngle;

		const coneInnerAngle = degToRad(audio.coneInnerAngle());
		const coneOuterAngle = degToRad(audio.coneOuterAngle());

		const halfConeInnerAngle = coneInnerAngle / 2;
		const halfConeOuterAngle = coneOuterAngle / 2;

		let start = 0;
		let count = 0;
		let i;
		let stride;

		const geometry = this.geometry;
		const positionAttribute = geometry.attributes.position;

		geometry.clearGroups();

		//

		function generateSegment(from: number, to: number, divisions: number, materialIndex: number) {
			const step = (to - from) / divisions;

			positionAttribute.setXYZ(start, 0, 0, 0);
			count++;

			for (i = from; i < to; i += step) {
				stride = start + count;

				positionAttribute.setXYZ(stride, Math.sin(i) * range, 0, Math.cos(i) * range);
				positionAttribute.setXYZ(
					stride + 1,
					Math.sin(Math.min(i + step, to)) * range,
					0,
					Math.cos(Math.min(i + step, to)) * range
				);
				positionAttribute.setXYZ(stride + 2, 0, 0, 0);

				count += 3;
			}

			geometry.addGroup(start, count, materialIndex);

			start += count;
			count = 0;
		}

		//

		generateSegment(-halfConeOuterAngle, -halfConeInnerAngle, divisionsOuterAngle, 0);
		generateSegment(-halfConeInnerAngle, halfConeInnerAngle, divisionsInnerAngle, 1);
		generateSegment(halfConeInnerAngle, halfConeOuterAngle, divisionsOuterAngle, 0);

		//

		positionAttribute.needsUpdate = true;

		if (coneInnerAngle === coneOuterAngle) {
			const materials = this.material as LineBasicMaterial[];
			materials[0].visible = false;
		}
	}

	dispose() {
		this.geometry.dispose();
		const materials = this.material as LineBasicMaterial[];
		materials[0].dispose();
		materials[1].dispose();
	}
}
