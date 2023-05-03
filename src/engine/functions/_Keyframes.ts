import {NamedFunction1, NamedFunction2} from './_Base';
import {ChannelData} from '../../core/keyframes/KeyframeCommon';
import {Channel} from '../../core/keyframes/Channel';

export class channel extends NamedFunction1<[ChannelData]> {
	static override type() {
		return 'channel';
	}
	func(data: ChannelData): Channel {
		return new Channel(data);
	}
}

export class channelValue extends NamedFunction2<[Channel, number]> {
	static override type() {
		return 'channelValue';
	}
	func(channel: Channel, t: number): number {
		return channel.value(t);
	}
}
