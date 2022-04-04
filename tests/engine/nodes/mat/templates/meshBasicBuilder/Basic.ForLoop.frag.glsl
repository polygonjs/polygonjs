
uniform vec3 diffuse;
uniform float opacity;

#ifndef FLAT_SHADED

	varying vec3 vNormal;

#endif

#include <common>



// /MAT/meshBasicBuilder1/globals1
varying vec3 v_POLY_globals1_position;




#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	#include <clipping_planes_fragment>

	vec4 diffuseColor = vec4( diffuse, opacity );



	// /MAT/meshBasicBuilder1/forLoop1
	vec3 v_POLY_forLoop1_position = v_POLY_globals1_position;
	for(int v_POLY_forLoop1_i = 0; v_POLY_forLoop1_i < 10; v_POLY_forLoop1_i+= 1){
		// /MAT/meshBasicBuilder1/forLoop1/subnetInput1
		int v_POLY_forLoop1_subnetInput1_i = v_POLY_forLoop1_i;
		int v_POLY_forLoop1_subnetInput1_start = 0;
		int v_POLY_forLoop1_subnetInput1_max = 10;
		int v_POLY_forLoop1_subnetInput1_step = 1;
		vec3 v_POLY_forLoop1_subnetInput1_position = v_POLY_forLoop1_position;
	
		// /MAT/meshBasicBuilder1/forLoop1/add1
		vec3 v_POLY_forLoop1_add1_sum = (v_POLY_forLoop1_subnetInput1_position + vec3(0.1, 0.1, 0.1));
	
		// /MAT/meshBasicBuilder1/forLoop1/subnetOutput1
		v_POLY_forLoop1_position = v_POLY_forLoop1_add1_sum;
	}
	
	// /MAT/meshBasicBuilder1/output1
	diffuseColor.xyz = v_POLY_forLoop1_position;




	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>

	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );

	// accumulation (baked indirect lighting only)
	#ifdef USE_LIGHTMAP

		vec4 lightMapTexel = texture2D( lightMap, vUv2 );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;

	#else

		reflectedLight.indirectDiffuse += vec3( 1.0 );

	#endif

	// modulation
	#include <aomap_fragment>

	reflectedLight.indirectDiffuse *= diffuseColor.rgb;

	vec3 outgoingLight = reflectedLight.indirectDiffuse;

	#include <envmap_fragment>

	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

}
