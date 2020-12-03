import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../geometry/Group';
import {Color} from 'three/src/math/Color';

interface ColorSopParams extends DefaultOperationParams {
	from_attribute: boolean;
	attrib_name: string;
	color: Color;
	as_hsv: boolean;
}

export class ColorSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: ColorSopParams = {
		from_attribute: false,
		attrib_name: '',
		color: new Color(1, 1, 1),
		as_hsv: false,
	};
	static type(): Readonly<'color'> {
		return 'color';
	}

	cook(input_contents: CoreGroup[], params: ColorSopParams) {
		// currently cannot be implemented,
		// since some params may use an expression
		// and expressions cannot yet be used by operations
	}
}
