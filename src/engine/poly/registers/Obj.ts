import {CATEGORY_OBJ} from './Category';

import {AmbientLightObjNode} from '../../nodes/obj/AmbientLight';
import {AreaLightObjNode} from '../../nodes/obj/AreaLight';
import {DirectionalLightObjNode} from '../../nodes/obj/DirectionalLight';
import {HemisphereLightObjNode} from '../../nodes/obj/HemisphereLight';
import {PointLightObjNode} from '../../nodes/obj/PointLight';
import {SpotLightObjNode} from '../../nodes/obj/SpotLight';

import {EventsObjNode} from '../../nodes/obj/Events';
import {MaterialsObjNode} from '../../nodes/obj/Materials';
import {CopObjNode} from '../../nodes/obj/Cop';
import {PostProcessObjNode} from '../../nodes/obj/PostProcess';

import {GeoObjNode} from '../../nodes/obj/Geo';
import {NullObjNode} from '../../nodes/obj/Null';
import {FogObjNode} from '../../nodes/obj/Fog';

import {OrthographicCameraObjNode} from '../../nodes/obj/OrthographicCamera';
import {PerspectiveCameraObjNode} from '../../nodes/obj/PerspectiveCamera';
// import {CubeCameraObj} from '../../nodes/obj/CubeCamera';

export interface ObjNodeChildrenMap {
	ambient_light: AmbientLightObjNode;
	area_light: AreaLightObjNode;
	directional_light: DirectionalLightObjNode;
	hemisphere_light: HemisphereLightObjNode;
	point_light: PointLightObjNode;
	spot_light: SpotLightObjNode;
	cop: CopObjNode;
	events: EventsObjNode;
	fog: FogObjNode;
	geo: GeoObjNode;
	materials: MaterialsObjNode;
	null: NullObjNode;
	perspective_camera: PerspectiveCameraObjNode;
	post_process: PostProcessObjNode;
	orthographic_camera: OrthographicCameraObjNode;
}

import {Poly} from '../../Poly';
export class ObjRegister {
	static run(poly: Poly) {
		poly.register_node(AmbientLightObjNode, CATEGORY_OBJ.LIGHT);
		poly.register_node(AreaLightObjNode, CATEGORY_OBJ.LIGHT);
		poly.register_node(DirectionalLightObjNode, CATEGORY_OBJ.LIGHT);
		poly.register_node(HemisphereLightObjNode, CATEGORY_OBJ.LIGHT);
		poly.register_node(PointLightObjNode, CATEGORY_OBJ.LIGHT);
		poly.register_node(SpotLightObjNode, CATEGORY_OBJ.LIGHT);

		poly.register_node(EventsObjNode, CATEGORY_OBJ.MANAGER);
		poly.register_node(MaterialsObjNode, CATEGORY_OBJ.MANAGER);
		poly.register_node(CopObjNode, CATEGORY_OBJ.MANAGER);
		poly.register_node(PostProcessObjNode, CATEGORY_OBJ.MANAGER);

		poly.register_node(GeoObjNode, CATEGORY_OBJ.GEOMETRY);
		poly.register_node(NullObjNode, CATEGORY_OBJ.GEOMETRY);

		poly.register_node(OrthographicCameraObjNode, CATEGORY_OBJ.CAMERA);
		poly.register_node(PerspectiveCameraObjNode, CATEGORY_OBJ.CAMERA);
		// poly.register_node(CubeCameraObj, CATEGORY_OBJ.CAMERA)

		poly.register_node(FogObjNode, CATEGORY_OBJ.MISC);
	}
}
