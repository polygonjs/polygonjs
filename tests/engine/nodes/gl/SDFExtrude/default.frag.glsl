precision highp float;
precision highp int;
uniform int MAX_STEPS;
uniform float MAX_DIST;
uniform float SURF_DIST;
uniform float NORMALS_BIAS;
uniform vec3 CENTER;
#define ZERO 0
uniform float debugMinSteps;
uniform float debugMaxSteps;
uniform float debugMinDepth;
uniform float debugMaxDepth;
#include <common>
#include <packing>
#include <lightmap_pars_fragment>
#include <bsdfs>
#include <cube_uv_reflection_fragment>
#include <lights_pars_begin>
#include <lights_physical_pars_fragment>
#include <shadowmap_pars_fragment>
#if defined( SHADOW_DISTANCE )
	uniform float shadowDistanceMin;
	uniform float shadowDistanceMax;
#endif 
#if defined( SHADOW_DEPTH )
	uniform float shadowDepthMin;
	uniform float shadowDepthMax;
#endif 
varying vec3 vPw;
#if NUM_SPOT_LIGHTS > 0
	struct SpotLightRayMarching {
		vec3 worldPos;
		vec3 direction;
		float penumbra;
	};
	uniform SpotLightRayMarching spotLightsRayMarching[ NUM_SPOT_LIGHTS ];
	#if NUM_SPOT_LIGHT_COORDS > 0
		uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	#endif
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLightRayMarching {
		vec3 direction;
		float penumbra;
	};
	uniform DirectionalLightRayMarching directionalLightsRayMarching[ NUM_DIR_LIGHTS ];
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLightRayMarching {
		vec3 direction;
	};
	uniform HemisphereLightRayMarching hemisphereLightsRayMarching[ NUM_HEMI_LIGHTS ];
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLightRayMarching {
		vec3 worldPos;
		float penumbra;
	};
	uniform PointLightRayMarching pointLightsRayMarching[ NUM_POINT_LIGHTS ];
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif
struct SDFContext {
	float d;
	int stepsCount;
	int matId;
	int matId2;
	float matBlend;
};
SDFContext DefaultSDFContext(){
	return SDFContext( 0., 0, 0, 0, 0. );
}
int DefaultSDFMaterial(){
	return 0;
}
float dot2( in vec2 v ) { return dot(v,v); }
float dot2( in vec3 v ) { return dot(v,v); }
float ndot( in vec2 a, in vec2 b ) { return a.x*b.x - a.y*b.y; }
float sdBox( in vec2 p, in vec2 b )
{
	vec2 d = abs(p)-b;
	return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}
