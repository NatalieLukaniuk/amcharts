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
    captionValue: "+54,777 / +4.7%",
    mainValue: 54777,
    rowName: "Prev. Year",
    tooltip: ""
    },
    {
    captionValue: "-29,217 / -2.4%",
    mainValue: -29217,
    rowName: "Budget",
    tooltip: "-29,217"
    },
    {
    captionValue: "+8,969 / +0.7%",
    mainValue: 8969,
    rowName: "FC07",
    tooltip: ""
    },
    {
    captionValue: "1,211,683 units",
    mainValue: 1211683,
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
