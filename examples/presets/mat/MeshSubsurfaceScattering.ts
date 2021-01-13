import {MeshSubsurfaceScatteringMatNode} from '../../../src/engine/nodes/mat/MeshSubsurfaceScattering';

export function MeshSubsurfaceScatteringMatNodePresets() {
	return {
		bunny: function (node: MeshSubsurfaceScatteringMatNode) {
			node.p.map.set('/COP/white');
			node.p.thicknessMap.set('/COP/bunny_thickness');
			node.p.diffuse.set([1.0, 0.2, 0.2]);
			node.p.shininess.set(500);
			node.p.thicknessColor.set([0.5, 0.3, 0]);
			node.p.thicknessDistortion.set(0.1);
			node.p.thicknessAmbient.set(0.4);
			node.p.thicknessAttenuation.set(0.8);
			node.p.thicknessPower.set(2.0);
			node.p.thicknessScale.set(16.0);
		},
	};
}
