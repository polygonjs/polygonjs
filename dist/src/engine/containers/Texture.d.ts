import { TypedContainer } from './_Base';
import { ContainableMap } from './utils/ContainableMap';
import { NodeContext } from '../poly/NodeContext';
export declare class TextureContainer extends TypedContainer<NodeContext.COP> {
    set_content(content: ContainableMap[NodeContext.COP]): void;
    texture(): ContainableMap[NodeContext.COP];
    core_content(): ContainableMap[NodeContext.COP];
    core_content_cloned(): ContainableMap[NodeContext.COP] | undefined;
    object(): import("three").Texture;
    infos(): import("three").Texture[] | undefined;
    resolution(): [number, number];
}
