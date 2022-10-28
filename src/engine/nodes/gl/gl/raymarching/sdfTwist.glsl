vec3 SDFTwistX( in vec3 p, float twist )
{
	float c = cos(twist*p.x);
	float s = sin(twist*p.x);
	mat2 m = mat2(c,-s,s,c);
	return vec3(p.x,m*p.yz);
}
vec3 SDFTwistY( in vec3 p, float twist )
{
	float c = cos(twist*p.y);
	float s = sin(twist*p.y);
	mat2 m = mat2(c,-s,s,c);
	vec2 t = m*p.xz;
	return vec3(t.x,p.y,t.y);
}
vec3 SDFTwistZ( in vec3 p, float twist )
{
	float c = cos(twist*p.z);
	float s = sin(twist*p.z);
	mat2 m = mat2(c,-s,s,c);
	return vec3(m*p.xy,p.z);
}