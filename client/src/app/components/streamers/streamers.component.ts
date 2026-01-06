import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StreamerService } from '../../services/streamer.service';
import { ModalService } from '../../services/modal.service';
import { Streamer } from '../../models/streamer.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-streamers',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './streamers.component.html',
    styleUrls: ['./streamers.component.scss'],
})
export class StreamersComponent implements OnInit, OnDestroy {
    streamers: Streamer[] = [];
    filteredStreamers: Streamer[] = [];
    loading = false;

    // Filters
    searchTerm = '';
    selectedPlatforms = new Set<string>();
    platforms: string[] = [];
    minSubs = 0;
    maxSubs = 0;
    maxSubsFilter = 0;

    // Sorting
    sortBy: 'lastUpdate' | 'name' | 'followers' | 'platform' = 'lastUpdate';
    sortDir: 'asc' | 'desc' = 'desc';

    private destroy$ = new Subject<void>();

    constructor(private streamerService: StreamerService, private modalService: ModalService) {}

    ngOnInit(): void {
        this.streamerService.streamers$.pipe(takeUntil(this.destroy$)).subscribe((streamers) => {
            this.streamers = streamers;
            this.platforms = this.computePlatforms(streamers);
            this.maxSubs = this.computeMaxSubs(streamers);
            // Initialize or clamp the max filter to the available range
            if (this.maxSubsFilter === 0 || this.maxSubsFilter > this.maxSubs) {
                this.maxSubsFilter = this.maxSubs;
            }
            if (this.minSubs > this.maxSubsFilter) {
                this.minSubs = this.maxSubsFilter;
            }
            this.applyFilters();
        });

        this.streamerService.loading$
            .pipe(takeUntil(this.destroy$))
            .subscribe((loading) => (this.loading = loading));

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

    getGrowthEarnings(streamer: Streamer): number {
        const growth = this.getGrowth(streamer);
        const blocks = Math.floor(growth / 19500);
        return blocks * 30;
    }

    getTotalUpdates(streamer: Streamer): number {
        return streamer.history?.length || 0;
    }

    getLastUpdateTimestamp(streamer: Streamer): number {
        if (!streamer.history || streamer.history.length === 0) return 0;
        return streamer.history[streamer.history.length - 1]?.timestamp || 0;
    }

    getEarnings(streamer: Streamer): number {
        const latest = this.getLatestCount(streamer);
        const blocks = Math.floor(latest / 19500);
        return blocks * 30;
    }

    differenceLatestHistory(streamer: Streamer): number {
        if (!streamer.history || streamer.history.length < 2) return 0;
        const latest = streamer.history[streamer.history.length - 1]?.count || 0;
        const earliest = streamer.history[0]?.count || 0;
        return latest - earliest;
    }

    getEarningsTracked(streamer: Streamer): number {
        const diff = this.differenceLatestHistory(streamer);
        const blocks = Math.floor(diff / 19500) * 30;
        return blocks;
    }

    onDelete(id: string, name: string): void {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            this.streamerService.deleteStreamer(id).subscribe({
                next: () => console.log('Deleted successfully'),
                error: (err) => console.error('Delete error:', err),
            });
        }
    }

    onEdit(streamer: Streamer): void {
        this.modalService.open('edit', streamer);
    }

    onUpdate(streamer: Streamer): void {
        if (!this.canUpdate(streamer)) {
            alert('You can only update followers once per day for this streamer.');
            return;
        }
        this.modalService.open('update', streamer);
    }

    onAdd(): void {
        this.modalService.open('add');
    }

    // ---- Filtering helpers ----
    onSearchChange(term: string): void {
        this.searchTerm = term;
        this.applyFilters();
    }

    togglePlatform(p: string): void {
        if (this.selectedPlatforms.has(p)) {
            this.selectedPlatforms.delete(p);
        } else {
            this.selectedPlatforms.add(p);
        }
        this.applyFilters();
    }

    clearPlatforms(): void {
        this.selectedPlatforms.clear();
        this.applyFilters();
    }

