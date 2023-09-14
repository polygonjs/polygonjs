import type {QUnit} from '../../../helpers/QUnit';
import {BufferAttribute, Color, Mesh, Object3D} from 'three';
import {SORTED_PALETTE_NAMES} from '../../../../src/core/color/chromotomeWrapper';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {ThreejsObject} from '../../../../src/core/geometry/modules/three/ThreejsObject';
import {PolyScene} from '../../../../src/engine/scene/PolyScene';
export function testenginenodessopPalette(qUnit: QUnit) {
	const delta = 0.05;
	qUnit.test('sop/palette simple vertex', async (assert) => {
		const scene = new PolyScene();
		const geo1 = scene.root().createNode('geo');

		const plane = geo1.createNode('plane');
		const scatter = geo1.createNode('scatter');
		const palette = geo1.createNode('palette');
		scatter.p.pointsCount.set(4);
		scatter.setInput(0, plane);
		palette.setInput(0, plane);
		palette.p.paletteName.set(SORTED_PALETTE_NAMES[1]);

		let container = await palette.compute();
		let coreContent = container.coreContent()!;
		assert.ok(coreContent);
		let geometry = coreContent.threejsObjectsWithGeo()[0].geometry;
		let colorAttribArray = (geometry.getAttribute('color') as BufferAttribute).array;

		assert.in_delta(colorAttribArray[0], 1, delta);
		assert.in_delta(colorAttribArray[1], 0.09084171056747437, delta);
		assert.in_delta(colorAttribArray[2], 0, delta);
		assert.in_delta(colorAttribArray[3], 0.9046611785888672, delta);
		assert.in_delta(colorAttribArray[4], 0.533276379108429, delta);
		assert.in_delta(colorAttribArray[5], 0.05951123684644699, delta);
		assert.in_delta(colorAttribArray[6], 0.006995410192757845, delta);
		assert.in_delta(colorAttribArray[7], 0.06301001459360123, delta);
		assert.in_delta(colorAttribArray[8], 0.006995410192757845, delta);
		assert.in_delta(colorAttribArray[9], 0.028426039963960648, delta);
		assert.in_delta(colorAttribArray[10], 0.0012141079641878605, delta);
		assert.in_delta(colorAttribArray[11], 0.9734452962875366, delta);

		palette.p.paletteName.set(SORTED_PALETTE_NAMES[2]);
		container = await palette.compute();
		coreContent = container.coreContent()!;
		assert.ok(coreContent);
		geometry = coreContent.threejsObjectsWithGeo()[0].geometry;
		colorAttribArray = (geometry.getAttribute('color') as BufferAttribute).array;

		assert.in_delta(colorAttribArray[0], 0.9046611785888672, delta);
		assert.in_delta(colorAttribArray[1], 0.0003035269910469651, delta);
		assert.in_delta(colorAttribArray[2], 0.0012141079641878605, delta);
		assert.in_delta(colorAttribArray[3], 0.9215818643569946, delta);
		assert.in_delta(colorAttribArray[4], 0.5271151065826416, delta);
		assert.in_delta(colorAttribArray[5], 0.4507857859134674, delta);
		assert.in_delta(colorAttribArray[6], 0.31854677200317383, delta);
		assert.in_delta(colorAttribArray[7], 0.13563333451747894, delta);
		assert.in_delta(colorAttribArray[8], 0.0423114113509655, delta);
		assert.in_delta(colorAttribArray[9], 0.8713670969009399, delta);
		assert.in_delta(colorAttribArray[10], 0.8796223998069763, delta);
		assert.in_delta(colorAttribArray[11], 0.9046611785888672, delta);
	});

	qUnit.test('sop/palette simple object', async (assert) => {
		const scene = new PolyScene();
		const geo1 = scene.root().createNode('geo');

		const plane = geo1.createNode('plane');
		const scatter = geo1.createNode('scatter');
		const palette = geo1.createNode('palette');
		const box1 = geo1.createNode('box');
		const copy1 = geo1.createNode('copy');
		scatter.setInput(0, plane);
		copy1.setInput(0, box1);
		copy1.setInput(1, scatter);
		palette.setInput(0, copy1);
		palette.setAttribClass(AttribClass.OBJECT);
		scatter.p.pointsCount.set(4);
		palette.p.paletteName.set(SORTED_PALETTE_NAMES[1]);

		async function objectColors() {
			const container = await palette.compute();
			const objects = container.coreContent()?.threejsObjects() || [];
			const colors = objects.map((object: Object3D) => ThreejsObject.attribValue(object, 'color') as Color);
			return colors.map((c) => c.toArray()).flat();
		}
		let colors = await objectColors();
		assert.in_delta(colors[0], 1, delta);
		assert.in_delta(colors[1], 0.09084171117479915, delta);
		assert.in_delta(colors[2], 0, delta);
		assert.in_delta(colors[3], 0.9046611743890203, delta);
		assert.in_delta(colors[4], 0.5332764040016892, delta);
		assert.in_delta(colors[5], 0.059511238155621766, delta);
		assert.in_delta(colors[6], 0.0069954101845983935, delta);
		assert.in_delta(colors[7], 0.06301001764564068, delta);
		assert.in_delta(colors[8], 0.0069954101845983935, delta);
		assert.in_delta(colors[9], 0.028426039499072558, delta);
		assert.in_delta(colors[10], 0.001214107934117647, delta);
		assert.in_delta(colors[11], 0.9734452903978066, delta);

		palette.p.paletteName.set(SORTED_PALETTE_NAMES[2]);
		colors = await objectColors();

		assert.in_delta(colors[0], 0.9046611743890203, delta, '0r');
		assert.in_delta(colors[1], 0.0003035269835294117, delta, '0g');
		assert.in_delta(colors[2], 0.00030352698352941176, delta, '0b');
		assert.in_delta(colors[3], 0.9215818562755338, delta, '1r');
		assert.in_delta(colors[4], 0.5271151256969157, delta, '1g');
		assert.in_delta(colors[5], 0.450785782828426, delta, '1b');
		assert.in_delta(colors[6], 0.31854677811435356, delta, '2r');
		assert.in_delta(colors[7], 0.13563332964548108, delta, '2g');
		assert.in_delta(colors[8], 0.04231141061442144, delta, '2b');
		assert.in_delta(colors[9], 0.8713671191959567, delta, '3r');
		assert.in_delta(colors[10], 0.8796223968851662, delta, '3g');
		assert.in_delta(colors[11], 0.9046611743890203, delta, '3b');

		// add an attrib promote
		const attribPromote1 = geo1.createNode('attribPromote');
		attribPromote1.setInput(0, palette);
		attribPromote1.setAttribClassFrom(AttribClass.OBJECT);
		attribPromote1.setAttribClassTo(AttribClass.POINT);
		attribPromote1.p.name.set('color');

		async function vertexColors() {
			const container = await attribPromote1.compute();
			const objects = container.coreContent()?.threejsObjects() || [];
			return objects.map(
				(object: Object3D) => (object as Mesh).geometry.getAttribute('color') as BufferAttribute
			);
		}
		await vertexColors();
		assert.notOk(attribPromote1.states.error.message(), 'no error');
		assert.equal((await vertexColors()).length, 4, '4 buffers');
		assert.deepEqual((await vertexColors())[0].array[0], 0.9046611785888672, 'buffer 0');
		assert.deepEqual((await vertexColors())[0].array[1], 0.0003035269910469651, 'buffer 0');
		assert.deepEqual((await vertexColors())[0].array[2], 0.0012141079641878605, 'buffer 0');
		assert.deepEqual((await vertexColors())[1].array[0], 0.9215818643569946, 'buffer 1');
		assert.deepEqual((await vertexColors())[2].array[1], 0.13563333451747894, 'buffer 1');
		assert.deepEqual((await vertexColors())[3].array[2], 0.9046611785888672, 'buffer 1');
	});
}
