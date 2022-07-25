import {BevelParams, createGeometriesFromTypeMesh} from './TextMesh';
import {getShapes, TextShapesParams} from './TextShapes';
import {createGeometriesFromTypeFlat} from './TextFlat';
import {createGeometriesFromTypeStroke} from './TextStroke';
import {shapesFromFont} from './TextShapesFromFont';
import {TypeAssert} from '../../../../poly/Assert';
import {createGeometriesFromTypeLine} from './TextLine';
import {TextType} from './TextType';
import {BufferGeometry} from 'three';
import {Font} from '../../../../../core/loader/font/Font';

interface TextBuildGeometriesParams extends BevelParams, TextShapesParams {
	textType: TextType;
	font: Font;
	extrude: number;
	curveSegments: number;
	strokeWidth: number;
}

export async function textBuildGeometries(
	params: TextBuildGeometriesParams
): Promise<Array<BufferGeometry | undefined> | undefined> {
	const {textType} = params;
	// if (line.trim().length == 0) {
	// 	// currently not creating a geometry if the line is empty
	// 	// but we should create something that tells us to offset the next geometry
	// 	return;
	// }
	const shapes = getShapes(params);

	switch (textType) {
		case TextType.MESH:
			return createGeometriesFromTypeMesh({...params, shapes});
		case TextType.FLAT:
			return createGeometriesFromTypeFlat({shapes});
		case TextType.LINE:
			return createGeometriesFromTypeLine({shapes: shapesFromFont(shapes)});
		case TextType.STROKE:
			return await createGeometriesFromTypeStroke({
				shapes: shapesFromFont(shapes),
				strokeWidth: params.strokeWidth,
			});
	}
	TypeAssert.unreachable(textType);
}
