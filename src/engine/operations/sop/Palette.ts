import {BaseSopOperation} from './_Base';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {BufferAttribute, Color} from 'three';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {SORTED_PALETTE_NAMES} from '../../../core/color/chromotomeWrapper';
import {AttribClass, ATTRIBUTE_CLASSES} from '../../../core/geometry/Constant';
import {TypeAssert} from '../../poly/Assert';
import {CoreObject} from '../../../core/geometry/Object';

interface PaletteSopParams extends DefaultOperationParams {
	class: number;
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
		class: ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX),
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

	override cook(inputCoreGroups: CoreGroup[], params: PaletteSopParams) {
		const coreGroup = inputCoreGroups[0];

		const colors = [params.color1, params.color2, params.color3, params.color4, params.color5];
		this._addAttribute(ATTRIBUTE_CLASSES[params.class], coreGroup, params, colors);

		return coreGroup;
	}
	private async _addAttribute(
		attribClass: AttribClass,
		coreGroup: CoreGroup,
		params: PaletteSopParams,
		colors: Color[]
	) {
		switch (attribClass) {
			case AttribClass.VERTEX:
				return await this._setVertexColor(coreGroup, params, colors);
			case AttribClass.OBJECT:
				return await this._setObjectColor(coreGroup, params, colors);
			case AttribClass.CORE_GROUP:
				return;
		}
		TypeAssert.unreachable(attribClass);
	}

	private _setObjectColor(coreGroup: CoreGroup, params: PaletteSopParams, colors: Color[]) {
		const objects = coreGroup.allObjects();
		let i = 0;
		for (let object of objects) {
			const color = colors[i % params.colorsCount];
			CoreObject.addAttribute(object, 'color', color.clone());
			i++;
		}
		return coreGroup;
	}

	private _setVertexColor(coreGroup: CoreGroup, params: PaletteSopParams, colors: Color[]) {
		const objects = coreGroup.threejsObjectsWithGeo();
		for (let object of objects) {
			this._setVertexColorToObject(object, params, colors);
		}
	}

	private _setVertexColorToObject(object: Object3DWithGeometry, params: PaletteSopParams, colors: Color[]) {
		if (params.colorsCount <= 0) {
			return;
		}

		const geometry = object.geometry;
		if (!geometry) {
			return;
		}
		let colorAttrib = geometry.getAttribute('color') as BufferAttribute;
		if (!colorAttrib) {
			const coreGeo = new CoreGeometry(geometry);
			coreGeo.addNumericAttrib('color', 3, [0, 0, 0]);
			colorAttrib = geometry.getAttribute('color') as BufferAttribute;
		}
		if (!colorAttrib) {
			return;
		}

		const array = colorAttrib.array;
		let ptIndex = 0;
		for (let i = 0; i < array.length; i += 3) {
			const color = colors[ptIndex % params.colorsCount];
			color.toArray(array, i);
			ptIndex++;
		}
	}
}
