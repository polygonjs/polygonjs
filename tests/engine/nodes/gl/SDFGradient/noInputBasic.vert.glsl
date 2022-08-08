#include <common>



// /MAT/meshBasicBuilder1/SDFGradient1/SDFSphere1
// https://iquilezles.org/articles/distfunctions/

float sdSphere( vec3 p, float s )
{
	return length(p)-s;
}

float sdBox( vec3 p, vec3 b )
{
	vec3 q = abs(p) - b;
	return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}
float sdRoundBox( vec3 p, vec3 b, float r )
{
	vec3 q = abs(p) - b;
	return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}
float sdBoxFrame( vec3 p, vec3 b, float e )
{
		p = abs(p  )-b;
	vec3 q = abs(p+e)-e;
	return min(min(
		length(max(vec3(p.x,q.y,q.z),0.0))+min(max(p.x,max(q.y,q.z)),0.0),
		length(max(vec3(q.x,p.y,q.z),0.0))+min(max(q.x,max(p.y,q.z)),0.0)),
		length(max(vec3(q.x,q.y,p.z),0.0))+min(max(q.x,max(q.y,p.z)),0.0));
}
float sdPlane( vec3 p, vec3 n, float h )
{
	return dot(p,n) + h;
}
float sdTorus( vec3 p, vec2 t )
{
	vec2 q = vec2(length(p.xz)-t.x,p.y);
	return length(q)-t.y;
}
float sdCappedTorus(in vec3 p, in vec2 sc, in float ra, in float rb)
{
	p.x = abs(p.x);
	float k = (sc.y*p.x>sc.x*p.y) ? dot(p.xy,sc) : length(p.xy);
	return sqrt( dot(p,p) + ra*ra - 2.0*ra*k ) - rb;
}

float SDFUnion( float d1, float d2 ) { return min(d1,d2); }
float SDFSubtract( float d1, float d2 ) { return max(-d1,d2); }
float SDFIntersect( float d1, float d2 ) { return max(d1,d2); }

float SDFSmoothUnion( float d1, float d2, float k ) {
	float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
	return mix( d2, d1, h ) - k*h*(1.0-h);
}

float SDFSmoothSubtract( float d1, float d2, float k ) {
	float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );
	return mix( d2, -d1, h ) + k*h*(1.0-h);
}

float SDFSmoothIntersect( float d1, float d2, float k ) {
	float h = clamp( 0.5 - 0.5*(d2-d1)/k, 0.0, 1.0 );
	return mix( d2, d1, h ) + k*h*(1.0-h);
}

// /MAT/meshBasicBuilder1/SDFGradient1
float v_POLY_SDFGradient1_sdfFunction(vec3 position){
	// /MAT/meshBasicBuilder1/SDFGradient1/subnetInput1
	vec3 v_POLY_SDFGradient1_subnetInput1_position = position;

	// /MAT/meshBasicBuilder1/SDFGradient1/SDFSphere1
	float v_POLY_SDFGradient1_SDFSphere1_float = sdSphere(v_POLY_SDFGradient1_subnetInput1_position - vec3(0.0, 0.0, 0.0), 1.0);

	// /MAT/meshBasicBuilder1/SDFGradient1/subnetOutput1
	return v_POLY_SDFGradient1_SDFSphere1_float;
}

vec3 v_POLY_SDFGradient1_gradientFunction( in vec3 p )
{
	const float eps = 0.0001;
	const vec2 h = vec2(eps,0);
	return normalize(
		vec3(
			v_POLY_SDFGradient1_sdfFunction(p+h.xyy) - v_POLY_SDFGradient1_sdfFunction(p-h.xyy),
			v_POLY_SDFGradient1_sdfFunction(p+h.yxy) - v_POLY_SDFGradient1_sdfFunction(p-h.yxy),
			v_POLY_SDFGradient1_sdfFunction(p+h.yyx) - v_POLY_SDFGradient1_sdfFunction(p-h.yyx)
		)
	);
}





#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>



	// /MAT/meshBasicBuilder1/SDFGradient1
	vec3 v_POLY_SDFGradient1_gradient = v_POLY_SDFGradient1_gradientFunction(vec3(0.0, 0.0, 0.0));
	
	// /MAT/meshBasicBuilder1/output1
	vec3 transformed = v_POLY_SDFGradient1_gradient;
	vec3 objectNormal = normal;
	#ifdef USE_TANGENT
		vec3 objectTangent = vec3( tangent.xyz );
	#endif



	#include <morphcolor_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
// removed:
//		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
// removed:
//	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}