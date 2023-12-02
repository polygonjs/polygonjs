
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
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	#include <clipping_planes_fragment>

	vec4 diffuseColor = vec4( diffuse, opacity );



	// /MAT/meshBasicBuilder1/vec3ToFloat1
	float v_POLY_vec3ToFloat1_y = v_POLY_globals1_position.y;
	
	// /MAT/meshBasicBuilder1/compare1
	bool v_POLY_compare1_val = (v_POLY_vec3ToFloat1_y < 0.0);
	
	// /MAT/meshBasicBuilder1/ifThen1
	vec3 v_POLY_ifThen1_position = v_POLY_globals1_position;
	if(v_POLY_compare1_val){
		// /MAT/meshBasicBuilder1/ifThen1/subnetInput1
		vec3 v_POLY_ifThen1_subnetInput1_position = v_POLY_globals1_position;
	
		// /MAT/meshBasicBuilder1/ifThen1/multAdd1
		vec3 v_POLY_ifThen1_multAdd1_val = (vec3(2.0, 2.0, 2.0)*(v_POLY_ifThen1_subnetInput1_position + vec3(0.0, 0.0, 0.0))) + vec3(0.0, 0.0, 0.0);
	
		// /MAT/meshBasicBuilder1/ifThen1/subnetOutput1
		v_POLY_ifThen1_position = v_POLY_ifThen1_multAdd1_val;
	}
	
	// /MAT/meshBasicBuilder1/output1
	diffuseColor.xyz = v_POLY_ifThen1_position;




	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>

	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );

	// accumulation (baked indirect lighting only)
	#ifdef USE_LIGHTMAP

		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;

	#else

		reflectedLight.indirectDiffuse += vec3( 1.0 );

	#endif

	// modulation
	#include <aomap_fragment>

	reflectedLight.indirectDiffuse *= diffuseColor.rgb;

	vec3 outgoingLight = reflectedLight.indirectDiffuse;

	#include <envmap_fragment>

	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

}
