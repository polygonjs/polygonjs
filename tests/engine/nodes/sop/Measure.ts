import type {QUnit} from '../../../helpers/QUnit';
import {Mesh} from 'three';
import {ThreejsPrimitiveTriangle} from '../../../../src/core/geometry/modules/three/ThreejsPrimitiveTriangle';
import {arrayCopy} from '../../../../src/core/ArrayUtils';
export function testenginenodessopMeasure(qUnit: QUnit) {
	qUnit.test('sop/measure simple', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const measure1 = geo1.createNode('measure');
		measure1.setInput(0, plane1);

		async function areas() {
			const container = await measure1.compute();
			const attribName: string = measure1.p.attribName.value;
			const mesh = container.coreContent()!.threejsObjects()[0] as Mesh;
			const primitivesCount = ThreejsPrimitiveTriangle.entitiesCount(mesh);
			const areaValues = new Array(primitivesCount).fill(-1);
			const sortedValues: number[] = new Array(primitivesCount).fill(-1);
			for (let i = 0; i < primitivesCount; i++) {
				const triangle = new ThreejsPrimitiveTriangle(mesh, i);
				areaValues[i] = triangle.attribValue(attribName);
			}
			arrayCopy(areaValues, sortedValues);
			sortedValues.sort((a, b) => a - b);
			const lowestValue = sortedValues[0];
			const highestValue = sortedValues[sortedValues.length - 1];
			return {lowestValue, highestValue, areaValues};
		}
		assert.equal((await areas()).lowestValue, 0.5);
		assert.equal((await areas()).highestValue, 0.5);

		plane1.p.useSegmentsCount.set(true);
		plane1.p.segments.set([2, 2]);
		assert.equal((await areas()).lowestValue, 0.125);
		assert.equal((await areas()).highestValue, 0.125);

		// sphere
		const sphere1 = geo1.createNode('sphere');
		sphere1.p.resolution.set([4, 4]);
		measure1.setInput(0, sphere1);
		assert.in_delta((await areas()).lowestValue, 0.289, 0.001);
		assert.in_delta((await areas()).highestValue, 0.521, 0.001);
	});
}
