import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StreamerService } from '../../services/streamer.service';
import { ModalService } from '../../services/modal.service';
import { Streamer } from '../../models/streamer.model';

@Component({
  selector: 'app-update-subscriber-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal active" *ngIf="streamer">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">📈 Update Subscribers</h2>
          <button class="modal-close" (click)="close()">×</button>
        </div>
        <div class="modal-body">
          <p><strong>Streamer:</strong> {{ streamer.name }}</p>
          <p><strong>Current Subscribers:</strong> {{ currentSubs | number }}</p>
          <form (ngSubmit)="onSubmit()">
            <div class="form-group mt-md">
              <label class="form-label" for="new-subs">New Subscriber Count</label>
              <input type="number" id="new-subs" [(ngModel)]="count" name="count" class="form-input" placeholder="Enter new count..." min="0" required>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="close()">Cancel</button>
              <button type="submit" class="btn btn-success">💾 Save Update</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class UpdateSubscriberModalComponent implements OnInit {
  streamer: Streamer | null = null;
  count: number | null = null;

  constructor(
    private streamerService: StreamerService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.modalService.selectedStreamer$.subscribe(streamer => {
      this.streamer = streamer;
    });
  }

  get currentSubs(): number {
    if (!this.streamer || !this.streamer.history.length) return 0;
    return this.streamer.history[this.streamer.history.length - 1].count;
  }

  private alreadyUpdatedToday(): boolean {
    if (!this.streamer || !this.streamer.history || this.streamer.history.length === 0) return false;
    const lastTs = this.streamer.history[this.streamer.history.length - 1].timestamp;
    if (!lastTs) return false;
    const nowMs = Date.now();
    const twelveHoursMs = 12 * 60 * 60 * 1000;
    return nowMs - lastTs < twelveHoursMs;
  }

  close(): void {
    this.modalService.close();
  }

  onSubmit(): void {
    if (this.alreadyUpdatedToday()) {
      alert('You can only update subscribers once every 12 hours for this streamer.');
      return;
    }
    if (this.streamer && this.count !== null) {
      this.streamerService.addSubscriberCount(this.streamer.id, {
        count: this.count,
        timestamp: Date.now()
      }).subscribe(() => {
        this.close();
      });
    }
  }
}
