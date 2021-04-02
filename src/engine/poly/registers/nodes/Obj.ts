import {CATEGORY_OBJ} from './Category';

import {AmbientLightObjNode} from '../../../nodes/obj/AmbientLight';
import {AreaLightObjNode} from '../../../nodes/obj/AreaLight';
import {DirectionalLightObjNode} from '../../../nodes/obj/DirectionalLight';
import {HemisphereLightObjNode} from '../../../nodes/obj/HemisphereLight';
import {PointLightObjNode} from '../../../nodes/obj/PointLight';
import {SpotLightObjNode} from '../../../nodes/obj/SpotLight';

import {AnimationsObjNode} from '../../../nodes/obj/Animations';
import {CopObjNode} from '../../../nodes/obj/Cop';
import {EventsObjNode} from '../../../nodes/obj/Events';
import {MaterialsObjNode} from '../../../nodes/obj/Materials';
import {PostProcessObjNode} from '../../../nodes/obj/PostProcess';
import {RenderersObjNode} from '../../../nodes/obj/Renderers';

import {AudioListenerObjNode} from '../../../nodes/obj/AudioListener';
import {BlendObjNode} from '../../../nodes/obj/Blend';
import {ContactShadowObjNode} from '../../../nodes/obj/ContactShadow';
import {GeoObjNode} from '../../../nodes/obj/Geo';
import {NullObjNode} from '../../../nodes/obj/Null';
import {PolarTransformObjNode} from '../../../nodes/obj/PolarTransform';
import {PolyObjNode} from '../../../nodes/obj/Poly';
import {PositionalAudioObjNode} from '../../../nodes/obj/PositionalAudio';
import {RivetObjNode} from '../../../nodes/obj/Rivet';
import {SceneObjNode} from '../../../nodes/obj/Scene';

import {OrthographicCameraObjNode} from '../../../nodes/obj/OrthographicCamera';
import {PerspectiveCameraObjNode} from '../../../nodes/obj/PerspectiveCamera';
import {CubeCameraObjNode} from '../../../nodes/obj/CubeCamera';
// import {CubeCameraObj} from '../../nodes/obj/CubeCamera';

export interface ObjNodeChildrenMap {
	ambientLight: AmbientLightObjNode;
	areaLight: AreaLightObjNode;
	audioListener: AudioListenerObjNode;
	blend: BlendObjNode;
	contactShadow: ContactShadowObjNode;
	cubeCamera: CubeCameraObjNode;
	directionalLight: DirectionalLightObjNode;
	geo: GeoObjNode;
	hemisphereLight: HemisphereLightObjNode;
	null: NullObjNode;
	orthographicCamera: OrthographicCameraObjNode;
	perspectiveCamera: PerspectiveCameraObjNode;
	polarTransform: PolarTransformObjNode;
	pointLight: PointLightObjNode;
	poly: PolyObjNode;
	positionalAudio: PositionalAudioObjNode;
	rivet: RivetObjNode;
	scene: SceneObjNode;
	spotLight: SpotLightObjNode;
	// networks
	animationsNetwork: AnimationsObjNode;
	copNetwork: CopObjNode;
	eventsNetwork: EventsObjNode;
	materialsNetwork: MaterialsObjNode;
	postProcessNetwork: PostProcessObjNode;
	renderersNetwork: RenderersObjNode;
}

import {PolyEngine} from '../../../Poly';
export class ObjRegister {
	static run(poly: PolyEngine) {
		// lights
		poly.registerNode(AmbientLightObjNode, CATEGORY_OBJ.LIGHT);
		poly.registerNode(AreaLightObjNode, CATEGORY_OBJ.LIGHT);
		poly.registerNode(DirectionalLightObjNode, CATEGORY_OBJ.LIGHT);
		poly.registerNode(HemisphereLightObjNode, CATEGORY_OBJ.LIGHT);
		poly.registerNode(PointLightObjNode, CATEGORY_OBJ.LIGHT);
		poly.registerNode(SpotLightObjNode, CATEGORY_OBJ.LIGHT);

		// all nodes
		poly.registerNode(AudioListenerObjNode, CATEGORY_OBJ.AUDIO);
		poly.registerNode(BlendObjNode, CATEGORY_OBJ.TRANSFORM);
		poly.registerNode(ContactShadowObjNode, CATEGORY_OBJ.ADVANCED);
		poly.registerNode(GeoObjNode, CATEGORY_OBJ.GEOMETRY);
		poly.registerNode(NullObjNode, CATEGORY_OBJ.TRANSFORM);
		poly.registerNode(PolarTransformObjNode, CATEGORY_OBJ.TRANSFORM);
		poly.registerNode(PolyObjNode, CATEGORY_OBJ.ADVANCED);
		poly.registerNode(PositionalAudioObjNode, CATEGORY_OBJ.AUDIO);
		poly.registerNode(RivetObjNode, CATEGORY_OBJ.TRANSFORM);
		poly.registerNode(SceneObjNode, CATEGORY_OBJ.ADVANCED);

		// cameras
		poly.registerNode(OrthographicCameraObjNode, CATEGORY_OBJ.CAMERA);
		poly.registerNode(PerspectiveCameraObjNode, CATEGORY_OBJ.CAMERA);
		poly.registerNode(CubeCameraObjNode, CATEGORY_OBJ.CAMERA);

		// networks
		poly.registerNode(AnimationsObjNode, CATEGORY_OBJ.NETWORK);
		poly.registerNode(CopObjNode, CATEGORY_OBJ.NETWORK);
		poly.registerNode(EventsObjNode, CATEGORY_OBJ.NETWORK);
		poly.registerNode(MaterialsObjNode, CATEGORY_OBJ.NETWORK);
		poly.registerNode(PostProcessObjNode, CATEGORY_OBJ.NETWORK);
		poly.registerNode(RenderersObjNode, CATEGORY_OBJ.NETWORK);
	}
}
