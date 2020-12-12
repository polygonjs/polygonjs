import { TypedContainer } from './_Base';
import { ContainableMap } from './utils/ContainableMap';
import { NodeContext } from '../poly/NodeContext';
export declare class RopContainer extends TypedContainer<NodeContext.ROP> {
    set_content(content: ContainableMap[NodeContext.ROP]): void;
    renderer(): any;
}
