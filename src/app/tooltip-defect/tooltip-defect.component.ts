import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractDataVizChartV5Instance } from '../abstract-data-viz-chart-v5-instance';
import { AmCharts5Service } from 'src/app/am-charts-v5.service';
import { DataVizHeatmapInstance } from '../data-viz-heatmap-instance';

export interface DataVizHeatmapEntry {
  xCategory: string;
  yCategory: string;
  color: string;
  opacity?: number;
  value: number;
  tooltip?: string;
  countries?: string[];
}

export interface DataVizHeatmap {
  series: DataVizHeatmapEntry[];
}

const tooltip = "\n<div class=\"chart-tooltip-container\">\n<div class=\"chart-tooltip-header\">\n<span class=\"chart-tooltip-header-title\">L2L Class: 1-/2-Series</span>\n<div class=\"chart-tooltip-header-subtitle\">\n\n      <span>c1</span>(3.2 % of all registrations)\n    </div>\n          </div>\n          <table class=\"table-in-tooltip scroll-bottom-gradient\">\n            <tr>\n              <th style=\"text-align: left; padding-right: 1rem;\">Rank</th>\n              <th style=\"text-align: left; padding-right: 1rem;\">Brand</th>\n              <th style=\"text-align: left; padding-right: 1rem;\">Model</th>\n              <th style=\"text-align: left; padding-right: 1rem;\">Registrations</th>\n              <th style=\"text-align: left; padding-right: 1rem;\" class=\"tooltip-table-narrow-column\">Premium Share</th>\n            </tr>\n            \n      <tr>\n        <td style=\"padding-right: 2rem;\">\n          <span style=\"\">\n            # 1\n          </span>\n        </td>\n        <td style=\"padding-right: 2rem;\">AUDI</td>\n        <td style=\"padding-right: 2rem;\">A3</td>\n        <td style=\"padding-right: 2rem;\">26,914</td>\n        <td style=\"padding-right: 2rem;\">3.7 %\n      <span class=\"red\">↓</span></td>\n      </tr>\n    \n      <tr>\n        <td style=\"padding-right: 2rem;\">\n          <span style=\"background-color:#88c982; padding:3px; min-width: 24px; display: inline-block;\">\n            # <b>2</b>\n          </span>\n        </td>\n        <td style=\"padding-right: 2rem;\"><b>BMW</b></td>\n        <td style=\"padding-right: 2rem;\">1-Series</td>\n        <td style=\"padding-right: 2rem;\"><b>21,148</b></td>\n        <td style=\"padding-right: 2rem;\"><b>\n      2.9 %\n      <span class=\"green\">↑</span>\n    </b></td>\n      </tr>\n    \n      <tr>\n        <td style=\"padding-right: 2rem;\">\n          <span style=\"\">\n            # 3\n          </span>\n        </td>\n        <td style=\"padding-right: 2rem;\">MERCEDES</td>\n        <td style=\"padding-right: 2rem;\">A-Class</td>\n        <td style=\"padding-right: 2rem;\">20,665</td>\n        <td style=\"padding-right: 2rem;\">2.8 %\n      <span class=\"red\">↓</span></td>\n      </tr>\n    \n      <tr>\n        <td style=\"padding-right: 2rem;\">\n          <span style=\"\">\n            # 4\n          </span>\n        </td>\n        <td style=\"padding-right: 2rem;\">MERCEDES</td>\n        <td style=\"padding-right: 2rem;\">CLA</td>\n        <td style=\"padding-right: 2rem;\">14,962</td>\n        <td style=\"padding-right: 2rem;\">2.1 %\n      <span class=\"green\">↑</span></td>\n      </tr>\n    \n      <tr>\n        <td style=\"padding-right: 2rem;\">\n          <span style=\"background-color:#88c982; padding:3px; min-width: 24px; display: inline-block;\">\n            # <b>5</b>\n          </span>\n        </td>\n        <td style=\"padding-right: 2rem;\"><b>BMW</b></td>\n        <td style=\"padding-right: 2rem;\">2-Series Active Tourer</td>\n        <td style=\"padding-right: 2rem;\"><b>9,182</b></td>\n        <td style=\"padding-right: 2rem;\"><b>\n      1.3 %\n      <span class=\"green\">↑</span>\n    </b></td>\n      </tr>\n    \n      <tr>\n        <td style=\"padding-right: 2rem;\">\n          <span style=\"background-color:#88c982; padding:3px; min-width: 24px; display: inline-block;\">\n            # <b>6</b>\n          </span>\n        </td>\n        <td style=\"padding-right: 2rem;\"><b>BMW</b></td>\n        <td style=\"padding-right: 2rem;\">2-Series</td>\n        <td style=\"padding-right: 2rem;\"><b>7,598</b></td>\n        <td style=\"padding-right: 2rem;\"><b>\n      1 %\n      <span class=\"green\">↑</span>\n    </b></td>\n      </tr>\n    \n      <tr>\n        <td style=\"padding-right: 2rem;\">\n          <span style=\"\">\n            # 7\n          </span>\n        </td>\n        <td style=\"padding-right: 2rem;\">MERCEDES</td>\n        <td style=\"padding-right: 2rem;\">B-Class</td>\n        <td style=\"padding-right: 2rem;\">4,430</td>\n        <td style=\"padding-right: 2rem;\">0.6 %\n      <span class=\"red\">↓</span></td>\n      </tr>\n    \n      <tr>\n        <td style=\"padding-right: 2rem;\">\n          <span style=\"background-color:#88c982; padding:3px; min-width: 24px; display: inline-block;\">\n            # <b>8</b>\n          </span>\n        </td>\n        <td style=\"padding-right: 2rem;\"><b>BMW</b></td>\n        <td style=\"padding-right: 2rem;\">2-Series Gran Tourer</td>\n        <td style=\"padding-right: 2rem;\"><b>462</b></td>\n        <td style=\"padding-right: 2rem;\"><b>\n      0.1 %\n      <span class=\"red\">↓</span>\n    </b></td>\n      </tr>\n    \n          </table>\n          \n        </div>\n      "

