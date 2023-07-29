import {CATEGORY_MAT} from './Category';

import {BuilderUniformUpdateMatNode} from '../../../nodes/mat/BuilderUniformUpdate';
import {CodeMatNode} from '../../../nodes/mat/Code';
import {ColorMatNode} from '../../../nodes/mat/Color';
import {EnvMapMatNode} from '../../../nodes/mat/EnvMap';
import {LineBasicMatNode} from '../../../nodes/mat/LineBasic';
import {LineBasicBuilderMatNode} from '../../../nodes/mat/LineBasicBuilder';
import {MeshBasicMatNode} from '../../../nodes/mat/MeshBasic';
import {MeshBasicBuilderMatNode} from '../../../nodes/mat/MeshBasicBuilder';
import {MeshDepthMatNode} from '../../../nodes/mat/MeshDepth';
import {MeshDepthBuilderMatNode} from '../../../nodes/mat/MeshDepthBuilder';
import {MeshDistanceMatNode} from '../../../nodes/mat/MeshDistance';
import {MeshDistanceBuilderMatNode} from '../../../nodes/mat/MeshDistanceBuilder';
import {MeshLambertMatNode} from '../../../nodes/mat/MeshLambert';
import {MeshLambertBuilderMatNode} from '../../../nodes/mat/MeshLambertBuilder';
import {MeshMatcapMatNode} from '../../../nodes/mat/MeshMatcap';
import {MeshNormalMatNode} from '../../../nodes/mat/MeshNormal';
import {MeshPhongMatNode} from '../../../nodes/mat/MeshPhong';
import {MeshPhongBuilderMatNode} from '../../../nodes/mat/MeshPhongBuilder';
import {MeshPhysicalMatNode} from '../../../nodes/mat/MeshPhysical';
import {MeshPhysicalBuilderMatNode} from '../../../nodes/mat/MeshPhysicalBuilder';
import {MeshStandardMatNode} from '../../../nodes/mat/MeshStandard';
import {MeshStandardBuilderMatNode} from '../../../nodes/mat/MeshStandardBuilder';
import {MeshToonMatNode} from '../../../nodes/mat/MeshToon';
import {MeshToonBuilderMatNode} from '../../../nodes/mat/MeshToonBuilder';
import {PointsMatNode} from '../../../nodes/mat/Points';
import {PointsBuilderMatNode} from '../../../nodes/mat/PointsBuilder';
// import {RayMarchingMatNode} from '../../../nodes/mat/RayMarching';
import {RayMarchingBuilderMatNode} from '../../../nodes/mat/RayMarchingBuilder';
import {ShadowMatNode} from '../../../nodes/mat/Shadow';
import {SkyMatNode} from '../../../nodes/mat/Sky';
import {VolumeMatNode} from '../../../nodes/mat/Volume';
import {VolumeBuilderMatNode} from '../../../nodes/mat/VolumeBuilder';

// networks
import {ActorsNetworkMatNode} from '../../../nodes/mat/ActorsNetwork';
import {AnimationsNetworkMatNode} from '../../../nodes/mat/AnimationsNetwork';
import {AudioNetworkMatNode} from '../../../nodes/mat/AudioNetwork';
import {CopNetworkMatNode} from '../../../nodes/mat/CopNetwork';
import {EventsNetworkMatNode} from '../../../nodes/mat/EventsNetwork';
import {MaterialsNetworkMatNode} from '../../../nodes/mat/MaterialsNetwork';
import {PostProcessNetworkMatNode} from '../../../nodes/mat/PostProcessNetwork';
import {RenderersNetworkMatNode} from '../../../nodes/mat/RenderersNetwork';

export interface MatNodeChildrenMap {
	builderUniformUpdate: BuilderUniformUpdateMatNode;
	code: CodeMatNode;
	color: ColorMatNode;
	envMap: EnvMapMatNode;
	lineBasic: LineBasicMatNode;
	lineBasicBuilder: LineBasicBuilderMatNode;
	meshBasic: MeshBasicMatNode;
	meshBasicBuilder: MeshBasicBuilderMatNode;
	meshDepth: MeshDepthMatNode;
	meshDepthBuilder: MeshDepthBuilderMatNode;
	MeshDistance: MeshDistanceMatNode;
	meshDistanceBuilder: MeshDistanceBuilderMatNode;
	meshLambert: MeshLambertMatNode;
	meshLambertBuilder: MeshLambertBuilderMatNode;
	meshMatcap: MeshMatcapMatNode;
	meshNormal: MeshNormalMatNode;
	meshPhong: MeshPhongMatNode;
	meshPhongBuilder: MeshPhongBuilderMatNode;
	meshPhysical: MeshPhysicalMatNode;
	meshPhysicalBuilder: MeshPhysicalBuilderMatNode;
	meshStandard: MeshStandardMatNode;
	meshStandardBuilder: MeshStandardBuilderMatNode;
	meshToon: MeshToonMatNode;
	meshToonBuilder: MeshToonBuilderMatNode;
	points: PointsMatNode;
	pointsBuilder: PointsBuilderMatNode;
	// rayMarching: RayMarchingMatNode;
	rayMarchingBuilder: RayMarchingBuilderMatNode;
	shadow: ShadowMatNode;
	sky: SkyMatNode;
	volume: VolumeMatNode;
	volumeBuilder: VolumeBuilderMatNode;
	// networks
	actorsNetwork: ActorsNetworkMatNode;
	animationsNetwork: AnimationsNetworkMatNode;
	audioNetwork: AudioNetworkMatNode;
	copNetwork: CopNetworkMatNode;
	eventsNetwork: EventsNetworkMatNode;
	materialsNetwork: MaterialsNetworkMatNode;
	postProcessNetwork: PostProcessNetworkMatNode;
	renderersNetwork: RenderersNetworkMatNode;
}

