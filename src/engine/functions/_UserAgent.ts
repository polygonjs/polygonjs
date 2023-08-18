import {NamedFunction0} from './_Base';
import {CoreUserAgent} from '../../core/UserAgent';

export class isTouchDevice extends NamedFunction0 {
	static override type() {
		return 'isTouchDevice';
	}
	func(): boolean {
		return CoreUserAgent.isTouchDevice();
	}
}