const countries = ['SLOVAKIA', 'GREECE', 'NETHERLANDS', 'IRELAND', 'ITALY', 'CROATIA']

@Component({
  selector: 'app-tooltip-defect',
  templateUrl: './tooltip-defect.component.html',
  styleUrls: ['./tooltip-defect.component.scss']
})
export class TooltipDefectComponent implements OnDestroy, OnInit {
  chartInstance!: AbstractDataVizChartV5Instance<any>;
  chartId = 'test-chart';
  constructor(private amChartsService: AmCharts5Service) {

  }

  ngOnInit() {
    this.amChartsService.modulesV5.subscribe(modulesV5 => {

      this.chartInstance = new DataVizHeatmapInstance(
        modulesV5,
        { series: this.generateData() },
        this.chartId,

      );
    })
  }

  generateData() {
    const result: DataVizHeatmapEntry[] = [];
    for (let i = 0; i < 100; i++) {
      const entry = {
        color: this.getRandom(["#88c982", "#2e8327", "#88c982"]),
        countries: countries,
        tooltip: tooltip,
        value: 36,
        xCategory: this.getRandom(["Bus", "Van", "Plane", "Missile", "Bicycle", "Car"]),
        yCategory: this.getRandom(countries)
      }
      result.push(entry)
    }
    return result
  }

  getRandom(array: string[]) {
    const randomIndex = Math.floor(Math.random() * 10);
    const arrayToManipulate = this.getArray(array);
    return arrayToManipulate[randomIndex]
  }

  getArray(array: string[]): string[] {
    if (array.length < 10) {
      const result = array.concat(array);
      return this.getArray(result);
    } else {
      return array.map(i => i);
    }
  }

  ngOnDestroy(): void {
    this.chartInstance?.dispose();
  }

}
