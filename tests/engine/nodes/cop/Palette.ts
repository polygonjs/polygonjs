import {Color} from 'three';
import {DataTexture} from 'three';
import {SORTED_PALETTE_NAMES} from '../../../../src/core/color/chromotomeWrapper';

QUnit.test('cop/palette simple', async (assert) => {
	const COP = window.COP;
	const palette = COP.createNode('palette');

	const w = 256;
	const h = 256;
	palette.p.paletteName.set(SORTED_PALETTE_NAMES[0]);
	palette.p.resolution.set([h, w]);
	let container = await palette.compute();
	let texture = container.coreContent() as DataTexture;
	let data = texture.image.data;
	const indexAtPos = (x: number, y: number) => {
		return x + y * w;
	};
	const color = new Color();
	const setColorAtPos = (x: number, y: number, color: Color) => {
		const index = indexAtPos(x, y);
		color.fromArray(data, index * 4);
	};
	setColorAtPos(0, 0, color);
	assert.deepEqual(color.toArray(), [235, 135, 0]);

	setColorAtPos(250, 0, color);
	assert.deepEqual(color.toArray(), [203, 201, 199]);

	palette.p.paletteName.set(SORTED_PALETTE_NAMES[1]);
	await palette.compute();
	setColorAtPos(0, 0, color);
	assert.deepEqual(color.toArray(), [255, 23, 0]);

	setColorAtPos(250, 0, color);
	assert.deepEqual(color.toArray(), [193, 46, 109]);
});
