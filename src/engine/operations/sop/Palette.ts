import {BaseSopOperation} from './_Base';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Color} from 'three';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {SORTED_PALETTE_NAMES} from '../../../core/color/chromotomeWrapper';

interface PaletteSopParams extends DefaultOperationParams {
	paletteName: string;
	colorsCount: number;
	color1: Color;
	color2: Color;
	color3: Color;
	color4: Color;
	color5: Color;
}

export class PaletteSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: PaletteSopParams = {
		paletteName: SORTED_PALETTE_NAMES[0],
		colorsCount: 0,
		color1: new Color(1, 1, 1),
		color2: new Color(1, 1, 1),
		color3: new Color(1, 1, 1),
		color4: new Color(1, 1, 1),
		color5: new Color(1, 1, 1),
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'palette'> {
		return 'palette';
	}

	override cook(input_contents: CoreGroup[], params: PaletteSopParams) {
		const core_group = input_contents[0];

		const objects = core_group.objectsWithGeo();
		for (let object of objects) {
			this._applyPalette(object, params);
		}

		return core_group;
	}

	private _applyPalette(object: Object3DWithGeometry, params: PaletteSopParams) {
		if (params.colorsCount <= 0) {
			return;
		}

		const geometry = object.geometry;
		if (!geometry) {
			return;
		}
		let colorAttrib = geometry.getAttribute('color');
		if (!colorAttrib) {
			const coreGeo = new CoreGeometry(geometry);
			coreGeo.addNumericAttrib('color', 3, [0, 0, 0]);
			colorAttrib = geometry.getAttribute('color');
		}
		if (!colorAttrib) {
			return;
		}

		const allColors = [params.color1, params.color2, params.color3, params.color4, params.color4];
		const colors: Color[] = new Array(params.colorsCount);
		for (let i = 0; i < colors.length; i++) {
			colors[i] = allColors[i];
		}
		let colorIndex = 0;
		const array = colorAttrib.array;
		for (let i = 0; i < array.length; i += 3) {
			const color = colors[colorIndex];
			color.toArray(array, i);

			if (colorIndex == colors.length - 1) {
				colorIndex = 0;
			} else {
				colorIndex++;
			}
		}
	}
}
