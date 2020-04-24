import { AnimationContainer } from '../Animation';
import { EventContainer } from '../Event';
import { GeometryContainer } from '../Geometry';
import { GlContainer } from '../Gl';
import { JsContainer } from '../Js';
import { ManagerContainer } from '../Manager';
import { MaterialContainer } from '../Material';
import { ObjectContainer } from '../Object';
import { PostProcessContainer } from '../PostProcess';
import { TextureContainer } from '../Texture';
export interface ContainerMap {
    ANIMATION: AnimationContainer;
    EVENT: EventContainer;
    GEOMETRY: GeometryContainer;
    GL: GlContainer;
    MANAGER: ManagerContainer;
    MATERIAL: MaterialContainer;
    OBJECT: ObjectContainer;
    TEXTURE: TextureContainer;
    POST: PostProcessContainer;
    JS: JsContainer;
}
