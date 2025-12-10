import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StreamerService } from '../../services/streamer.service';
import { ModalService } from '../../services/modal.service';
import { Streamer } from '../../models/streamer.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-streamers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './streamers.component.html',
  styleUrls: ['./streamers.component.scss']
})
export class StreamersComponent implements OnInit, OnDestroy {
  streamers: Streamer[] = [];
  loading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private streamerService: StreamerService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.streamerService.streamers$
      .pipe(takeUntil(this.destroy$))
      .subscribe(streamers => this.streamers = streamers);

    this.streamerService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    this.streamerService.loadStreamers().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getLatestCount(streamer: Streamer): number {
    if (!streamer.history || streamer.history.length === 0) return 0;
    return streamer.history[streamer.history.length - 1]?.count || 0;
  }

  getGrowth(streamer: Streamer): number {
    if (!streamer.history || streamer.history.length < 2) return 0;
    const latest = streamer.history[streamer.history.length - 1]?.count || 0;
    const previous = streamer.history[streamer.history.length - 2]?.count || 0;
    return latest - previous;
  }

  getTotalUpdates(streamer: Streamer): number {
    return streamer.history?.length || 0;
  }

  onDelete(id: number, name: string): void {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      this.streamerService.deleteStreamer(id).subscribe({
        next: () => console.log('Deleted successfully'),
        error: (err) => console.error('Delete error:', err)
      });
    }
  }

  onEdit(streamer: Streamer): void {
    this.modalService.open('edit', streamer);
  }

  onUpdate(streamer: Streamer): void {
    this.modalService.open('update', streamer);
  }

  onAdd(): void {
    this.modalService.open('add');
  }
}
