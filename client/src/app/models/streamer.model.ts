export interface Streamer {
  id: number;
  name: string;
  platform: string;
  history: SubscriberHistory[];
  created_at?: string;
}

export interface SubscriberHistory {
  id?: number;
  count: number;
  timestamp: number;
  created_at?: string;
}

export interface CreateStreamerDto {
  name: string;
  platform: string;
  initialCount: number;
}

export interface UpdateStreamerDto {
  name: string;
  platform: string;
}

export interface AddSubscriberDto {
  count: number;
  timestamp: number;
}

export interface GlobalStats {
  totalSubs: number;
  totalStreamers: number;
  avgSubs: number;
  topStreamer: string;
}
