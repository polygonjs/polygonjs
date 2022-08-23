#include <common>



// /MAT/meshBasicBuilder1/SDFGradient1/SDFSphere1
// https://iquilezles.org/articles/distfunctions/
float dot2( in vec2 v ) { return dot(v,v); }
float dot2( in vec3 v ) { return dot(v,v); }
float ndot( in vec2 a, in vec2 b ) { return a.x*b.x - a.y*b.y; }
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
float sdCone( in vec3 p, in vec2 c, float h )
{
	vec2 q = h*vec2(c.x/c.y,-1.0);
	vec2 w = vec2( length(p.xz), p.y );
	vec2 a = w - q*clamp( dot(w,q)/dot(q,q), 0.0, 1.0 );
	vec2 b = w - q*vec2( clamp( w.x/q.x, 0.0, 1.0 ), 1.0 );
	float k = sign( q.y );
	float d = min(dot( a, a ),dot(b, b));
	float s = max( k*(w.x*q.y-w.y*q.x),k*(w.y-q.y)  );
	return sqrt(d)*sign(s);
}
float sdConeWrapped(vec3 pos, float angle, float height){
	return sdCone(pos, vec2(sin(angle), cos(angle)), height);
}
float sdRoundCone( vec3 p, float r1, float r2, float h )
{
	float b = (r1-r2)/h;
	float a = sqrt(1.0-b*b);
	vec2 q = vec2( length(p.xz), p.y );
	float k = dot(q,vec2(-b,a));
	if( k<0.0 ) return length(q) - r1;
	if( k>a*h ) return length(q-vec2(0.0,h)) - r2;
	return dot(q, vec2(a,b) ) - r1;
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
float sdLink( vec3 p, float le, float r1, float r2 )
{
  vec3 q = vec3( p.x, max(abs(p.y)-le,0.0), p.z );
  return length(vec2(length(q.xy)-r1,q.z)) - r2;
}
float sdSolidAngle(vec3 pos, vec2 c, float radius)
{
	vec2 p = vec2( length(pos.xz), pos.y );
	float l = length(p) - radius;
	float m = length(p - c*clamp(dot(p,c),0.0,radius) );
	return max(l,m*sign(c.y*p.x-c.x*p.y));
}
float sdSolidAngleWrapped(vec3 pos, float angle, float radius){
	return sdSolidAngle(pos, vec2(sin(angle), cos(angle)), radius);
}
float sdRhombus(vec3 p, float la, float lb, float h, float ra)
{
  p = abs(p);
  vec2 b = vec2(la,lb);
  float f = clamp( (ndot(b,b-2.0*p.xz))/dot(b,b), -1.0, 1.0 );
  vec2 q = vec2(length(p.xz-0.5*b*vec2(1.0-f,1.0+f))*sign(p.x*b.y+p.z*b.x-b.x*b.y)-ra, p.y-h);
  return min(max(q.x,q.y),0.0) + length(max(q,0.0));
}
float sdOctahedron( vec3 p, float s)
{
  p = abs(p);
  float m = p.x+p.y+p.z-s;
  vec3 q;
       if( 3.0*p.x < m ) q = p.xyz;
  else if( 3.0*p.y < m ) q = p.yzx;
  else if( 3.0*p.z < m ) q = p.zxy;
  else return m*0.57735027;
    
  float k = clamp(0.5*(q.z-q.y+s),0.0,s); 
  return length(vec3(q.x,q.y-s+k,q.z-k)); 
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
vec4 SDFElongateFast( in vec3 p, in vec3 h )
{
	return vec4( p-clamp(p,-h,h), 0.0 );
}
vec4 SDFElongateSlow( in vec3 p, in vec3 h )
{
	vec3 q = abs(p)-h;
	return vec4( max(q,0.0), min(max(q.x,max(q.y,q.z)),0.0) );
}
float SDFOnion( in float sdf, in float thickness )
{
	return abs(sdf)-thickness;
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



	// /MAT/meshBasicBuilder1/globals1
	v_POLY_globals1_position = vec3(position);
	v_POLY_globals1_uv = vec2(uv);
	
	// /MAT/meshBasicBuilder1/SDFGradient1
	vec3 v_POLY_SDFGradient1_gradient = v_POLY_SDFGradient1_gradientFunction(v_POLY_globals1_position, v_POLY_globals1_uv);
	
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