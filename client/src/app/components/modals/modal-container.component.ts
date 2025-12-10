import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../services/modal.service';
import { AddStreamerModalComponent } from './add-streamer-modal.component';
import { EditStreamerModalComponent } from './edit-streamer-modal.component';
import { UpdateSubscriberModalComponent } from './update-subscriber-modal.component';

@Component({
  selector: 'app-modal-container',
  standalone: true,
  imports: [
    CommonModule, 
    AddStreamerModalComponent, 
    EditStreamerModalComponent, 
    UpdateSubscriberModalComponent
  ],
  template: `
    <ng-container *ngIf="activeModal$ | async as activeModal">
      <app-add-streamer-modal *ngIf="activeModal === 'add'"></app-add-streamer-modal>
      <app-edit-streamer-modal *ngIf="activeModal === 'edit'"></app-edit-streamer-modal>
      <app-update-subscriber-modal *ngIf="activeModal === 'update'"></app-update-subscriber-modal>
    </ng-container>
  `
})
export class ModalContainerComponent {
  activeModal$ = this.modalService.activeModal$;

  constructor(private modalService: ModalService) {}
}
