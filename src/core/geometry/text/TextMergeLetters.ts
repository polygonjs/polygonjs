import {BufferGeometry, Object3D} from 'three';
import {arrayCompact} from '../../ArrayUtils';
import {ObjectType} from '../Constant';
import {ThreejsCoreObject} from '../modules/three/ThreejsCoreObject';
import {isBooleanTrue} from '../../Type';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils';
import {TransformResetSopOperation} from '../../../engine/operations/sop/TransformReset';
import {TypedSopNode} from '../../../engine/nodes/sop/_Base';
import {applyJustifyModeToGeometries, TextJustifiyParams} from './TextJustify';
import {applyTextLineHeight, TextLineHeightParams} from './TextLineHeight';
import {TextType} from './TextType';

interface TextMergeAllLettersOptions extends TextJustifiyParams, TextLineHeightParams {
	geometries: Array<BufferGeometry | undefined>;
	textType: TextType;
	splitPerLetter: boolean;
	keepEmptyGeometries: boolean;
	text: string;
}

export function textMergeLetters(params: TextMergeAllLettersOptions) {
	const geometriesByLine = _geometriesByLine(params);

	for (let geometriesForLine of geometriesByLine) {
		applyJustifyModeToGeometries(geometriesForLine, params);
		applyTextLineHeight(geometriesForLine, params);
	}
	const allGeometries = geometriesByLine.flat();
	const objects = _mergeOrSplit({...params, geometries: allGeometries});
	if (objects) {
		return arrayCompact(objects);
	}
}

function _mergeOrSplit(params: TextMergeAllLettersOptions) {
	const objectType = params.textType == TextType.LINE ? ObjectType.LINE_SEGMENTS : ObjectType.MESH;
	if (isBooleanTrue(params.splitPerLetter)) {
		const chars = Array.from(params.text);
		let characterIndex = 0;
		let lineIndex = 0;
		function _createObject(geo?: BufferGeometry) {
			let character = chars[characterIndex];
			if (character === '\n') {
				lineIndex++;
				characterIndex++;
				return;
			}
			if (character == ' ' && params.keepEmptyGeometries == false) {
				characterIndex++;
				return;
			}
			// if (geo == null) {
			// 	characterIndex++;
			// 	return;
			// }

			const object = TypedSopNode.createObject(geo || new BufferGeometry(), objectType); //this.createObject(geo, objectType);
			TransformResetSopOperation.centerObject(object, {applyMatrixToObject: true});
			const coreObject = new ThreejsCoreObject(object, characterIndex);
			coreObject.addAttribute('character', character);
			object.name = character;
			coreObject.addAttribute('characterId', characterIndex);
			coreObject.addAttribute('lineId', lineIndex);
			characterIndex++;
			return object;
		}
		const objects: Object3D[] = [];
		for (let i = 0; i < params.geometries.length; i++) {
			const object = _createObject(params.geometries[i]);
			if (object) {
				objects.push(object);
			}
		}
		return objects;
	} else {
		try {
			const geometries = arrayCompact(params.geometries);
			if (geometries.length > 0) {
				const mergedGeometry = mergeGeometries(geometries);
				return [TypedSopNode.createObject(mergedGeometry, objectType)];
			}
		} catch (err) {
			return;
		}
	}
}

interface GeometriesByLineParams {
	geometries: Array<BufferGeometry | undefined>;
	text: string;
}
function _geometriesByLine(params: GeometriesByLineParams): Array<Array<BufferGeometry | undefined>> {
	const list: Array<Array<BufferGeometry | undefined>> = [];
	const chars = Array.from(params.text);
	let characterIndex = 0;
	let lineIndex = 0;
	for (let geometry of params.geometries) {
		let character = chars[characterIndex];
		if (character === '\n') {
			lineIndex++;
		}
		list[lineIndex] = list[lineIndex] || [];
		list[lineIndex].push(geometry);
		characterIndex++;
	}
	return list;
}
