
uniform float size;
uniform float scale;
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
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewZDepth = - mvPosition.z;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif

	vHighPrecisionZW = gl_Position.zw;

}
