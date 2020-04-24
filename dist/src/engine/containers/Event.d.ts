import { TypedContainer } from './_Base';
import { ContainableMap } from './utils/ContainableMap';
export declare class EventContainer extends TypedContainer<ContainableMap['EVENT']> {
    set_content(content: ContainableMap['EVENT']): void;
}
