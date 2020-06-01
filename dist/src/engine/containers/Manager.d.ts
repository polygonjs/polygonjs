import { TypedContainer } from './_Base';
import { ContainableMap } from './utils/ContainableMap';
import { NodeContext } from '../poly/NodeContext';
export declare class ManagerContainer extends TypedContainer<NodeContext.MANAGER> {
    set_content(content: ContainableMap[NodeContext.MANAGER]): void;
}
