import {CATEGORY_COP} from "./Category";
import {BuilderCopNode} from "../../../nodes/cop/Builder";
import {ColorCopNode} from "../../../nodes/cop/Color";
import {EnvMapCopNode} from "../../../nodes/cop/EnvMap";
import {ImageCopNode} from "../../../nodes/cop/Image";
import {MapboxTileCopNode} from "../../../nodes/cop/MapboxTile";
import {NullCopNode} from "../../../nodes/cop/Null";
import {PostCopNode} from "../../../nodes/cop/Post";
import {SwitchCopNode} from "../../../nodes/cop/Switch";
import {TexturePropertiesCopNode} from "../../../nodes/cop/TextureProperties";
import {VideoCopNode} from "../../../nodes/cop/Video";
import {WebCamCopNode} from "../../../nodes/cop/WebCam";
export class CopRegister {
  static run(poly) {
    poly.register_node(BuilderCopNode, CATEGORY_COP.ADVANCED);
    poly.register_node(ColorCopNode, CATEGORY_COP.INPUT);
    poly.register_node(EnvMapCopNode, CATEGORY_COP.INPUT);
    poly.register_node(ImageCopNode, CATEGORY_COP.INPUT);
    poly.register_node(MapboxTileCopNode, CATEGORY_COP.INPUT);
    poly.register_node(NullCopNode, CATEGORY_COP.MISC);
    poly.register_node(PostCopNode, CATEGORY_COP.FILTER);
    poly.register_node(SwitchCopNode, CATEGORY_COP.MISC);
    poly.register_node(TexturePropertiesCopNode, CATEGORY_COP.ADVANCED);
    poly.register_node(VideoCopNode, CATEGORY_COP.INPUT);
    poly.register_node(WebCamCopNode, CATEGORY_COP.ADVANCED);
  }
}
