
// INSERT DEFINES



// /MAT/lineBasicBuilder1/param1
uniform vec3 v_POLY_param_myCustomVec;

// /MAT/lineBasicBuilder1/globals1
varying vec3 v_POLY_globals1_position;






#if DEPTH_PACKING == 3200

	uniform float opacity;

#endif

#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

varying vec2 vHighPrecisionZW;

void main() {

	#include <clipping_planes_fragment>

	vec4 diffuseColor = vec4( 1.0 );

	#if DEPTH_PACKING == 3200

		diffuseColor.a = opacity;

	#endif

	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>

	#include <logdepthbuf_fragment>

	// Higher precision equivalent of gl_FragCoord.z. This assumes depthRange has been left to its default values.
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;

	#if DEPTH_PACKING == 3200

		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );

	#elif DEPTH_PACKING == 3201

		gl_FragColor = packDepthToRGBA( fragCoordZ );

	#endif

	// INSERT BODY



	// /MAT/lineBasicBuilder1/param1
	vec3 v_POLY_param1_val = v_POLY_param_myCustomVec;
	
	// /MAT/lineBasicBuilder1/add1
	vec3 v_POLY_add1_sum = (v_POLY_globals1_position + v_POLY_param1_val + vec3(0.0, 0.0, 0.0));
	
	// /MAT/lineBasicBuilder1/output1
	diffuseColor.xyz = v_POLY_add1_sum;




	// all this shader above the INSERT BODY line
	// is copied from the threejs ShaderLib.depth template fragment shader.
	// The line below is necessary to tie the alpha to the one that is computed by the gl nodes.
	// I'm not entirely sure why I need to negate diffuseColor.a with '1.0 -'
	// but it seems to be what make the shader match the alpha of the main material.
	gl_FragColor.a = 1.0 - diffuseColor.a;

}
