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
	vec4 diffuseColor = vec4( diffuse, opacity );



	// /MAT/meshBasicBuilder1/subnet1
	vec3 v_POLY_subnet1_input0 = v_POLY_globals1_position;
	if(true){
		// /MAT/meshBasicBuilder1/subnet1/subnetInput1
		vec3 v_POLY_subnet1_subnetInput1_input0 = v_POLY_globals1_position;
	
		// /MAT/meshBasicBuilder1/subnet1/constant1
		vec3 v_POLY_subnet1_constant1_val = vec3(1.0, 0.0, 0.0);
	
		// /MAT/meshBasicBuilder1/subnet1/constant2
		vec3 v_POLY_subnet1_constant2_val = vec3(0.0, 1.0, 0.06666666666666667);
	
		// /MAT/meshBasicBuilder1/subnet1/constant3
		vec3 v_POLY_subnet1_constant3_val = vec3(0.0, 0.0, 1.0);
	
		// /MAT/meshBasicBuilder1/subnet1/vec3ToFloat1
		float v_POLY_subnet1_vec3ToFloat1_y = v_POLY_subnet1_subnetInput1_input0.y;
	
		// /MAT/meshBasicBuilder1/subnet1/compare1
		bool v_POLY_subnet1_compare1_val = (v_POLY_subnet1_vec3ToFloat1_y > 0.0);
	
		// /MAT/meshBasicBuilder1/subnet1/compare2
		bool v_POLY_subnet1_compare2_val = (v_POLY_subnet1_vec3ToFloat1_y > -0.5);
	
		// /MAT/meshBasicBuilder1/subnet1/twoWaySwitch1
		vec3 v_POLY_subnet1_twoWaySwitch1_val;
		if(v_POLY_subnet1_compare2_val){
		v_POLY_subnet1_twoWaySwitch1_val = v_POLY_subnet1_constant2_val;
		} else {
		v_POLY_subnet1_twoWaySwitch1_val = v_POLY_subnet1_constant3_val;
		}
	
		// /MAT/meshBasicBuilder1/subnet1/twoWaySwitch2
		vec3 v_POLY_subnet1_twoWaySwitch2_val;
		if(v_POLY_subnet1_compare1_val){
		v_POLY_subnet1_twoWaySwitch2_val = v_POLY_subnet1_constant1_val;
		} else {
		v_POLY_subnet1_twoWaySwitch2_val = v_POLY_subnet1_twoWaySwitch1_val;
		}
	
		// /MAT/meshBasicBuilder1/subnet1/subnetOutput1
		v_POLY_subnet1_input0 = v_POLY_subnet1_twoWaySwitch2_val;
	}
	
	// /MAT/meshBasicBuilder1/output1
	diffuseColor.xyz = v_POLY_subnet1_input0;



	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
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