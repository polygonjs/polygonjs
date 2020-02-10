import {CATEGORY_OBJ} from './Category';

import {AmbientLightObjNode} from 'src/engine/nodes/obj/AmbientLight';
import {AreaLightObjNode} from 'src/engine/nodes/obj/AreaLight';
import {DirectionalLightObjNode} from 'src/engine/nodes/obj/DirectionalLight';
import {HemisphereLightObjNode} from 'src/engine/nodes/obj/HemisphereLight';
import {PointLightObjNode} from 'src/engine/nodes/obj/PointLight';
import {SpotLightObjNode} from 'src/engine/nodes/obj/SpotLight';

import {EventsObjNode} from 'src/engine/nodes/obj/Events';
import {MaterialsObjNode} from 'src/engine/nodes/obj/Materials';
import {CopObjNode} from 'src/engine/nodes/obj/Cop';
import {PostProcessObjNode} from 'src/engine/nodes/obj/PostProcess';

import {GeoObjNode} from 'src/engine/nodes/obj/Geo';
// import {NullObjNode} from 'src/engine/nodes/obj/Null';
import {FogObjNode} from 'src/engine/nodes/obj/Fog';

import {OrthographicCameraObjNode} from 'src/engine/nodes/obj/OrthographicCamera';
import {PerspectiveCameraObjNode} from 'src/engine/nodes/obj/PerspectiveCamera';
// import {CubeCameraObj} from 'src/engine/nodes/obj/CubeCamera';

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
	perspective_camera: PerspectiveCameraObjNode;
	post_process: PostProcessObjNode;
	orthographic_camera: OrthographicCameraObjNode;
}

import {Poly} from 'src/engine/Poly';
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
		// poly.register_node(NullObjNode, CATEGORY_OBJ.GEOMETRY);

		poly.register_node(OrthographicCameraObjNode, CATEGORY_OBJ.CAMERA);
		poly.register_node(PerspectiveCameraObjNode, CATEGORY_OBJ.CAMERA);
		// poly.register_node(CubeCameraObj, CATEGORY_OBJ.CAMERA)

		poly.register_node(FogObjNode, CATEGORY_OBJ.MISC);
	}
}
