import {CATEGORY_OBJ} from './Category';

import {AmbientLightObjNode} from '../../../nodes/obj/AmbientLight';
import {DirectionalLightObjNode} from '../../../nodes/obj/DirectionalLight';
import {HemisphereLightObjNode} from '../../../nodes/obj/HemisphereLight';
import {PointLightObjNode} from '../../../nodes/obj/PointLight';
import {SpotLightObjNode} from '../../../nodes/obj/SpotLight';

import {GeoObjNode} from '../../../nodes/obj/Geo';
import {NullObjNode} from '../../../nodes/obj/Null';
import {PolarTransformObjNode} from '../../../nodes/obj/PolarTransform';
import {SceneObjNode} from '../../../nodes/obj/Scene';

import {OrthographicCameraObjNode} from '../../../nodes/obj/OrthographicCamera';
import {PerspectiveCameraObjNode} from '../../../nodes/obj/PerspectiveCamera';

// networks
import {AnimationsNetworkObjNode} from '../../../nodes/obj/AnimationsNetwork';
import {CopNetworkObjNode} from '../../../nodes/obj/CopNetwork';
import {EventsNetworkObjNode} from '../../../nodes/obj/EventsNetwork';
import {MaterialsNetworkObjNode} from '../../../nodes/obj/MaterialsNetwork';
import {PostProcessNetworkObjNode} from '../../../nodes/obj/PostProcessNetwork';
import {RenderersNetworkObjNode} from '../../../nodes/obj/RenderersNetwork';

export interface ObjNodeChildrenMap {
	ambientLight: AmbientLightObjNode;
	directionalLight: DirectionalLightObjNode;
	geo: GeoObjNode;
	hemisphereLight: HemisphereLightObjNode;
	null: NullObjNode;
	orthographicCamera: OrthographicCameraObjNode;
	perspectiveCamera: PerspectiveCameraObjNode;
	polarTransform: PolarTransformObjNode;
	pointLight: PointLightObjNode;
	scene: SceneObjNode;
	spotLight: SpotLightObjNode;
	// networks
	animationsNetwork: AnimationsNetworkObjNode;
	copNetwork: CopNetworkObjNode;
	eventsNetwork: EventsNetworkObjNode;
	materialsNetwork: MaterialsNetworkObjNode;
	postProcessNetwork: PostProcessNetworkObjNode;
	renderersNetwork: RenderersNetworkObjNode;
}

import {PolyEngine} from '../../../Poly';
export class ObjRegister {
	static run(poly: PolyEngine) {
		// lights
		poly.registerNode(AmbientLightObjNode, CATEGORY_OBJ.LIGHT);
		poly.registerNode(DirectionalLightObjNode, CATEGORY_OBJ.LIGHT);
		poly.registerNode(HemisphereLightObjNode, CATEGORY_OBJ.LIGHT);
		poly.registerNode(PointLightObjNode, CATEGORY_OBJ.LIGHT);
		poly.registerNode(SpotLightObjNode, CATEGORY_OBJ.LIGHT);

		// all nodes
		poly.registerNode(GeoObjNode, CATEGORY_OBJ.GEOMETRY);
		poly.registerNode(NullObjNode, CATEGORY_OBJ.TRANSFORM);
		poly.registerNode(PolarTransformObjNode, CATEGORY_OBJ.TRANSFORM);
		poly.registerNode(SceneObjNode, CATEGORY_OBJ.ADVANCED);

		// cameras
		poly.registerNode(OrthographicCameraObjNode, CATEGORY_OBJ.CAMERA);
		poly.registerNode(PerspectiveCameraObjNode, CATEGORY_OBJ.CAMERA);

		// networks
		poly.registerNode(AnimationsNetworkObjNode, CATEGORY_OBJ.NETWORK);
		poly.registerNode(CopNetworkObjNode, CATEGORY_OBJ.NETWORK);
		poly.registerNode(EventsNetworkObjNode, CATEGORY_OBJ.NETWORK);
		poly.registerNode(MaterialsNetworkObjNode, CATEGORY_OBJ.NETWORK);
		poly.registerNode(PostProcessNetworkObjNode, CATEGORY_OBJ.NETWORK);
		poly.registerNode(RenderersNetworkObjNode, CATEGORY_OBJ.NETWORK);
	}
}
