import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreamerService } from '../../services/streamer.service';
import { Streamer } from '../../models/streamer.model';
import { Subject, takeUntil } from 'rxjs';
import { ChartComponent } from '../shared/chart.component';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  streamers: Streamer[] = [];
  streamersWith3Plus: Streamer[] = [];
  loading = false;
  
  globalStats = {
    totalSubs: 0,
    totalStreamers: 0,
    avgSubs: 0,
    topStreamer: '-',
    totalEarnings: 0
  };

  // Chart Data
  distributionData: ChartConfiguration['data'] = { datasets: [] };
  comparisonData: ChartConfiguration['data'] = { datasets: [] };
  streamerCharts: { [key: number]: ChartConfiguration['data'] } = {};
  
  // Chart Options
  doughnutOptions: ChartConfiguration['options'] = {
    plugins: { legend: { position: 'bottom' } }
  };
  
  barOptions: ChartConfiguration['options'] = {
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  };

  lineOptions: ChartConfiguration['options'] = {
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: false } },
    elements: { line: { tension: 0.4 } }
  };

  private destroy$ = new Subject<void>();

  constructor(private streamerService: StreamerService) {}

  ngOnInit(): void {
    this.streamerService.streamers$
      .pipe(takeUntil(this.destroy$))
      .subscribe(streamers => {
        this.streamers = streamers;
        this.calculateStats();
        this.prepareCharts();
      });

    this.streamerService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    this.streamerService.loadStreamers().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  calculateStats(): void {
    const totalSubs = this.streamers.reduce((sum, s) => {
      if (!s.history || s.history.length === 0) return sum;
      const latest = s.history[s.history.length - 1];
      return sum + (latest?.count || 0);
    }, 0);

    const topStreamer = this.streamers.reduce((top, s) => {
      if (!top) return s;
      const latestCount = s.history && s.history.length > 0 ? s.history[s.history.length - 1].count : 0;
      const topCount = top.history && top.history.length > 0 ? top.history[top.history.length - 1].count : 0;
      return latestCount > topCount ? s : top;
    }, this.streamers[0]);

    const totalEarnings = Math.floor(totalSubs / 19500) * 30;

    this.globalStats = {
      totalSubs,
      totalStreamers: this.streamers.length,
      avgSubs: this.streamers.length > 0 ? Math.round(totalSubs / this.streamers.length) : 0,
      topStreamer: topStreamer?.name || '-',
      totalEarnings
    };
  }

  prepareCharts(): void {
    if (this.streamers.length === 0) {
      this.streamersWith3Plus = [];
      this.streamerCharts = {};
      return;
    }

    // Filter streamers that have 3 or more history updates
    this.streamersWith3Plus = this.streamers.filter(s => (s.history?.length || 0) >= 3);

    // Reset per-streamer chart map to avoid stale entries
    this.streamerCharts = {};

    // 1. Distribution Chart (Doughnut)
    const platformCounts: { [key: string]: number } = {};
    this.streamers.forEach(s => {
      platformCounts[s.platform] = (platformCounts[s.platform] || 0) + 1;
    });

    this.distributionData = {
      labels: Object.keys(platformCounts),
      datasets: [{
        data: Object.values(platformCounts),
        backgroundColor: ['#FF6B9D', '#C44DFF', '#00B4FF', '#00D9A3', '#FFA800', '#FFD93D', '#FF6B6B']
      }]
    };

    // 2. Comparison Chart (Bar)
    const sortedStreamers = [...this.streamers].sort((a, b) => {
      const countA = a.history && a.history.length > 0 ? a.history[a.history.length - 1].count : 0;
      const countB = b.history && b.history.length > 0 ? b.history[b.history.length - 1].count : 0;
      return countB - countA;
    }).slice(0, 5);

    this.comparisonData = {
      labels: sortedStreamers.map(s => s.name),
      datasets: [{
        label: 'Subscribers',
        data: sortedStreamers.map(s => s.history && s.history.length > 0 ? s.history[s.history.length - 1].count : 0),
        backgroundColor: sortedStreamers.map((_, i) => [
          '#FF6B9D', '#C44DFF', '#00B4FF', '#00D9A3', '#FFA800'
        ][i % 5])
      }]
    };

    // 3. Individual Streamer Charts (Line)
    this.streamersWith3Plus.forEach(streamer => {
      const history = streamer.history ? streamer.history.slice(-10) : []; // Last 10 updates
      if (history.length < 3) {
        return;
      }
      this.streamerCharts[streamer.id] = {
        labels: history.map(h => new Date(h.timestamp).toLocaleDateString()),
        datasets: [{
          label: 'Subscribers',
          data: history.map(h => h.count),
          borderColor: '#C44DFF',
          backgroundColor: 'rgba(196, 77, 255, 0.1)',
          fill: true,
          pointBackgroundColor: '#FF6B9D',
          pointRadius: 4
        }]
      };
    });
  }

  switchToStreamers(): void {
    // Navigation handled by router
  }
}
