import {Font, FontGenerateShapesOptions} from '../../../../../core/loader/font/Font';

export interface TextShapesParams extends FontGenerateShapesOptions {
	text: string;
	font: Font;
}

export function getShapes(params: TextShapesParams) {
	return params.font.generateShapes(params.text, params);
}
