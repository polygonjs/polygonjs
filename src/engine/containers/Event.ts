import {TypedContainer} from './_Base';
import {ContainableMap} from './utils/ContainableMap';

export class EventContainer extends TypedContainer<ContainableMap['EVENT']> {
	set_content(content: ContainableMap['EVENT']) {
		super.set_content(content);
	}
}
