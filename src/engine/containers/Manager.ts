import {TypedContainer} from './_Base';
import {ContainableMap} from './utils/ContainableMap';

export class ManagerContainer extends TypedContainer<ContainableMap['MANAGER']> {
	set_content(content: ContainableMap['MANAGER']) {
		super.set_content(content);
	}
}
