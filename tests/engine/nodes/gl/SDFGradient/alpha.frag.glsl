
uniform vec3 diffuse;
uniform float opacity;

#ifndef FLAT_SHADED

	varying vec3 vNormal;

#endif

#include <common>



// /MAT/meshBasicBuilder1/SDFGradient1/SDFSphere1
// https://iquilezles.org/www/articles/distfunctions/distfunctions.htm

float sdSphere( vec3 p, float s )
{
	return length(p)-s;
}

float sdBox( vec3 p, vec3 b )
{
	vec3 q = abs(p) - b;
	return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}


float opUnion( float d1, float d2 ) { return min(d1,d2); }
float opSubtraction( float d1, float d2 ) { return max(-d1,d2); }
float opIntersection( float d1, float d2 ) { return max(d1,d2); }

float opSmoothUnion( float d1, float d2, float k ) {
	float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
	return mix( d2, d1, h ) - k*h*(1.0-h);
}

float opSmoothSubtraction( float d1, float d2, float k ) {
	float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );
	return mix( d2, -d1, h ) + k*h*(1.0-h);
}

float opSmoothIntersection( float d1, float d2, float k ) {
	float h = clamp( 0.5 - 0.5*(d2-d1)/k, 0.0, 1.0 );
	return mix( d2, d1, h ) + k*h*(1.0-h);
}

// /MAT/meshBasicBuilder1/SDFGradient1
float v_POLY_SDFGradient1_sdfFunction(vec3 position, vec2 input0){
	// /MAT/meshBasicBuilder1/SDFGradient1/subnetInput1
	vec3 v_POLY_SDFGradient1_subnetInput1_position = position;
	vec2 v_POLY_SDFGradient1_subnetInput1_input0 = input0;

	// /MAT/meshBasicBuilder1/SDFGradient1/vec2ToVec3_1
	vec3 v_POLY_SDFGradient1_vec2ToVec3_1_vec3 = vec3(v_POLY_SDFGradient1_subnetInput1_input0.xy, 0.0);

	// /MAT/meshBasicBuilder1/SDFGradient1/add1
	vec3 v_POLY_SDFGradient1_add1_sum = (v_POLY_SDFGradient1_subnetInput1_position + v_POLY_SDFGradient1_vec2ToVec3_1_vec3 + vec3(0.0, 0.0, 0.0));

	// /MAT/meshBasicBuilder1/SDFGradient1/SDFSphere1
	float v_POLY_SDFGradient1_SDFSphere1_float = sdSphere(v_POLY_SDFGradient1_add1_sum - vec3(0.0, 0.0, 0.0), 1.0);

	// /MAT/meshBasicBuilder1/SDFGradient1/subnetOutput1
	return v_POLY_SDFGradient1_SDFSphere1_float;
}

vec3 v_POLY_SDFGradient1_gradientFunction( in vec3 p, vec2 input0 )
{
	const float eps = 0.0001;
	const vec2 h = vec2(eps,0);
	return normalize(
		vec3(
			v_POLY_SDFGradient1_sdfFunction(p+h.xyy, input0) - v_POLY_SDFGradient1_sdfFunction(p-h.xyy, input0),
			v_POLY_SDFGradient1_sdfFunction(p+h.yxy, input0) - v_POLY_SDFGradient1_sdfFunction(p-h.yxy, input0),
			v_POLY_SDFGradient1_sdfFunction(p+h.yyx, input0) - v_POLY_SDFGradient1_sdfFunction(p-h.yyx, input0)
		)
	);
}








// /MAT/meshBasicBuilder1/globals1
varying vec3 v_POLY_globals1_position;
varying vec2 v_POLY_globals1_uv;




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



	// /MAT/meshBasicBuilder1/SDFGradient1
	float v_POLY_SDFGradient1_sdf = v_POLY_SDFGradient1_sdfFunction(v_POLY_globals1_position, v_POLY_globals1_uv);
	vec3 v_POLY_SDFGradient1_gradient = v_POLY_SDFGradient1_gradientFunction(v_POLY_globals1_position, v_POLY_globals1_uv);
	
	// /MAT/meshBasicBuilder1/output1
	diffuseColor.a = v_POLY_SDFGradient1_sdf;




	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>

	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );

	// accumulation (baked indirect lighting only)
	#ifdef USE_LIGHTMAP

		vec4 lightMapTexel= texture2D( lightMap, vUv2 );
		reflectedLight.indirectDiffuse += lightMapTexelToLinear( lightMapTexel ).rgb * lightMapIntensity;

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