float sdCircle( vec2 p, float r )
{
	return length(p) - r;
}
float sdHeart( in vec2 p )
{
	p.x = abs(p.x);
	if( p.y+p.x>1.0 )
		return sqrt(dot2(p-vec2(0.25,0.75))) - sqrt(2.0)/4.0;
	return sqrt(min(dot2(p-vec2(0.00,1.00)),
					dot2(p-0.5*max(p.x+p.y,0.0)))) * sign(p.x-p.y);
}
float sdCross( in vec2 p, in vec2 b, float r ) 
{
	p = abs(p); p = (p.y>p.x) ? p.yx : p.xy;
	vec2  q = p - b;
	float k = max(q.y,q.x);
	vec2  w = (k>0.0) ? q : vec2(b.y-p.x,-k);
	return sign(k)*length(max(w,0.0)) + r;
}
float sdRoundedX( in vec2 p, in float w, in float r )
{
	p = abs(p);
	return length(p-min(p.x+p.y,w)*0.5) - r;
}
float sdStairs( in vec2 p, in vec2 wh, in float n )
{
	vec2 ba = wh*n;
	float d = min(dot2(p-vec2(clamp(p.x,0.0,ba.x),0.0)), 
				  dot2(p-vec2(ba.x,clamp(p.y,0.0,ba.y))) );
	float s = sign(max(-p.y,p.x-ba.x) );
	float dia = length(wh);
	p = mat2(wh.x,-wh.y, wh.y,wh.x)*p/dia;
	float id = clamp(round(p.x/dia),0.0,n-1.0);
	p.x = p.x - id*dia;
	p = mat2(wh.x, wh.y,-wh.y,wh.x)*p/dia;
	float hh = wh.y/2.0;
	p.y -= hh;
	if( p.y>hh*sign(p.x) ) s=1.0;
	p = (id<0.5 || p.x>0.0) ? p : -p;
	d = min( d, dot2(p-vec2(0.0,clamp(p.y,-hh,hh))) );
	d = min( d, dot2(p-vec2(clamp(p.x,0.0,wh.x),hh)) );
		
	return sqrt(d)*s;
}
float SDFExtrudeX( in vec3 p, in float sdf, in float h )
{
	vec2 w = vec2( sdf, abs(p.x) - h );
	return min(max(w.x,w.y),0.0) + length(max(w,0.0));
}
float SDFExtrudeY( in vec3 p, in float sdf, in float h )
{
	vec2 w = vec2( sdf, abs(p.y) - h );
	return min(max(w.x,w.y),0.0) + length(max(w,0.0));
}
float SDFExtrudeZ( in vec3 p, in float sdf, in float h )
{
	vec2 w = vec2( sdf, abs(p.z) - h );
	return min(max(w.x,w.y),0.0) + length(max(w,0.0));
}
vec2 SDFRevolutionX( in vec3 p, float o )
{
	return vec2( length(p.yz) - o, p.x );
}
vec2 SDFRevolutionY( in vec3 p, float o )
{
	return vec2( length(p.xz) - o, p.y );
}
vec2 SDFRevolutionZ( in vec3 p, float o )
{
	return vec2( length(p.xy) - o, p.z );
}
float sdSphere( vec3 p, float s )
{
	return length(p)-s;
}
float sdCutSphere( vec3 p, float r, float h )
{
	float w = sqrt(r*r-h*h);
	vec2 q = vec2( length(p.xz), p.y );
	float s = max( (h-r)*q.x*q.x+w*w*(h+r-2.0*q.y), h*q.x-w*q.y );
	return (s<0.0) ? length(q)-r :
				(q.x<w) ? h - q.y :
					length(q-vec2(w,h));
}
float sdCutHollowSphere( vec3 p, float r, float h, float t )
{
	float w = sqrt(r*r-h*h);
	
	vec2 q = vec2( length(p.xz), p.y );
	return ((h*q.x<w*q.y) ? length(q-vec2(w,h)) : 
							abs(length(q)-r) ) - t;
}
float sdBox( vec3 p, vec3 b )
{
	vec3 q = abs(p) - b*0.5;
	return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}
float sdRoundBox( vec3 p, vec3 b, float r )
{
	vec3 q = abs(p) - b*0.5;
	return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}
