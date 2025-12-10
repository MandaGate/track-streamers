import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Streamer } from '../models/streamer.model';

export type ModalType = 'add' | 'edit' | 'update' | null;

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private activeModalSubject = new BehaviorSubject<ModalType>(null);
  public activeModal$ = this.activeModalSubject.asObservable();

  private selectedStreamerSubject = new BehaviorSubject<Streamer | null>(null);
  public selectedStreamer$ = this.selectedStreamerSubject.asObservable();

  open(type: ModalType, streamer: Streamer | null = null): void {
    this.selectedStreamerSubject.next(streamer);
    this.activeModalSubject.next(type);
  }

  close(): void {
    this.activeModalSubject.next(null);
    this.selectedStreamerSubject.next(null);
  }
}
