import {Font} from '../../../../../core/loader/font/Font';

export interface TextShapesParams {
	text: string;
	font: Font;
	size: number;
}

export function getShapes(params: TextShapesParams) {
	return params.font.generateShapes(params.text, params.size);
}
