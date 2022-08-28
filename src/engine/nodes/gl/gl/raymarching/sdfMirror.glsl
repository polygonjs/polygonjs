
/*
SDF Mirror
*/
vec3 SDFMirrorX( in vec3 p )
{
	p.x = abs(p.x);
	return p;
}
vec3 SDFMirrorY( in vec3 p )
{
	p.y = abs(p.y);
	return p;
}
vec3 SDFMirrorZ( in vec3 p )
{
	p.z = abs(p.z);
	return p;
}
vec3 SDFMirrorXY( in vec3 p )
{
	p.x = abs(p.x);
	p.y = abs(p.y);
	return p;
}
vec3 SDFMirrorXZ( in vec3 p )
{
	p.x = abs(p.x);
	p.z = abs(p.z);
	return p;
}
vec3 SDFMirrorYZ( in vec3 p )
{
	p.y = abs(p.y);
	p.z = abs(p.z);
	return p;
}
vec3 SDFMirrorXYZ( in vec3 p )
{
	p.x = abs(p.x);
	p.y = abs(p.y);
	p.z = abs(p.z);
	return p;
}

vec3 SDFMirrorXSmooth( in vec3 p, float c )
{
	p.x = sqrt(pow(p.x,2.) + c);
	return p;
}
vec3 SDFMirrorYSmooth( in vec3 p, float c )
{
	p.y = sqrt(pow(p.y,2.) + c);
	return p;
}
vec3 SDFMirrorZSmooth( in vec3 p, float c )
{
	p.z = sqrt(pow(p.z,2.) + c);
	return p;
}
vec3 SDFMirrorXYSmooth( in vec3 p, float c )
{
	p.x = sqrt(pow(p.x,2.) + c);
	p.y = sqrt(pow(p.y,2.) + c);
	return p;
}
vec3 SDFMirrorXZSmooth( in vec3 p, float c )
{
	p.x = sqrt(pow(p.x,2.) + c);
	p.z = sqrt(pow(p.z,2.) + c);
	return p;
}
vec3 SDFMirrorYZSmooth( in vec3 p, float c )
{
	p.y = sqrt(pow(p.y,2.) + c);
	p.z = sqrt(pow(p.z,2.) + c);
	return p;
}
vec3 SDFMirrorXYZSmooth( in vec3 p, float c )
{
	p.x = sqrt(pow(p.x,2.) + c);
	p.y = sqrt(pow(p.y,2.) + c);
	p.z = sqrt(pow(p.z,2.) + c);
	return p;
}
