export interface Stream {
  id: string;
  title: string;
  streamerId: string;
  streamerName: string;
  status: 'live' | 'offline' | 'scheduled';
  type: 'live' | 'video';
  videoUrl?: string;
  createdAt: any;
  viewerCount: number;
  inviteCode: string;
}

export interface Message {
  id: string;
  streamId: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: any;
}

export interface Destination {
  id: string;
  userId: string;
  platform: 'youtube' | 'facebook' | 'custom';
  name: string;
  rtmpUrl: string;
  streamKey: string;
  enabled: boolean;
}