float sdBoxFrame( vec3 p, vec3 b, float e )
{
		p = abs(p  )-b*0.5;
	vec3 q = abs(p+e)-e;
	return min(min(
		length(max(vec3(p.x,q.y,q.z),0.0))+min(max(p.x,max(q.y,q.z)),0.0),
		length(max(vec3(q.x,p.y,q.z),0.0))+min(max(q.x,max(p.y,q.z)),0.0)),
		length(max(vec3(q.x,q.y,p.z),0.0))+min(max(q.x,max(q.y,p.z)),0.0));
}
float sdCapsule( vec3 p, vec3 a, vec3 b, float r )
{
	vec3 pa = p - a, ba = b - a;
	float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
	return length( pa - ba*h ) - r;
}
float sdVerticalCapsule( vec3 p, float h, float r )
{
	p.y -= clamp( p.y, 0.0, h );
	return length( p ) - r;
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
float sdOctogonPrism( in vec3 p, in float r, float h )
{
	const vec3 k = vec3(-0.9238795325,						0.3826834323,						0.4142135623 );	p = abs(p);
	p.xy -= 2.0*min(dot(vec2( k.x,k.y),p.xy),0.0)*vec2( k.x,k.y);
	p.xy -= 2.0*min(dot(vec2(-k.x,k.y),p.xy),0.0)*vec2(-k.x,k.y);
	p.xy -= vec2(clamp(p.x, -k.z*r, k.z*r), r);
	vec2 d = vec2( length(p.xy)*sign(p.y), p.z-h );
	return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}
float sdHexPrism( vec3 p, vec2 h )
{
	const vec3 k = vec3(-0.8660254, 0.5, 0.57735);
	p = abs(p);
	p.xy -= 2.0*min(dot(k.xy, p.xy), 0.0)*k.xy;
	vec2 d = vec2(
		length(p.xy-vec2(clamp(p.x,-k.z*h.x,k.z*h.x), h.x))*sign(p.y-h.x),
		p.z-h.y );
	return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}
float sdHorseshoe( in vec3 p, in float angle, in float r, in float le, vec2 w )
{
	vec2 c = vec2(cos(angle),sin(angle));
	p.x = abs(p.x);
	float l = length(p.xy);
	p.xy = mat2(-c.x, c.y, 
			c.y, c.x)*p.xy;
	p.xy = vec2((p.y>0.0 || p.x>0.0)?p.x:l*sign(-c.x),
				(p.x>0.0)?p.y:l );
	p.xy = vec2(p.x,abs(p.y-r))-vec2(le,0.0);
	
	vec2 q = vec2(length(max(p.xy,0.0)) + min(0.0,max(p.x,p.y)),p.z);
	vec2 d = abs(q) - w;
	return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}
float sdTriPrism( vec3 p, vec2 h )
{
	vec3 q = abs(p);
	return max(q.z-h.y,max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5);
}
float sdPyramid( vec3 p, float h)
{
	float m2 = h*h + 0.25;
	p.xz = abs(p.xz);
	p.xz = (p.z>p.x) ? p.zx : p.xz;
	p.xz -= 0.5;
	vec3 q = vec3( p.z, h*p.y - 0.5*p.x, h*p.x + 0.5*p.y);
	float s = max(-q.x,0.0);
	float t = clamp( (q.y-0.5*p.z)/(m2+0.25), 0.0, 1.0 );
	float a = m2*(q.x+s)*(q.x+s) + q.y*q.y;
	float b = m2*(q.x+0.5*t)*(q.x+0.5*t) + (q.y-m2*t)*(q.y-m2*t);
	float d2 = min(q.y,-q.x*m2-q.y*0.5) > 0.0 ? 0.0 : min(a,b);
	return sqrt( (d2+q.z*q.z)/m2 ) * sign(max(q.z,-p.y));
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
float sdCappedTorus(in vec3 p, in float an, in float ra, in float rb)
{
	vec2 sc = vec2(sin(an),cos(an));
	p.x = abs(p.x);
	float k = (sc.y*p.x>sc.x*p.z) ? dot(p.xz,sc) : length(p.xz);
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
float sdTube( vec3 p, float r )
{
	return length(p.xz)-r;
}
float sdTubeCapped( vec3 p, float h, float r )
{
	vec2 d = abs(vec2(length(p.xz),p.y)) - vec2(r,h);
	return min(max(d.x,d.y),0.0) + length(max(d,0.0));
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
float udTriangle( vec3 p, vec3 a, vec3 b, vec3 c, float thickness )
{
	vec3 ba = b - a; vec3 pa = p - a;
	vec3 cb = c - b; vec3 pb = p - b;
	vec3 ac = a - c; vec3 pc = p - c;
	vec3 nor = cross( ba, ac );
	return - thickness + sqrt(
		(sign(dot(cross(ba,nor),pa)) +
		sign(dot(cross(cb,nor),pb)) +
		sign(dot(cross(ac,nor),pc))<2.0)
		?
		min( min(
		dot2(ba*clamp(dot(ba,pa)/dot2(ba),0.0,1.0)-pa),
		dot2(cb*clamp(dot(cb,pb)/dot2(cb),0.0,1.0)-pb) ),
		dot2(ac*clamp(dot(ac,pc)/dot2(ac),0.0,1.0)-pc) )
		:
		dot(nor,pa)*dot(nor,pa)/dot2(nor) );
}
float udQuad( vec3 p, vec3 a, vec3 b, vec3 c, vec3 d, float thickness )
{
	vec3 ba = b - a; vec3 pa = p - a;
	vec3 cb = c - b; vec3 pb = p - b;
	vec3 dc = d - c; vec3 pc = p - c;
	vec3 ad = a - d; vec3 pd = p - d;
	vec3 nor = cross( ba, ad );
	return - thickness + sqrt(
		(sign(dot(cross(ba,nor),pa)) +
		sign(dot(cross(cb,nor),pb)) +
		sign(dot(cross(dc,nor),pc)) +
		sign(dot(cross(ad,nor),pd))<3.0)
		?
		min( min( min(
		dot2(ba*clamp(dot(ba,pa)/dot2(ba),0.0,1.0)-pa),
		dot2(cb*clamp(dot(cb,pb)/dot2(cb),0.0,1.0)-pb) ),
		dot2(dc*clamp(dot(dc,pc)/dot2(dc),0.0,1.0)-pc) ),
		dot2(ad*clamp(dot(ad,pd)/dot2(ad),0.0,1.0)-pd) )
		:
		dot(nor,pa)*dot(nor,pa)/dot2(nor) );
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
SDFContext GetDist(vec3 p) {
	SDFContext sdfContext = SDFContext(0., 0, 0, 0, 0.);
	float v_POLY_SDF2DCircle1_float = sdCircle(p.xy - vec2(0.0, 0.0), 1.0);
	
	float v_POLY_SDFExtrude1_d = SDFExtrudeZ(v_POLY_SDF2DCircle1_float - vec3(0.0, 0.0, 0.0), 1.0, 1.0);
	
	SDFContext v_POLY_SDFContext1_SDFContext = SDFContext(v_POLY_SDFExtrude1_d, 0, -1, -1, 0.);
	
	sdfContext = v_POLY_SDFContext1_SDFContext;
	
	return sdfContext;
}
SDFContext RayMarch(vec3 ro, vec3 rd, float side) {
	SDFContext dO = SDFContext(0.,0,0,0,0.);
	#pragma unroll_loop_start
	for(int i=0; i<MAX_STEPS; i++) {
		vec3 p = ro + rd*dO.d;
		SDFContext sdfContext = GetDist(p);
		dO.d += sdfContext.d * side;
		#if defined( DEBUG_STEPS_COUNT )
			dO.stepsCount += 1;
		#endif
		dO.matId = sdfContext.matId;
		dO.matId2 = sdfContext.matId2;
		dO.matBlend = sdfContext.matBlend;
		if(dO.d>MAX_DIST || abs(sdfContext.d)<SURF_DIST) break;
	}
	#pragma unroll_loop_end
	return dO;
}
vec3 GetNormal(vec3 p) {
	SDFContext sdfContext = GetDist(p);
	vec2 e = vec2(NORMALS_BIAS, 0);
	vec3 n = sdfContext.d - vec3(
		GetDist(p-e.xyy).d,
		GetDist(p-e.yxy).d,
		GetDist(p-e.yyx).d);
	return normalize(n);
}
float calcSoftshadow( in vec3 ro, in vec3 rd, float mint, float maxt, float k, inout SDFContext sdfContext )
{
	float res = 1.0;
	float ph = 1e20;
	for( float t=mint; t<maxt; )
	{
		float h = GetDist(ro + rd*t).d;
		#if defined( DEBUG_STEPS_COUNT )
			sdfContext.stepsCount += 1;
		#endif
		if( h<SURF_DIST )
			return 0.0;
		float y = h*h/(2.0*ph);
		float d = sqrt(h*h-y*y);
		res = min( res, k*d/max(0.0,t-y) );
		ph = h;
		t += h;
	}
	return res;
}
vec3 GetLight(vec3 p, vec3 n, inout SDFContext sdfContext) {
	vec3 dif = vec3(0.,0.,0.);
	#if NUM_SPOT_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_HEMI_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_RECT_AREA_LIGHTS > 0
		GeometricContext geometry;
		geometry.position = p;
		geometry.normal = n;
		IncidentLight directLight;
		ReflectedLight reflectedLight;
		vec3 lightPos, lightDir, l;
		vec3 lighDif;
		#if NUM_SPOT_LIGHTS > 0
			SpotLightRayMarching spotLightRayMarching;
			SpotLight spotLight;
			float spotLightSdfShadow;
			#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
				SpotLightShadow spotLightShadow;
			#endif
			#pragma unroll_loop_start
			for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
				spotLightRayMarching = spotLightsRayMarching[ i ];
				spotLight = spotLights[ i ];
				spotLight.position = spotLightRayMarching.worldPos;
				spotLight.direction = spotLightRayMarching.direction;
				getSpotLightInfo( spotLight, geometry, directLight );
				
				lightPos = spotLightRayMarching.worldPos;
				
				#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
					spotLightShadow = spotLightShadows[ i ];
					vec4 spotLightShadowCoord = spotLightMatrix[ i ] * vec4(p, 1.0);
					directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, spotLightShadowCoord ) : 1.0;
				#endif
				l = normalize(lightPos-p);
				spotLightSdfShadow = calcSoftshadow(p, l, 10.*SURF_DIST, distance(p,lightPos), 1./max(spotLightRayMarching.penumbra*0.2,0.001), sdfContext);
				lighDif = directLight.color * clamp(dot(n, l), 0., 1.) * spotLightSdfShadow;
				
				dif += lighDif;
			}
			#pragma unroll_loop_end
		#endif
		#if NUM_DIR_LIGHTS > 0
			DirectionalLightRayMarching directionalLightRayMarching;
			DirectionalLight directionalLight;
			float dirLightSdfShadow;
			#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
				DirectionalLightShadow directionalLightShadow;
			#endif
			#pragma unroll_loop_start
			for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
				directionalLightRayMarching = directionalLightsRayMarching[ i ];
				directionalLight = directionalLights[ i ];
				lightDir = directionalLightRayMarching.direction;
				getDirectionalLightInfo( directionalLight, geometry, directLight );
				#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
					directionalLightShadow = directionalLightShadows[ i ];
					vec4 dirLightShadowCoord = directionalShadowMatrix[ i ] * vec4(p, 1.0);
					directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, dirLightShadowCoord ) : 1.0;
				#endif
				l = lightDir;
				dirLightSdfShadow = calcSoftshadow(p, l, 10.*SURF_DIST, distance(p,lightPos), 1./max(directionalLightRayMarching.penumbra*0.2,0.001), sdfContext);
				lighDif = directLight.color * clamp(dot(n, l), 0., 1.) * dirLightSdfShadow;
				dif += lighDif;
			}
			#pragma unroll_loop_end
		#endif
		
		#if ( NUM_HEMI_LIGHTS > 0 )
			#pragma unroll_loop_start
			HemisphereLight hemiLight;
			for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
				hemiLight.skyColor = hemisphereLights[ i ].skyColor;
				hemiLight.groundColor = hemisphereLights[ i ].groundColor;
				hemiLight.direction = hemisphereLightsRayMarching[ i ].direction;
				dif += getHemisphereLightIrradiance( hemiLight, n );
			}
			#pragma unroll_loop_end
		#endif
		#if NUM_POINT_LIGHTS > 0
			PointLightRayMarching pointLightRayMarching;
			PointLight pointLight;
			float pointLightSdfShadow;
			#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
				PointLightShadow pointLightShadow;
			#endif
			#pragma unroll_loop_start
			for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
				pointLightRayMarching = pointLightsRayMarching[ i ];
				pointLight = pointLights[ i ];
				pointLight.position = pointLightRayMarching.worldPos;
				getPointLightInfo( pointLight, geometry, directLight );
				#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
					pointLightShadow = pointLightShadows[ i ];
					vec4 pointLightShadowCoord = pointShadowMatrix[ i ] * vec4(p, 1.0);
					directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, pointLightShadowCoord, pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
				#endif
				
				lightPos = pointLightRayMarching.worldPos;
				l = normalize(lightPos-p);
				pointLightSdfShadow = calcSoftshadow(p, l, 10.*SURF_DIST, distance(p,lightPos), 1./max(pointLightRayMarching.penumbra*0.2,0.001), sdfContext);
				lighDif = directLight.color * clamp(dot(n, l), 0., 1.) * pointLightSdfShadow;
				dif += lighDif;
			}
			#pragma unroll_loop_end
		#endif
				
	#endif
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	dif += irradiance;
	return dif;
}
vec3 applyMaterialWithoutRefraction(vec3 p, vec3 n, vec3 rayDir, int mat, inout SDFContext sdfContext){
	vec3 col = vec3(1.);
	
	return col;
}
vec3 applyMaterialWithoutReflection(vec3 p, vec3 n, vec3 rayDir, int mat, inout SDFContext sdfContext){
	vec3 col = vec3(1.);
	
	return col;
}
#ifdef RAYMARCHED_REFLECTIONS
vec3 GetReflection(vec3 p, vec3 n, vec3 rayDir, float biasMult, float roughness, int reflectionDepth, inout SDFContext sdfContextMain){
	bool hitReflection = true;
	vec3 reflectedColor = vec3(0.);
	#pragma unroll_loop_start
	for(int i=0; i < reflectionDepth; i++) {
		if(hitReflection){
			rayDir = reflect(rayDir, n);
			p += n*SURF_DIST*biasMult;
			SDFContext sdfContext = RayMarch(p, rayDir, 1.);
			#if defined( DEBUG_STEPS_COUNT )
				sdfContextMain.stepsCount += sdfContext.stepsCount;
			#endif
			if( sdfContext.d >= MAX_DIST){
				hitReflection = false;
				reflectedColor = envMapSample(rayDir, roughness);
			}
			if(hitReflection){
				p += rayDir * sdfContext.d;
				n = GetNormal(p);
				vec3 matCol = applyMaterialWithoutReflection(p, n, rayDir, sdfContext.matId, sdfContextMain);
				reflectedColor += matCol;
			}
		}
	}
	#pragma unroll_loop_end
	return reflectedColor;
}
#endif
#ifdef RAYMARCHED_REFRACTIONS
vec4 GetRefractedData(vec3 p, vec3 n, vec3 rayDir, float ior, float biasMult, float roughness, float refractionMaxDist, int refractionDepth, inout SDFContext sdfContextMain){
	bool hitRefraction = true;
	bool changeSide = true;
	#ifdef RAYMARCHED_REFRACTIONS_START_OUTSIDE_MEDIUM
	float side = -1.;
	#else
	float side =  1.;
	#endif
	float iorInverted = 1. / ior;
	vec3 refractedColor = vec3(0.);
	float distanceInsideMedium=0.;
	float totalRefractedDistance=0.;
	#pragma unroll_loop_start
	for(int i=0; i < refractionDepth; i++) {
		if(hitRefraction){
			float currentIor = side<0. ? iorInverted : ior;
			vec3 rayDirPreRefract = rayDir;
			rayDir = refract(rayDir, n, currentIor);
			changeSide = dot(rayDir, rayDir)!=0.;
			if(changeSide == true) {
				p -= n*SURF_DIST*(2.+biasMult);
			} else {
				p += n*SURF_DIST*(   biasMult);
				rayDir = reflect(rayDirPreRefract, n);
			}
			SDFContext sdfContext = RayMarch(p, rayDir, side);
			#if defined( DEBUG_STEPS_COUNT )
				sdfContextMain.stepsCount += sdfContext.stepsCount;
			#endif
			totalRefractedDistance += sdfContext.d;
			if( abs(sdfContext.d) >= MAX_DIST || totalRefractedDistance > refractionMaxDist ){
				hitRefraction = false;
				refractedColor = envMapSample(rayDir, roughness);
			}
			if(hitRefraction){
				p += rayDir * sdfContext.d;
				n = GetNormal(p) * side;
				vec3 matCol = applyMaterialWithoutRefraction(p, n, rayDir, sdfContext.matId, sdfContextMain);
				refractedColor = matCol;
				distanceInsideMedium += (side-1.)*-0.5*abs(sdfContext.d);
				if( changeSide ){
					side *= -1.;
				}
			}
		}
		#ifdef RAYMARCHED_REFRACTIONS_SAMPLE_ENV_MAP_ON_LAST
		if(i == refractionDepth-1){
			refractedColor = envMapSample(rayDir, roughness);
		}
		#endif
	}
	#pragma unroll_loop_end
	return vec4(refractedColor, distanceInsideMedium);
}
float refractionTint(float baseValue, float tint, float distanceInsideMedium, float absorption){
	float tintNegated = baseValue-tint;
	float t = tintNegated*( distanceInsideMedium*absorption );
	return max(baseValue-t, 0.);
}
float applyRefractionAbsorption(float refractedDataColor, float baseValue, float tint, float distanceInsideMedium, float absorption){
	return refractedDataColor*refractionTint(baseValue, tint, distanceInsideMedium, absorption);
}
vec3 applyRefractionAbsorption(vec3 refractedDataColor, vec3 baseValue, vec3 tint, float distanceInsideMedium, float absorption){
	return vec3(
		refractedDataColor.r * refractionTint(baseValue.r, tint.r, distanceInsideMedium, absorption),
		refractedDataColor.g * refractionTint(baseValue.g, tint.g, distanceInsideMedium, absorption),
		refractedDataColor.b * refractionTint(baseValue.b, tint.b, distanceInsideMedium, absorption)
	);
}
#endif
vec3 applyMaterial(vec3 p, vec3 n, vec3 rayDir, int mat, inout SDFContext sdfContext){
	vec3 col = vec3(0.);
	
	return col;
}
vec4 applyShading(vec3 rayOrigin, vec3 rayDir, inout SDFContext sdfContext){
	vec3 p = rayOrigin + rayDir * sdfContext.d;
	vec3 n = GetNormal(p);
	
	vec3 col = applyMaterial(p, n, rayDir, sdfContext.matId, sdfContext);
	if(sdfContext.matBlend > 0.) {
		vec3 col2 = applyMaterial(p, n, rayDir, sdfContext.matId2, sdfContext);
		col = (1. - sdfContext.matBlend)*col + sdfContext.matBlend*col2;
	}
		
	col = pow( col, vec3(0.4545) ); 
	return vec4(col, 1.);
}
void main()	{
	vec3 rayDir = normalize(vPw - cameraPosition);
	vec3 rayOrigin = cameraPosition - CENTER;
	SDFContext sdfContext = RayMarch(rayOrigin, rayDir, 1.);
	#if defined( DEBUG_DEPTH )
		float normalizedDepth = 1.-(sdfContext.d - debugMinDepth ) / ( debugMaxDepth - debugMinDepth );
		normalizedDepth = saturate(normalizedDepth);		gl_FragColor = vec4(normalizedDepth);
		return;
	#endif
	#if defined( SHADOW_DEPTH )
		float normalizedDepth = 1.-(sdfContext.d - shadowDepthMin ) / ( shadowDepthMax - shadowDepthMin );
		normalizedDepth = saturate(normalizedDepth);		gl_FragColor = packDepthToRGBA( normalizedDepth );
		return;
	#endif
	#if defined( SHADOW_DISTANCE )
		float normalizedDepth = (sdfContext.d - shadowDistanceMin ) / ( shadowDistanceMax - shadowDistanceMin );
		normalizedDepth = saturate(normalizedDepth);		gl_FragColor = packDepthToRGBA( normalizedDepth );
		return;
	#endif
	if( sdfContext.d < MAX_DIST ){
		gl_FragColor = applyShading(rayOrigin, rayDir, sdfContext);
	} else {
		gl_FragColor = vec4(0.);
	}
	#if defined( DEBUG_STEPS_COUNT )
		float normalizedStepsCount = (float(sdfContext.stepsCount) - debugMinSteps ) / ( debugMaxSteps - debugMinSteps );
		gl_FragColor = vec4(normalizedStepsCount, 1.-normalizedStepsCount, 0., 1.);
		return;
	#endif
	
}