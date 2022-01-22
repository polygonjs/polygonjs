uniform float size;
uniform float scale;
#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <clipping_planes_pars_vertex>
varying float vViewZDepth;

// INSERT DEFINES


// vHighPrecisionZW is added to match CustomMeshDepth.frag
// which is itself taken from threejs
varying vec2 vHighPrecisionZW;

void main() {

	// INSERT BODY


	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>

	#ifdef USE_SIZEATTENUATION
		bool isPerspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	vWorldPosition = worldPosition.xyz;

	vHighPrecisionZW = gl_Position.zw;
}