    onMinSubsChange(val: number | string): void {
        const n = typeof val === 'string' ? parseInt(val, 10) : val;
        this.minSubs = isNaN(Number(n)) ? 0 : Number(n);
        if (this.minSubs > this.maxSubsFilter) {
            this.maxSubsFilter = this.minSubs;
        }
        this.applyFilters();
    }

    onMaxSubsChange(val: number | string): void {
        const n = typeof val === 'string' ? parseInt(val, 10) : val;
        this.maxSubsFilter = isNaN(Number(n)) ? this.maxSubs : Math.min(Number(n), this.maxSubs);
        if (this.maxSubsFilter < this.minSubs) {
            this.minSubs = this.maxSubsFilter;
        }
        this.applyFilters();
    }

    onSortByChange(val: 'lastUpdate' | 'name' | 'followers' | 'platform'): void {
        this.sortBy = val;
        this.applySorting();
    }

    toggleSortDir(): void {
        this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
        this.applySorting();
    }

    private computePlatforms(list: Streamer[]): string[] {
        const set = new Set<string>();
        list.forEach((s) => s.platform && set.add(s.platform));
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }

    private computeMaxSubs(list: Streamer[]): number {
        return list.reduce((max, s) => Math.max(max, this.getLatestCount(s)), 0);
    }

    private matchesSearch(s: Streamer): boolean {
        if (!this.searchTerm) return true;
        const term = this.searchTerm.trim().toLowerCase();
        return (
            s.name.toLowerCase().includes(term) || (s.platform || '').toLowerCase().includes(term)
        );
    }

    private matchesPlatform(s: Streamer): boolean {
        if (this.selectedPlatforms.size === 0) return true;
        return this.selectedPlatforms.has(s.platform);
    }

    private matchesMinSubs(s: Streamer): boolean {
        return this.getLatestCount(s) >= this.minSubs;
    }

    private matchesMaxSubs(s: Streamer): boolean {
        return this.getLatestCount(s) <= this.maxSubsFilter;
    }

    canUpdate(streamer: Streamer): boolean {
        const lastTs = this.getLastUpdateTimestamp(streamer);
        if (!lastTs) return true;
        const last = new Date(lastTs);
        const now = new Date();
        return !(
            last.getFullYear() === now.getFullYear() &&
            last.getMonth() === now.getMonth() &&
            last.getDate() === now.getDate()
        );
    }

    isToday(ts: number): boolean {
        if (!ts) return false;
        const d = new Date(ts);
        const now = new Date();
        return (
            d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth() &&
            d.getDate() === now.getDate()
        );
    }

    getLastUpdateLabel(streamer: Streamer): string {
        const ts = this.getLastUpdateTimestamp(streamer);
        if (!ts) return '—';
        if (this.isToday(ts)) return 'Today';
        const d = new Date(ts);
        try {
            return (
                d.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit',
                }) +
                ' ' +
                d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
            );
        } catch {
            return d.toLocaleString();
        }
    }

    private compare(a: Streamer, b: Streamer): number {
        let av: string | number = 0;
        let bv: string | number = 0;
        switch (this.sortBy) {
            case 'lastUpdate':
                av = this.getLastUpdateTimestamp(a);
                bv = this.getLastUpdateTimestamp(b);
                break;
            case 'name':
                av = a.name.toLowerCase();
                bv = b.name.toLowerCase();
                break;
            case 'followers':
                av = this.getLatestCount(a);
                bv = this.getLatestCount(b);
                break;
            case 'platform':
                av = (a.platform || '').toLowerCase();
                bv = (b.platform || '').toLowerCase();
                break;
        }
        const res =
            typeof av === 'number' && typeof bv === 'number'
                ? av - bv
                : String(av).localeCompare(String(bv));
        return this.sortDir === 'asc' ? res : -res;
    }

    applySorting(): void {
        this.filteredStreamers = [...this.filteredStreamers].sort((a, b) => this.compare(a, b));
    }

    applyFilters(): void {
        this.filteredStreamers = (this.streamers || []).filter(
            (s) =>
                this.matchesSearch(s) &&
                this.matchesPlatform(s) &&
                this.matchesMinSubs(s) &&
                this.matchesMaxSubs(s)
        );
        this.applySorting();
    }
}
