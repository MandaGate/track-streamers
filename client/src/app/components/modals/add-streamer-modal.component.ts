import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StreamerService } from '../../services/streamer.service';
import { ModalService } from '../../services/modal.service';
import { CreateStreamerDto } from '../../models/streamer.model';

@Component({
  selector: 'app-add-streamer-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal active">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">➕ Add New Streamer</h2>
          <button class="modal-close" (click)="close()">×</button>
        </div>
        <div class="modal-body">
          <form (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label class="form-label" for="streamer-name">Streamer Name</label>
              <input type="text" id="streamer-name" [(ngModel)]="formData.name" name="name" class="form-input" placeholder="Enter streamer name..." required>
            </div>
            <div class="form-group">
              <label class="form-label" for="streamer-platform">Platform</label>
              <select id="streamer-platform" [(ngModel)]="formData.platform" name="platform" class="form-select" required>
                <option value="">Select a platform...</option>
                <option value="YouTube">YouTube</option>
                <option value="Twitch">Twitch</option>
                <option value="TikTok">TikTok</option>
                <option value="Instagram">Instagram</option>
                <option value="Twitter">Twitter</option>
                <option value="Facebook">Facebook</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="initial-subs">Initial Subscriber Count</label>
              <input type="number" id="initial-subs" [(ngModel)]="formData.initialCount" name="initialCount" class="form-input" placeholder="0" min="0" required>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="close()">Cancel</button>
              <button type="submit" class="btn btn-primary">🎉 Add Streamer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AddStreamerModalComponent {
  formData: CreateStreamerDto = {
    name: '',
    platform: '',
    initialCount: 0
  };

  constructor(
    private streamerService: StreamerService,
    private modalService: ModalService
  ) {}

  close(): void {
    this.modalService.close();
  }

  onSubmit(): void {
    if (this.formData.name && this.formData.platform) {
      this.streamerService.createStreamer(this.formData).subscribe(() => {
        this.close();
      });
    }
  }
}
