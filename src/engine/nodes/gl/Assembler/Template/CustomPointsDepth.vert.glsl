uniform float size;
uniform float scale;
#include <common>
#include <clipping_planes_pars_vertex>
varying float vViewZDepth;

// INSERT DEFINES



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

}


