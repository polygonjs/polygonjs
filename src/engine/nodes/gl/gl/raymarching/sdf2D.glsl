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