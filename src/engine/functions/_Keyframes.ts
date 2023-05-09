import {NamedFunction1, NamedFunction2, NamedFunction3} from './_Base';
import {ChannelData} from '../../core/keyframes/KeyframeCommon';
import {Channel} from '../../core/keyframes/Channel';
import {Vector2, Vector3, Vector4} from 'three';

type ChannelData1 = ChannelData;
type ChannelData2 = [ChannelData, ChannelData];
type ChannelData3 = [ChannelData, ChannelData, ChannelData];
type ChannelData4 = [ChannelData, ChannelData, ChannelData, ChannelData];

type Channel2 = {x: Channel; y: Channel};
type Channel3 = {x: Channel; y: Channel; z: Channel};
type Channel4 = {x: Channel; y: Channel; z: Channel; w: Channel};

export class channelFloat extends NamedFunction1<[ChannelData1]> {
	static override type() {
		return 'channelFloat';
	}
	func(data: ChannelData1): Channel {
		return new Channel(data);
	}
}
export class channelVector2 extends NamedFunction1<[ChannelData2]> {
	static override type() {
		return 'channelVector2';
	}
	func(data: ChannelData2): Channel2 {
		return {
			x: new Channel(data[0]),
			y: new Channel(data[1]),
		};
	}
}
export class channelVector3 extends NamedFunction1<[ChannelData3]> {
	static override type() {
		return 'channelVector3';
	}
	func(data: ChannelData3): Channel3 {
		return {
			x: new Channel(data[0]),
			y: new Channel(data[1]),
			z: new Channel(data[2]),
		};
	}
}

export class channelVector4 extends NamedFunction1<[ChannelData4]> {
	static override type() {
		return 'channelVector4';
	}
	func(data: ChannelData4): Channel4 {
		return {
			x: new Channel(data[0]),
			y: new Channel(data[1]),
			z: new Channel(data[2]),
			w: new Channel(data[3]),
		};
	}
}

export class channelValueFloat extends NamedFunction2<[Channel, number]> {
	static override type() {
		return 'channelValueFloat';
	}
	func(channel: Channel, t: number): number {
		return channel.value(t);
	}
}
export class channelValueVector2 extends NamedFunction3<[Channel2, number, Vector2]> {
	static override type() {
		return 'channelValueVector2';
	}
	func(channel: Channel2, t: number, target: Vector2): Vector2 {
		target.x = channel.x.value(t);
		target.y = channel.y.value(t);
		return target;
	}
}

export class channelValueVector3 extends NamedFunction3<[Channel3, number, Vector3]> {
	static override type() {
		return 'channelValueVector3';
	}
	func(channel: Channel3, t: number, target: Vector3): Vector3 {
		target.x = channel.x.value(t);
		target.y = channel.y.value(t);
		target.z = channel.z.value(t);
		return target;
	}
}

export class channelValueVector4 extends NamedFunction3<[Channel4, number, Vector4]> {
	static override type() {
		return 'channelValueVector4';
	}
	func(channel: Channel4, t: number, target: Vector4): Vector4 {
		target.x = channel.x.value(t);
		target.y = channel.y.value(t);
		target.z = channel.z.value(t);
		target.w = channel.w.value(t);
		return target;
	}
}
