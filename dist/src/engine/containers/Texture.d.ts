import { TypedContainer } from './_Base';
import { ContainableMap } from './utils/ContainableMap';
export declare class TextureContainer extends TypedContainer<ContainableMap['TEXTURE']> {
    set_content(content: ContainableMap['TEXTURE']): void;
    texture(): ContainableMap['TEXTURE'];
    core_content(): ContainableMap['TEXTURE'];
    core_content_cloned(): ContainableMap['TEXTURE'] | undefined;
    object(): import("three").Texture;
    infos(): import("three").Texture[] | undefined;
    resolution(): [number, number];
}
