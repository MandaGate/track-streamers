import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Streamer, CreateStreamerDto, UpdateStreamerDto, AddSubscriberDto } from '../models/streamer.model';

@Injectable({
  providedIn: 'root'
})
export class StreamerService {
  private apiUrl = environment.apiUrl;
  private streamersSubject = new BehaviorSubject<Streamer[]>([]);
  public streamers$ = this.streamersSubject.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Load all streamers from the API
   */
  loadStreamers(): Observable<Streamer[]> {
    this.loadingSubject.next(true);
    return this.http.get<Streamer[]>(`${this.apiUrl}/streamers`).pipe(
      tap(streamers => {
        this.streamersSubject.next(streamers);
        this.loadingSubject.next(false);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get current streamers value
   */
  getStreamers(): Streamer[] {
    return this.streamersSubject.value;
  }

  /**
   * Create a new streamer
   */
  createStreamer(data: CreateStreamerDto): Observable<Streamer> {
    this.loadingSubject.next(true);
    return this.http.post<Streamer>(`${this.apiUrl}/streamers`, data).pipe(
      tap(newStreamer => {
        const current = this.streamersSubject.value;
        this.streamersSubject.next([...current, newStreamer]);
        this.loadingSubject.next(false);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing streamer
   */
  updateStreamer(id: string, data: UpdateStreamerDto): Observable<Streamer> {
    this.loadingSubject.next(true);
    return this.http.put<Streamer>(`${this.apiUrl}/streamers/${id}`, data).pipe(
      tap(updatedStreamer => {
        const current = this.streamersSubject.value;
        const index = current.findIndex(s => s.id === id);
        if (index !== -1) {
          current[index] = updatedStreamer;
          this.streamersSubject.next([...current]);
        }
        this.loadingSubject.next(false);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete a streamer
   */
  deleteStreamer(id: string): Observable<void> {
    this.loadingSubject.next(true);
    return this.http.delete<void>(`${this.apiUrl}/streamers/${id}`).pipe(
      tap(() => {
        const current = this.streamersSubject.value;
        this.streamersSubject.next(current.filter(s => s.id !== id));
        this.loadingSubject.next(false);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Add subscriber count to a streamer
   */
  addSubscriberCount(id: string, data: AddSubscriberDto): Observable<any> {
    this.loadingSubject.next(true);
    return this.http.post(`${this.apiUrl}/streamers/${id}/subscribers`, data).pipe(
      tap(() => {
        // Reload streamers to get updated history
        this.loadStreamers().subscribe();
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Load single streamer by id and merge into cache
   */
  loadStreamerById(id: string): Observable<Streamer> {
    this.loadingSubject.next(true);
    return this.http.get<Streamer>(`${this.apiUrl}/streamers/${id}`).pipe(
      tap((s) => {
        const current = this.streamersSubject.value;
        const idx = current.findIndex(cs => cs.id === s.id);
        if (idx >= 0) {
          current[idx] = s;
          this.streamersSubject.next([...current]);
        } else {
          this.streamersSubject.next([...current, s]);
        }
        this.loadingSubject.next(false);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Calculate global statistics
   */
  calculateGlobalStats(): Observable<any> {
    return this.streamers$.pipe(
      map(streamers => {
        const totalSubs = streamers.reduce((sum, s) => {
          const latest = s.history[s.history.length - 1];
          return sum + (latest?.count || 0);
        }, 0);

        const topStreamer = streamers.reduce((top, s) => {
          const latestCount = s.history[s.history.length - 1]?.count || 0;
          const topCount = top.history[top.history.length - 1]?.count || 0;
          return latestCount > topCount ? s : top;
        }, streamers[0] || { name: '-', history: [] });

        return {
          totalSubs,
          totalStreamers: streamers.length,
          avgSubs: streamers.length > 0 ? Math.round(totalSubs / streamers.length) : 0,
          topStreamer: topStreamer?.name || '-'
        };
      })
    );
  }

  /**
   * Error handler
   */
  private handleError(error: HttpErrorResponse) {
    this.loadingSubject.next(false);
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
