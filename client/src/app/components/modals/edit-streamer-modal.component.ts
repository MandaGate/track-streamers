import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StreamerService } from '../../services/streamer.service';
import { ModalService } from '../../services/modal.service';
import { Streamer, UpdateStreamerDto } from '../../models/streamer.model';

@Component({
  selector: 'app-edit-streamer-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal active" *ngIf="streamer">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">✏️ Edit Streamer</h2>
          <button class="modal-close" (click)="close()">×</button>
        </div>
        <div class="modal-body">
          <form (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label class="form-label" for="edit-streamer-name">Streamer Name</label>
              <input type="text" id="edit-streamer-name" [(ngModel)]="formData.name" name="name" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="edit-streamer-platform">Platform</label>
              <select id="edit-streamer-platform" [(ngModel)]="formData.platform" name="platform" class="form-select" required>
                <option value="YouTube">YouTube</option>
                <option value="Twitch">Twitch</option>
                <option value="TikTok">TikTok</option>
                <option value="Instagram">Instagram</option>
                <option value="Twitter">Twitter</option>
                <option value="Facebook">Facebook</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="close()">Cancel</button>
              <button type="submit" class="btn btn-primary">💾 Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class EditStreamerModalComponent implements OnInit {
  streamer: Streamer | null = null;
  formData: UpdateStreamerDto = {
    name: '',
    platform: ''
  };

  constructor(
    private streamerService: StreamerService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.modalService.selectedStreamer$.subscribe(streamer => {
      this.streamer = streamer;
      if (streamer) {
        this.formData = {
          name: streamer.name,
          platform: streamer.platform
        };
      }
    });
  }

  close(): void {
    this.modalService.close();
  }

  onSubmit(): void {
    if (this.streamer && this.formData.name && this.formData.platform) {
      this.streamerService.updateStreamer(this.streamer.id, this.formData).subscribe(() => {
        this.close();
      });
    }
  }
}
