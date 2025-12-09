import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreamerService } from '../../services/streamer.service';
import { Streamer } from '../../models/streamer.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  streamers: Streamer[] = [];
  loading = false;
  
  globalStats = {
    totalSubs: 0,
    totalStreamers: 0,
    avgSubs: 0,
    topStreamer: '-'
  };

  private destroy$ = new Subject<void>();

  constructor(private streamerService: StreamerService) {}

  ngOnInit(): void {
    // Subscribe to streamers
    this.streamerService.streamers$
      .pipe(takeUntil(this.destroy$))
      .subscribe(streamers => {
        this.streamers = streamers;
        this.calculateStats();
      });

    // Subscribe to loading state
    this.streamerService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    // Initial load
    this.streamerService.loadStreamers().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  calculateStats(): void {
    const totalSubs = this.streamers.reduce((sum, s) => {
      const latest = s.history[s.history.length - 1];
      return sum + (latest?.count || 0);
    }, 0);

    const topStreamer = this.streamers.reduce((top, s) => {
      if (!top) return s;
      const latestCount = s.history[s.history.length - 1]?.count || 0;
      const topCount = top.history[top.history.length - 1]?.count || 0;
      return latestCount > topCount ? s : top;
    }, this.streamers[0]);

    this.globalStats = {
      totalSubs,
      totalStreamers: this.streamers.length,
      avgSubs: this.streamers.length > 0 ? Math.round(totalSubs / this.streamers.length) : 0,
      topStreamer: topStreamer?.name || '-'
    };
  }

  switchToStreamers(): void {
    // Navigation handled by router
  }
}
