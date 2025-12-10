import { Component, Input, OnChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-wrapper">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    .chart-wrapper {
      position: relative;
      height: 100%;
      width: 100%;
      min-height: 300px;
    }
  `]
})
export class ChartComponent implements AfterViewInit, OnChanges {
  @Input() type: ChartConfiguration['type'] = 'line';
  @Input() data: ChartConfiguration['data'] = { datasets: [] };
  @Input() options: ChartConfiguration['options'] = {};

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(): void {
    if (this.chart) {
      this.chart.data = this.data;
      this.chart.options = this.options || {};
      this.chart.update();
    }
  }

  private createChart(): void {
    if (!this.chartCanvas) return;

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: this.type,
      data: this.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        ...this.options
      }
    });
  }
}
