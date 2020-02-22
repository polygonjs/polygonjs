import {GeometryContainer} from '../Geometry';
import {MaterialContainer} from '../Material';
import {TextureContainer} from '../Texture';
import {ObjectContainer} from '../Object';
import {EventContainer} from '../Event';
import {ManagerContainer} from '../Manager';
import {PostProcessContainer} from '../PostProcess';
import {GlContainer} from '../Gl';
import {JsContainer} from '../Js';

export interface ContainerMap {
	GEOMETRY: GeometryContainer;
	MATERIAL: MaterialContainer;
	TEXTURE: TextureContainer;
	OBJECT: ObjectContainer;
	EVENT: EventContainer;
	MANAGER: ManagerContainer;
	POST: PostProcessContainer;
	GL: GlContainer;
	JS: GlContainer;
}
// type K = keyof ContainerMap;
// type Container = ContainerMap[K];
