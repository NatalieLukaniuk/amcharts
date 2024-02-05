import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractDataVizChartV5Instance } from 'src/app/abstract-data-viz-chart-v5-instance';
import { AmCharts5Service } from 'src/app/am-charts-v5.service';
import { DataVizChartSalesReachMobileInstance } from 'src/app/data-viz-sales-reach-instance';
import { countryList } from 'src/app/utils';

export interface ChartDataItem {
  category: string;
  actual: number;
  forecast: number;
  salesReach: number;
  tooltip?: string;
}

@Component({
  selector: 'app-sales-reach-tooltip-defect',
  templateUrl: './sales-reach-tooltip-defect.component.html',
  styleUrls: ['./sales-reach-tooltip-defect.component.scss']
})
export class SalesReachTooltipDefectComponent implements OnInit {

  chartInstance!: AbstractDataVizChartV5Instance<any>;
  chartId = 'test-chart';

  data: ChartDataItem[] = [];

  constructor(private amChartsService: AmCharts5Service) {

  }

  ngOnDestroy(): void {
    this.chartInstance?.dispose();
  }


  @ViewChild('scrollingElement') scrollingElement: any;
  @ViewChild('scrollcontainer') scrollcontainer: any;

  ngOnInit() {

    const sorted = countryList.sort((a, b) => a.localeCompare(b));
    this.data = sorted.map(countryName => this.generateDataPerCountry(countryName));

    this.amChartsService.modulesV5.subscribe(modulesV5 => {
      const chartConfig = {
        actualSeriesName: 'Order Bank + Retail',
        forecastSeriesName: 'Retail Forecast',
        salesReachSeriesName: 'Sales Reach',
        actualsColor: '#79B6D8',
        forecastColor: '#6F94D6',
        salesReachColor: '#000',
        tooltipTextColor: '#fff',
        topValueAxisTitle: 'Retail FC /\nOrder Bank +\nRetail Actuals',
        salesReachAxisTitle: 'Sales\nReach',
        isRotateLabels: true,
        visibleAreaWidth: this.scrollcontainer?.nativeElement.clientWidth,
        categoryAxisWidthHorizontalBars: 140
      };
      this.chartInstance = new DataVizChartSalesReachMobileInstance(
        modulesV5,
        this.data,
        this.chartId,
        chartConfig
      );
    })

  }

  generateDataPerCountry(countryName: string): ChartDataItem {
    return {
      category: countryName,
      actual: this.getRandomNumber(),
      forecast: this.getRandomNumber(),
      salesReach: Math.random()
    }
  }

  getRandomNumber() {
    return Math.round(Math.random() * 1000000)
  }

  ngAfterViewInit(): void {
    if (this.scrollingElement) {
      this.scrollingElement.nativeElement.addEventListener('touchstart', this.onTouchStart);
    }
  }

  onTouchStart = () => {
    if (
      this.scrollingElement.nativeElement.clientWidth > this.scrollcontainer.nativeElement.clientWidth &&
      !!this.chartInstance
    ) {
      this.scrollingElement.nativeElement.addEventListener('touchend', this.endTouch);
      this.scrollingElement.nativeElement.addEventListener('touchmove', this.moveTouch);
    }
  };

  endTouch = () => {
    // updatePosition method is aimed on updating the position of all elements that
    // should preserve fixed position after user finished scrolling
    this.chartInstance?.updatePosition(this.scrollcontainer.nativeElement.scrollLeft);
    this.scrollingElement.nativeElement.removeEventListener('touchmove', this.moveTouch);
    this.scrollingElement.nativeElement.removeEventListener('touchend', this.endTouch);
    setTimeout(() => {
      this.chartInstance?.updatePosition(this.scrollcontainer.nativeElement.scrollLeft);
    }, 500);
    setTimeout(() => {
      this.chartInstance?.updatePosition(this.scrollcontainer.nativeElement.scrollLeft);
    }, 1000);
    setTimeout(() => {
      this.chartInstance?.updatePosition(this.scrollcontainer.nativeElement.scrollLeft);
    }, 2000);
  };

  moveTouch = () => {
    // hideLabels method is aimed to temporarily hide all elements (other than y-axes) that
    // should preserve fixed position after user finished scrolling
    this.chartInstance?.hideLabels();
  };

  // ---- end
}
