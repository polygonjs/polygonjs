import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../geometry/Group';
import {DefaultOperationParams} from '../_Base';

interface NullSopParams extends DefaultOperationParams {}

export class NullSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: NullSopParams = {};
	static type(): Readonly<'null'> {
		return 'null';
	}

	cook(input_contents: CoreGroup[], params: NullSopParams) {
		return input_contents[0];
	}
}
