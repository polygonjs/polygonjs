import {CATEGORY_MAT} from './Category';

import {AnimationsMatNode} from '../../../nodes/mat/Animations';
import {CopMatNode} from '../../../nodes/mat/Cop';
import {EventsMatNode} from '../../../nodes/mat/Events';
import {LineBasicMatNode} from '../../../nodes/mat/LineBasic';
import {MaterialsMatNode} from '../../../nodes/mat/Materials';
import {MeshBasicMatNode} from '../../../nodes/mat/MeshBasic';
import {MeshBasicBuilderMatNode} from '../../../nodes/mat/MeshBasicBuilder';
import {MeshLambertMatNode} from '../../../nodes/mat/MeshLambert';
import {MeshLambertBuilderMatNode} from '../../../nodes/mat/MeshLambertBuilder';
import {MeshPhongMatNode} from '../../../nodes/mat/MeshPhong';
import {MeshStandardMatNode} from '../../../nodes/mat/MeshStandard';
import {MeshStandardBuilderMatNode} from '../../../nodes/mat/MeshStandardBuilder';
import {MeshSubsurfaceScatteringMatNode} from '../../../nodes/mat/MeshSubsurfaceScattering';
import {PointsMatNode} from '../../../nodes/mat/Points';
import {PointsBuilderMatNode} from '../../../nodes/mat/PointsBuilder';
import {PostProcessMatNode} from '../../../nodes/mat/PostProcess';
import {RenderersMatNode} from '../../../nodes/mat/Renderers';
import {ShadowMatNode} from '../../../nodes/mat/Shadow';
import {SkyMatNode} from '../../../nodes/mat/Sky';
import {VolumeMatNode} from '../../../nodes/mat/Volume';
import {VolumeBuilderMatNode} from '../../../nodes/mat/VolumeBuilder';

export interface MatNodeChildrenMap {
	lineBasic: LineBasicMatNode;
	meshBasic: MeshBasicMatNode;
	meshBasicBuilder: MeshBasicBuilderMatNode;
	meshLambert: MeshLambertMatNode;
	meshLambertBuilder: MeshLambertBuilderMatNode;
	meshPhong: MeshPhongMatNode;
	meshStandard: MeshStandardMatNode;
	meshStandardBuilder: MeshStandardBuilderMatNode;
	meshSubsurfaceScattering: MeshSubsurfaceScatteringMatNode;
	points: PointsMatNode;
	pointsBuilder: PointsBuilderMatNode;
	shadow: ShadowMatNode;
	sky: SkyMatNode;
	volume: VolumeMatNode;
	volumeBuilder: VolumeBuilderMatNode;
	// networks
	animations: AnimationsMatNode;
	cop: CopMatNode;
	events: EventsMatNode;
	materials: MaterialsMatNode;
	postProcess: PostProcessMatNode;
	renderers: RenderersMatNode;
}

import {Poly} from '../../../Poly';
export class MatRegister {
	static run(poly: Poly) {
		poly.registerNode(LineBasicMatNode, CATEGORY_MAT.LINE);
		poly.registerNode(MeshBasicMatNode, CATEGORY_MAT.MESH);
		poly.registerNode(MeshBasicBuilderMatNode, CATEGORY_MAT.ADVANCED);
		poly.registerNode(MeshLambertMatNode, CATEGORY_MAT.MESH);
		poly.registerNode(MeshLambertBuilderMatNode, CATEGORY_MAT.ADVANCED);
		poly.registerNode(MeshPhongMatNode, CATEGORY_MAT.MESH);
		poly.registerNode(MeshStandardMatNode, CATEGORY_MAT.MESH);
		poly.registerNode(MeshStandardBuilderMatNode, CATEGORY_MAT.ADVANCED);
		poly.registerNode(MeshSubsurfaceScatteringMatNode, CATEGORY_MAT.MESH);
		poly.registerNode(PointsMatNode, CATEGORY_MAT.POINTS);
		poly.registerNode(PointsBuilderMatNode, CATEGORY_MAT.ADVANCED);
		poly.registerNode(ShadowMatNode, CATEGORY_MAT.ADVANCED);
		poly.registerNode(SkyMatNode, CATEGORY_MAT.MESH);
		poly.registerNode(VolumeMatNode, CATEGORY_MAT.VOLUME);
		poly.registerNode(VolumeBuilderMatNode, CATEGORY_MAT.VOLUME);
		// networks
		poly.registerNode(AnimationsMatNode, CATEGORY_MAT.NETWORK);
		poly.registerNode(CopMatNode, CATEGORY_MAT.NETWORK);
		poly.registerNode(EventsMatNode, CATEGORY_MAT.NETWORK);
		poly.registerNode(MaterialsMatNode, CATEGORY_MAT.NETWORK);
		poly.registerNode(PostProcessMatNode, CATEGORY_MAT.NETWORK);
		poly.registerNode(RenderersMatNode, CATEGORY_MAT.NETWORK);
	}
}
