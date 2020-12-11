import { BuilderCopNode } from '../../../nodes/cop/Builder';
import { ColorCopNode } from '../../../nodes/cop/Color';
import { EnvMapCopNode } from '../../../nodes/cop/EnvMap';
import { ImageCopNode } from '../../../nodes/cop/Image';
import { MapboxTileCopNode } from '../../../nodes/cop/MapboxTile';
import { NullCopNode } from '../../../nodes/cop/Null';
import { PostCopNode } from '../../../nodes/cop/Post';
import { SwitchCopNode } from '../../../nodes/cop/Switch';
import { TexturePropertiesCopNode } from '../../../nodes/cop/TextureProperties';
import { VideoCopNode } from '../../../nodes/cop/Video';
import { WebCamCopNode } from '../../../nodes/cop/WebCam';
export interface CopNodeChildrenMap {
    builder: BuilderCopNode;
    color: ColorCopNode;
    env_map: EnvMapCopNode;
    image: ImageCopNode;
    mapbox_tile: MapboxTileCopNode;
    Post: PostCopNode;
    null: NullCopNode;
    switch: SwitchCopNode;
    texture_properties: TexturePropertiesCopNode;
    video: VideoCopNode;
    web_cam: WebCamCopNode;
}
import { Poly } from '../../../Poly';
export declare class CopRegister {
    static run(poly: Poly): void;
}
