import { TypedContainer } from './_Base';
import { ContainableMap } from './utils/ContainableMap';
import { NodeContext } from '../poly/NodeContext';
export declare class PostProcessContainer extends TypedContainer<NodeContext.POST> {
    set_content(content: ContainableMap[NodeContext.POST]): void;
    render_pass(): number;
    object(options?: {}): number;
}
