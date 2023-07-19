import { Component, HostListener, OnDestroy } from "@angular/core";
import { AbstractDataVizChartV5Instance } from "./abstract-data-viz-chart-v5-instance";
import { AmCharts5Service } from "./am-charts-v5.service";
import { DataVizChartHorizontalTableBarInstance } from "./data-viz-chart-horizontal-table-bar-instance";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  chartInstance!: AbstractDataVizChartV5Instance<any>;
  chartId = 'test-chart';

 data = {
    actualData: [
    {
    captionValue: "5,432,178 units",
    mainValue: 5432178,
    rowName: "[bold]Actual[/]",
    tooltip: ""
    }
    
    ],
    alternateSuffix: "%",
    estimation: undefined,
    invertColors: false,
    isPinned: true,
    suffix: undefined
    }

  constructor(private amChartsService: AmCharts5Service){
    
  }
  
  ngOnDestroy(): void {
    this.chartInstance?.dispose();
  }

  @HostListener('window:resize')
  onResize() {
    (this.chartInstance as DataVizChartHorizontalTableBarInstance).recreateTick();
  }


  ngOnInit(){
    this.amChartsService.modulesV5.subscribe(modulesV5 => {
      this.chartInstance = new DataVizChartHorizontalTableBarInstance(
        modulesV5,
        this.data,
        this.chartId
      );
    })
    
  }
}
