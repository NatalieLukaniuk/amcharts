import * as am5 from '@amcharts/amcharts5';
import { ColumnSeries } from '@amcharts/amcharts5/.internal/charts/xy/series/ColumnSeries';
import { AbstractDataVizChartV5Instance } from './abstract-data-viz-chart-v5-instance';
import { DataVizHeatmap, DataVizHeatmapEntry } from './tooltip-defect/tooltip-defect.component';
import { AmCharts5ImportedModules } from './am-charts-v5.service';
import { AxisRendererX, AxisRendererY, CategoryAxis } from '@amcharts/amcharts5/xy';

export class DataVizHeatmapInstance extends AbstractDataVizChartV5Instance<DataVizHeatmap> {
  chart?: import('@amcharts/amcharts5/xy').XYChart;
  rootElement!: am5.Root;
  series!: ColumnSeries;

  fontColor = '#000';

  colors = {
    black: am5.color('#000'),
    white: am5.color('#fff'),
    fontColor: am5.color(this.fontColor),
    strokesColor: am5.color('#dddddd'),
  };

  tooltipColors = {
    background: am5.color('#fff'),
    stroke: am5.color('#dddddd'),
    text: am5.color('#000'),
  };

  

  constructor(
    readonly amCharts: AmCharts5ImportedModules,
    public data: DataVizHeatmap,
    readonly chartId: string,
  ) {
    super();

    try {
      this.initializeChart(this.chart, this.chartId);
    } catch (unused) { }

    if (this.chart) {

      this.drawChart();
      this.setupChart();
    }
  }

  drawChart() {
    const xAxis = this.createXAxis();
    const yAxis = this.createYAxis();
    this.createSeries(xAxis, yAxis, this.data.series);
  }

  getTooltip() {
    const tooltipSettings: am5.ITooltipSettings = {
      keepTargetHover: true,
      getFillFromSprite: false,
      pointerOrientation: 'horizontal',
      wheelable: true,
      visible: true,
      interactive: true,
      paddingTop: 0,
      paddingBottom: 0,
      paddingRight: 0,
      paddingLeft: 0,
    };

    const backgroundSettings: Partial<am5.IGraphicsSettings> = {
      fill: this.tooltipColors.background,
      fillOpacity: 1,
      shadowBlur: 10,
      shadowOffsetX: 4,
      shadowOffsetY: 4,
      shadowOpacity: 0.5,
      shadowColor: this.colors.black,
      strokeOpacity: 0,      
    };

    const labelSettings: Partial<am5.ILabelSettings> = {
      paddingTop: 0,
      paddingBottom: 0,
      paddingRight: 0,
      paddingLeft: 0,
      fontSize: 14,
      interactive: true,
    };
    const tooltip = am5.Tooltip.new(this.rootElement, tooltipSettings);
    tooltip.get('background')?.setAll(backgroundSettings);
    tooltip.label.setAll(labelSettings);
    return tooltip;
  }

  createSeries(xAxis: any, yAxis: any, data: unknown[]) {
    const tooltip = this.getTooltip();
    tooltip.label.set('fill', this.tooltipColors.text);

    const series = this.chart!.series.push(
      ColumnSeries.new(this.rootElement, {
        xAxis,
        yAxis,
        valueYField: 'value',
        categoryYField: 'yCategory',
        categoryXField: 'xCategory',
        sequencedInterpolation: true,
        stateAnimationDuration: 2000,
        tooltip,
        stroke: this.colors.white,
      })
    );

    const maxHeight = this.chart!.height() - 30;

    series.columns.template.setAll({
      width: am5.p100,
      height: am5.p100,
      strokeWidth: 2,
      strokeOpacity: 1,
      tooltipPosition: 'fixed',

      tooltipHTML: `<div class='tp-label-medium' style='max-height:${maxHeight}px; ` +
        `overflow-y: auto; pointer-events: auto; border-radius: 5px;
            background: ${this.tooltipColors.background};'>{tooltip}</div>`,
    });

    series.columns.template.adapters.add('fill', (fill, target: any) => {
      const color = target.dataItem['dataContext']['color'];
      return am5.color(color);
    });

    series.events.on('pointerover', (ev) => {
      console.log('tooltip label interactive: ' + ev.target.get('tooltip')?.label.get('interactive'))
    })
    series.data.setAll(data);
    series.appear();

    this.series = series;
  }

  setupChart() {
    this.chart!.setAll({
      paddingRight: 30,
      paddingLeft: 10,
      marginLeft: 0,
      marginRight: 0,
      focusable: true,
      wheelable: true,
      width: am5.p100,
    });
  }

  dispose(): void {
    this.chart?.dispose();
    this.rootElement?.dispose();
  }

  groupData(category: string) {
    const groupedData = this.data.series
      .filter((elem) => elem[category as keyof DataVizHeatmapEntry])
      .reduce((acc: any, obj) => {
        const key = obj[category as keyof DataVizHeatmapEntry];
        if (!acc[key as any]) {
          acc[key as any] = [];
        }
        acc[key as any].push(obj);
        return acc;
      }, {});

    const result = Object.keys(groupedData).map((key) => ({
      category: key,
      data: groupedData[key],
    }));

    return result;
  }

  createXAxis() {

    const xRenderer = AxisRendererX.new(this.rootElement, {
      minGridDistance: 40,
      opposite: true,
    });

    xRenderer.grid.template.setAll({
      disabled: true,
    });

    xRenderer.labels.template.setAll({
      centerY: 0,
      paddingRight: 20,
      paddingLeft: 20,
      textAlign: 'center',
      dx: 0,
      fontSize: 14,
      fill: this.colors.fontColor,
    });


    const xAxis = this.chart!.xAxes.push(
      CategoryAxis.new(this.rootElement, {
        categoryField: 'category',
        renderer: xRenderer,
        width: am5.p100,
      })
    );

    xAxis.data.setAll(this.groupData('xCategory'));

    return xAxis;
  }

  createYAxis() {
    const yRenderer = AxisRendererY.new(this.rootElement, {
      minGridDistance: 10,
      inversed: true,
    });

    yRenderer.grid.template.setAll({
      disabled: true,
    });

    yRenderer.labels.template.setAll({
      fontSize: 14,
      fill: this.colors.fontColor,
      centerX: am5.p0,
      paddingRight: 20,
    });

    let yAxis = CategoryAxis.new(this.rootElement, {
      categoryField: 'category',
      renderer: yRenderer,
    });

    yAxis.get('renderer').labels.template.setAll({
      oversizedBehavior: 'truncate',
      maxWidth: 80,
    });


    yAxis.data.setAll(this.groupData('yCategory'));
    this.chart!.yAxes.push(yAxis);
    return yAxis;
  }

}
