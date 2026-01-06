import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StreamerService } from '../../services/streamer.service';
import { Streamer } from '../../models/streamer.model';
import { Subject, takeUntil } from 'rxjs';
import { ChartComponent } from '../shared/chart.component';

@Component({
  selector: 'app-streamer-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ChartComponent],
  templateUrl: './streamer-detail.component.html',
  styleUrls: ['./streamer-detail.component.scss'],
})
export class StreamerDetailComponent implements OnInit, OnDestroy {
  streamer?: Streamer;
  loading = false;
  private destroy$ = new Subject<void>();

  // Chart data
  weeklyGrowthLabels: string[] = [];
  weeklyGrowthData: number[] = [];

  constructor(private route: ActivatedRoute, private streamerService: StreamerService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';

    this.streamerService.loading$.pipe(takeUntil(this.destroy$)).subscribe((l) => (this.loading = l));

    this.streamerService.streamers$.pipe(takeUntil(this.destroy$)).subscribe((list) => {
      this.streamer = list.find((s) => s.id === id);
      if (!this.streamer && id) {
        // Fetch just this streamer if missing
        this.streamerService.loadStreamerById(id).subscribe();
      } else if (this.streamer) {
        this.prepareWeeklyStats();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ---- Helpers ----
  getLatestCount(): number {
    if (!this.streamer?.history || this.streamer.history.length === 0) return 0;
    return this.streamer.history[this.streamer.history.length - 1]?.count || 0;
  }

  getLastUpdateTimestamp(): number {
    if (!this.streamer?.history || this.streamer.history.length === 0) return 0;
    return this.streamer.history[this.streamer.history.length - 1]?.timestamp || 0;
  }

  getWeeklyGrowth(): number {
    // Growth over last 7 days (rolling window)
    if (!this.streamer?.history || this.streamer.history.length === 0) return 0;
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const latest = this.getLatestCount();
    // Find the latest history at or before weekAgo
    let baseline = this.streamer.history[0]?.count || 0;
    for (let i = this.streamer.history.length - 1; i >= 0; i--) {
      const h = this.streamer.history[i];
      if (h.timestamp <= weekAgo) {
        baseline = h.count;
        break;
      }
    }
    return latest - baseline;
  }

  getWeeklyEarnings(): number {
    const growth = this.getWeeklyGrowth();
    const blocks = Math.floor(growth / 19500);
    return blocks * 30;
  }

  getTargetProgressPercent(): number {
    const growth = this.getWeeklyGrowth();
    const pct = Math.max(0, Math.min(100, (growth / 19500) * 100));
    return Math.round(pct);
  }

  getTrackedSubs(): number {
    if (!this.streamer?.history || this.streamer.history.length < 2) return 0;
    const earliest = this.streamer.history[0]?.count || 0;
    return this.getLatestCount() - earliest;
  }

  getTrackedEarnings(): number {
    const diff = this.getTrackedSubs();
    const blocks = Math.floor(diff / 19500);
    return blocks * 30;
  }

  estimateMonthlyEarnings(): number {
    // Estimate from last 4 weeks average (fallback to weekly*4)
    if (!this.streamer?.history || this.streamer.history.length === 0) return 0;
    const now = Date.now();
    const weeks: { start: number; end: number; growth: number }[] = [];
    for (let w = 0; w < 4; w++) {
      const end = now - w * 7 * 24 * 60 * 60 * 1000;
      const start = end - 7 * 24 * 60 * 60 * 1000;
      const endCount = this.countAtOrBefore(end);
      const startCount = this.countAtOrBefore(start);
      weeks.push({ start, end, growth: endCount - startCount });
    }
    const avgGrowth = weeks.reduce((s, w) => s + w.growth, 0) / weeks.length;
    const weeklyBlocks = Math.floor(avgGrowth / 19500);
    return weeklyBlocks * 30 * 4; // simple month = 4 weeks
  }

  private countAtOrBefore(ts: number): number {
    if (!this.streamer?.history || this.streamer.history.length === 0) return 0;
    let count = this.streamer.history[0]?.count || 0;
    for (let i = 0; i < this.streamer.history.length; i++) {
      const h = this.streamer.history[i];
      if (h.timestamp <= ts) {
        count = h.count;
      } else {
        break;
      }
    }
    return count;
  }

  private prepareWeeklyStats(): void {
    if (!this.streamer?.history || this.streamer.history.length === 0) {
      this.weeklyGrowthLabels = [];
      this.weeklyGrowthData = [];
      return;
    }
    // Build last 8 weeks buckets
    const now = Date.now();
    const buckets: { label: string; growth: number }[] = [];
    for (let w = 0; w < 8; w++) {
      const end = now - w * 7 * 24 * 60 * 60 * 1000;
      const start = end - 7 * 24 * 60 * 60 * 1000;
      const endCount = this.countAtOrBefore(end);
      const startCount = this.countAtOrBefore(start);
      const growth = endCount - startCount;
      const label = new Date(start).toLocaleDateString(undefined, { month: 'short', day: '2-digit' }) +
        ' - ' + new Date(end).toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
      buckets.unshift({ label, growth });
    }
    this.weeklyGrowthLabels = buckets.map((b) => b.label);
    this.weeklyGrowthData = buckets.map((b) => b.growth);
  }

  get chartData() {
    return {
      labels: this.weeklyGrowthLabels,
      datasets: [
        {
          label: 'Weekly Growth',
          data: this.weeklyGrowthData,
          borderColor: '#4C9EEB',
          backgroundColor: 'rgba(76, 158, 235, 0.2)',
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }

  get chartOptions() {
    return {
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };
  }
}