import {PolyEngine} from '../../../Poly';
export class MatRegister {
	static run(poly: PolyEngine) {
		poly.registerNode(BuilderUniformUpdateMatNode, CATEGORY_MAT.ADVANCED);
		poly.registerNode(CodeMatNode, CATEGORY_MAT.ADVANCED);
		if (process.env.NODE_ENV == 'development') {
			poly.registerNode(ColorMatNode, CATEGORY_MAT.UPDATE);
			poly.registerNode(EnvMapMatNode, CATEGORY_MAT.UPDATE);
		}
		poly.registerNode(LineBasicMatNode, CATEGORY_MAT.LINE);
		poly.registerNode(LineBasicBuilderMatNode, CATEGORY_MAT.LINE);
		poly.registerNode(MeshBasicMatNode, CATEGORY_MAT.MESH);
		poly.registerNode(MeshBasicBuilderMatNode, CATEGORY_MAT.ADVANCED);
		poly.registerNode(MeshDepthMatNode, CATEGORY_MAT.MESH);
		poly.registerNode(MeshDepthBuilderMatNode, CATEGORY_MAT.ADVANCED);
		if (process.env.NODE_ENV == 'development') {
			poly.registerNode(MeshDistanceMatNode, CATEGORY_MAT.MESH);
			poly.registerNode(MeshDistanceBuilderMatNode, CATEGORY_MAT.ADVANCED);
		}
		poly.registerNode(MeshLambertMatNode, CATEGORY_MAT.MESH);
		poly.registerNode(MeshLambertBuilderMatNode, CATEGORY_MAT.ADVANCED);
		poly.registerNode(MeshMatcapMatNode, CATEGORY_MAT.MESH);
		poly.registerNode(MeshNormalMatNode, CATEGORY_MAT.MESH);
		poly.registerNode(MeshPhongMatNode, CATEGORY_MAT.MESH);
		poly.registerNode(MeshPhongBuilderMatNode, CATEGORY_MAT.ADVANCED);
		poly.registerNode(MeshPhysicalMatNode, CATEGORY_MAT.MESH);
		poly.registerNode(MeshPhysicalBuilderMatNode, CATEGORY_MAT.ADVANCED);
		poly.registerNode(MeshStandardMatNode, CATEGORY_MAT.MESH);
		poly.registerNode(MeshStandardBuilderMatNode, CATEGORY_MAT.ADVANCED);
		poly.registerNode(MeshToonMatNode, CATEGORY_MAT.MESH);
		poly.registerNode(MeshToonBuilderMatNode, CATEGORY_MAT.ADVANCED);
		poly.registerNode(PointsMatNode, CATEGORY_MAT.POINTS);
		poly.registerNode(PointsBuilderMatNode, CATEGORY_MAT.ADVANCED);
		poly.registerNode(RayMarchingBuilderMatNode, CATEGORY_MAT.ADVANCED);
		poly.registerNode(ShadowMatNode, CATEGORY_MAT.ADVANCED);
		poly.registerNode(SkyMatNode, CATEGORY_MAT.MESH);
		poly.registerNode(VolumeMatNode, CATEGORY_MAT.VOLUME);
		poly.registerNode(VolumeBuilderMatNode, CATEGORY_MAT.VOLUME);
		// networks
		poly.registerNode(ActorsNetworkMatNode, CATEGORY_MAT.NETWORK);
		poly.registerNode(AnimationsNetworkMatNode, CATEGORY_MAT.NETWORK);
		poly.registerNode(AudioNetworkMatNode, CATEGORY_MAT.NETWORK);
		poly.registerNode(CopNetworkMatNode, CATEGORY_MAT.NETWORK);
		poly.registerNode(EventsNetworkMatNode, CATEGORY_MAT.NETWORK);
		poly.registerNode(MaterialsNetworkMatNode, CATEGORY_MAT.NETWORK);
		poly.registerNode(PostProcessNetworkMatNode, CATEGORY_MAT.NETWORK);
		poly.registerNode(RenderersNetworkMatNode, CATEGORY_MAT.NETWORK);
	}
}
