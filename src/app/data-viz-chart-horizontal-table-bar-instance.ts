/* eslint-disable no-underscore-dangle */

import * as am5 from '@amcharts/amcharts5';
import { AxisRenderer, AxisTick, CategoryAxis, ColumnSeries, ValueAxis } from '@amcharts/amcharts5/xy';
import { AbstractDataVizChartV5Instance } from './abstract-data-viz-chart-v5-instance';
import { AmCharts5ImportedModules } from './am-charts-v5.service';

export interface DataVizChartHorizontalTableBar {
  actualData: DataVizHorizontalTableBarRow[];
  suffix?: string;
  alternateSuffix?: string;
  estimation?: string;
  isPinned: boolean;
  invertColors: boolean;
}

export interface DataVizHorizontalTableBarRow {
  rowName: string; //Actuals, PY, BUDGET...
  mainValue: number; //number in unities
  mainValueCaption?: string; //only for ACTUALS (units)
  captionValue: string; //the value to be presented on the right side of the chart
  tooltip: string; //used to be displayed in the tooltip
}

export class DataVizChartHorizontalTableBarInstance extends AbstractDataVizChartV5Instance<DataVizChartHorizontalTableBar> {
  protected rootElement!: am5.Root;
  chart!: import('@amcharts/amcharts5/xy').XYChart;

  categoryAxisWidthLeft = 80;
  categoryAxisWidthRight = 140;
  gridDistance = 10; //distance in between char rows

  fontColor = '#fff';
  bmwFontFamily = 'Fira Sans Condensed';

  horizontalShift = 10;

  config = {
    seriesName: 'Series',
    seriesColor: '#92A2BD',
    tooltipTextColor: '#fff',
  };

  series!: ColumnSeries;
  xAxis!: ValueAxis<AxisRenderer>;
  yAxisLeft!: CategoryAxis<AxisRenderer>;
  tick: AxisTick | undefined;

  constructor(
    readonly amCharts: AmCharts5ImportedModules,
    readonly data: DataVizChartHorizontalTableBar,
    readonly chartId: string
  ) {
    super();

    this.initializeChart(this.chart, this.chartId);

    if (this.chart) {
      this.drawChart();
    }
  }

  drawChart() {
    this.data.actualData = this.processRowNameData(this.data.actualData);
    this.chart.setAll({
      crisp: true,
      paddingTop: 0,
      paddingLeft: 0,
      paddingBottom: 30,
      paddingRight: 0,
      width: am5.p100,
      height: this.calculateChartHeight(),
      cursor: this.amCharts.am5charts.XYCursor.new(this.rootElement, {}),
    });

    //removes the zoom button present in some circumstances
    this.chart.zoomOutButton.set('forceHidden', true);

    const cursor = this.chart.get('cursor');
    cursor?.lineX.setAll({
      visible: false,
    });
    cursor?.lineY.setAll({
      visible: false,
    });

    this.yAxisLeft = this.createYAxisLeft();
    this.createYAxisRight();

    this.xAxis = this.initializeXAxis();
    this.series = this.initSeries(this.xAxis, this.yAxisLeft);

    this.createSalesReachGoalLine(this.xAxis, this.yAxisLeft, this.series);
  }

  recreateTick() {
    this.createSalesReachGoalLine(this.xAxis, this.yAxisLeft, this.series);
  }

  dispose(): void {
    this.chart?.dispose();
  }

  /**
   * Create and define the styles of the y-axis
   *
   *  @returns the axis created
   */
  createYAxisLeft() {
    const yRenderer = this.amCharts.am5charts.AxisRendererY.new(this.rootElement, {
      //defines the vertical distance in between rows
      minGridDistance: this.gridDistance,
      crisp: true,
    });

    //Removes any grid from the table
    yRenderer.grid.template.setAll({
      visible: false.valueOf(),
    });

    //sets the renderer, the field to mine data from and the width for the collumn
    const categoryAxis = this.chart.yAxes.push(
      this.amCharts.am5charts.CategoryAxis.new(this.rootElement, {
        renderer: yRenderer,
        categoryField: 'rowName',
        width: this.categoryAxisWidthLeft,
      })
    );
    debugger
    categoryAxis.data.setAll(this.data.actualData);

    yRenderer.labels.template.setAll({
      fontFamily: this.bmwFontFamily,
      fontSize: 14,
      fill: am5.color(this.fontColor),
      width: am5.p100,
      textAlign: 'start',
      maxWidth: this.categoryAxisWidthLeft,
      crisp: true,
    });

    return categoryAxis;
  }

  createYAxisRight() {
    const yRenderer = this.amCharts.am5charts.AxisRendererY.new(this.rootElement, {
      minGridDistance: this.gridDistance,
      opposite: true,
      crisp: true,
    });

    //Removes any grid from the table
    yRenderer.grid.template.setAll({
      visible: false,
    });

    //sets the renderer, the field to mine data from and the width for the collumn
    const categoryAxis = this.chart.yAxes.push(
      this.amCharts.am5charts.CategoryAxis.new(this.rootElement, {
        renderer: yRenderer,
        categoryField: 'captionValue',
        width: this.categoryAxisWidthRight,
      })
    );

    categoryAxis.data.setAll(this.processDataColor(this.data.actualData));

    yRenderer.labels.template.setAll({
      fontFamily: this.bmwFontFamily,
      fontSize: 14,
      fill: am5.color(this.fontColor),
      width: am5.p100,
      textAlign: 'end',
      maxWidth: this.categoryAxisWidthRight,
      dx: this.categoryAxisWidthRight,
      crisp: true,
    });

    return categoryAxis;
  }

  /**
   * The X axis must be empty
   *
   *  @returns the axis created
   */
  initializeXAxis() {
    const xAxis = this.chart.xAxes.push(
      this.amCharts.am5charts.ValueAxis.new(this.rootElement, {
        renderer: this.amCharts.am5charts.AxisRendererX.new(this.rootElement, { wheelable: false }),
        width: am5.percent(100),
        //maxWidth: 300,
        min: 0,
        max: this.getOneHundredPercent(this.processData(this.data.actualData))[0].mainValue,
        strictMinMax: true,
        wheelable: false,
      })
    );

    const xRenderer = xAxis.get('renderer');

    xRenderer.labels.template.setAll({
      visible: false, // hide labels
    });
    xRenderer.grid.template.setAll({
      visible: false, // hide grid stroke
    });

    return xAxis;
  }

  initSeries(xAxis: ValueAxis<AxisRenderer>, yAxis: CategoryAxis<AxisRenderer>) {
    const tooltip = am5.Tooltip.new(this.rootElement, {
      labelText: '{tooltip}',
      pointerOrientation: 'vertical',
    });

    //background
    const seriesShadow = this.chart.series.push(
      this.amCharts.am5charts.ColumnSeries.new(this.rootElement, {
        xAxis,
        yAxis,
        valueXField: 'mainValue',
        categoryYField: 'rowName',
        fill: am5.color('#262B43'),
        width: am5.percent(70),
        dx: this.horizontalShift,
        clustered: false,
      })
    );

    seriesShadow.columns.template.setAll({
      height: this.getColumnsHeight(),
      strokeOpacity: 0,
    });

    seriesShadow.data.setAll(this.getOneHundredPercent(this.processData(this.data.actualData)));

    //the real one
    const series = this.chart.series.push(
      this.amCharts.am5charts.ColumnSeries.new(this.rootElement, {
        xAxis,
        yAxis,
        valueXField: 'mainValue',
        categoryYField: 'rowName',
        fill: am5.color('#92A2BD'),
        width: am5.percent(70),
        dx: this.horizontalShift,
        tooltip,
        clustered: false,
      })
    );

    series.columns.template.setAll({
      height: this.getColumnsHeight(),
      strokeOpacity: 0,
    });

    this.styleTooltips(series);

    let count = 0;
    series.columns.template.adapters.add('fill', (fill, target) => {
      count++;
      if (count === this.data.actualData.length) {
        return am5.color('#92A2BD');
      }
      return am5.color('#92A2BD');
    });

    series.data.setAll(this.processData(this.data.actualData));

    return series;
  }

  styleTooltips(series: ColumnSeries) {
    series.getTooltip()?.label.setAll({
      fill: am5.color(this.config.tooltipTextColor),
      fontSize: 14,
      fontFamily: this.bmwFontFamily,
    });
  }

  createSalesReachGoalLine(
    xAxis: ValueAxis<AxisRenderer>,
    yAxis: CategoryAxis<AxisRenderer>,
    series: ColumnSeries
  ) {
    this.createTick(series, xAxis);
  }

  /**
   * This is questionable, however it is needed.
   * The _settings.point contains the actual Y for the rows,
   * however, that value can only be obtained after the graph being drawn.
   * The do...while loops ensure that the graph is drawn and the _settings.point is not undefined.
   * This method also needs to be called every time the height of the canvas changed since the tick length is not mutable
   *
   * Even with all the do...while loops in the createTick() method it still fails, ence the necessity for the try...catch loop
   *
   * @param series
   * @param xAxis
   */
  async createTick(series: ColumnSeries, xAxis: ValueAxis<AxisRenderer>) {
    let fail = false;
    do {
      try {
        fail = false;

        if (this.tick) {
          this.tick.dispose();
        }

        do {
          await this.delay(100);
        } while (
          typeof series.dataItems[0]._settings.point === undefined ||
          typeof series.dataItems[series.dataItems.length - 1]._settings.point === undefined
        );

        do {
          await this.delay(100);
        } while (          
          !series.dataItems[0]._settings.point!.y ||
          !series.dataItems[series.dataItems.length - 1]._settings.point!.y
        );

        let y = series.dataItems[series.dataItems.length - 1]._settings.point!.y;

        const y2 = series.dataItems[0]._settings.point!.y;
        const height = y2 - y + 14;

        const rangeDataItem = xAxis.makeDataItem({
          value: this.processData(this.data.actualData)[this.data.actualData.length - 1].mainValue,
          visible: true,
        });
        const range = xAxis.createAxisRange(rangeDataItem);
        this.tick = range.get('tick');
        this.tick?.setAll({
          inside: true,
          visible: true,
          stroke: am5.color('#92A2BD'),
          strokeDasharray: [4, 4],
          strokeOpacity: 1,
          length: height,
          location: 0,
          dy: -y / 2,
          dx: this.horizontalShift,
          strokeWidth: 2,
        });
      } catch (e) {
        fail = true;
      }
    } while (fail);

    return Promise.resolve(0);
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Creates a new array that contains the absolute values for the chart bars
   *
   * @param data
   */
  processData(data: DataVizHorizontalTableBarRow[]): DataVizHorizontalTableBarRow[] {
    const newData: DataVizHorizontalTableBarRow[] = [];
    const actuals = data[data.length - 1].mainValue;
    data.forEach((d, index) => {
      const newVal = {
        rowName: d.rowName,
        mainValue: d.mainValue,
        captionValue: d.captionValue,
        tooltip: d.tooltip,
      };

      let tooltipSufdix;
      if (this.data.suffix) {
        tooltipSufdix = this.data.suffix;
      } else if (
        this.data.alternateSuffix &&
        !this.data.actualData[this.data.actualData.length - 1].captionValue.includes('units')
      ) {
        tooltipSufdix = this.data.alternateSuffix;
      } else {
        tooltipSufdix = '';
      }

      if (index !== data.length - 1) {
        newVal.mainValue = actuals - newVal.mainValue;
        newVal.tooltip =
          '[bold]' + d.rowName + ':[/] ' + newVal.mainValue + tooltipSufdix;
      } else {
        if (this.data.estimation) {
          newVal.tooltip =
            '[bold]Actual[/] ' +
            this.data.estimation +
            ':\n' +
            newVal.mainValue +
            tooltipSufdix;
        } else {
          newVal.tooltip = '[bold]Actual:[/] ' + newVal.mainValue + tooltipSufdix;
        }
      }

      newData.push(newVal);
    });

    return newData;
  }

  /**
   * This method needs to calculate the height of the chart for charts with 2, 3 and 4 rows.
   * This is a rough approximation that allows the rows to be aligned in all cases.
   * Surely there must be a logic to do this perfectly, however the documentation presents nothing on this.
   * The commented out code is being kept here in order to help in future improvements.
   */
  calculateChartHeight() {
    const numberOfYCategories = this.getNumberOfRows();
    switch (numberOfYCategories) {
      case 4:
        return am5.percent(130);
      case 3:
        return am5.percent(103);
      case 2:
        return am5.percent(76);
      case 1:
        return am5.percent(49);
        default: return am5.percent(76);
    }
  }

  getNumberOfRows() {
    return this.data.actualData.length;
  }

  getCaptionForNonActuals(newVal: DataVizHorizontalTableBarRow) {
    if (newVal.captionValue.charAt(0) === '+') {
      const color = '#8cc59a';
      newVal.captionValue = '[' + color + ']' + newVal.captionValue + '[/]';
    } else if (newVal.captionValue.charAt(0) === '-') {
      const color = '#d47d7e';
      newVal.captionValue = '[' + color + ']' + newVal.captionValue + '[/]';
    }
  }

  getCaptionForActuals(newVal: DataVizHorizontalTableBarRow) {
    const split = newVal.captionValue.split(' ');
    if (newVal.captionValue.includes('%')) {
      newVal.captionValue = '[bold fontSize: 22px]' + newVal.captionValue + '[/]';
    } else if (split.length === 3) {
      newVal.captionValue =
        '[bold fontSize: 22px]' + split[0] + '[/] ' + '[fontSize: 12px]' + split[1] + ' ' + split[2] + '[/]';
    } else if (split.length === 2) {
      newVal.captionValue =
        '[bold fontSize: 22px]' + split[0] + '[/] ' + '[fontSize: 12px]' + split[1] + '[/]';
    } else {
      newVal.captionValue = '[bold fontSize: 22px]' + newVal.captionValue + '[/]';
    }
  }

  private processDataColor(data: DataVizHorizontalTableBarRow[]) {
    const newData: DataVizHorizontalTableBarRow[] = [];
    data.forEach((d, index) => {
      const newVal: DataVizHorizontalTableBarRow = {
        rowName: d.rowName,
        mainValue: d.mainValue,
        captionValue: d.captionValue,
        tooltip: d.tooltip,
      };
      if (index !== data.length - 1) {
        this.getCaptionForNonActuals(newVal);
      } else {
        this.getCaptionForActuals(newVal);
      }
      newData.push(newVal);
    });

    return newData;
  }

  private processRowNameData(data: DataVizHorizontalTableBarRow[]) {
    const newData: DataVizHorizontalTableBarRow[] = [];
    data.forEach((d, index) => {
      const newVal = {
        rowName: d.rowName,
        mainValue: d.mainValue,
        captionValue: d.captionValue,
        tooltip: d.tooltip,
      };

      if (index === data.length - 1) {
        // needs to check if already has the estimation since this gets recalled in multiple moments
        if (this.data.estimation && !newVal.rowName.includes(this.data.estimation)) {
          newVal.rowName =
            '[bold]' + newVal.rowName + '[/]' + '[fontSize: 12px]\n' + this.data.estimation + '[/]';
        } else if (!this.data.estimation) {
          newVal.rowName = '[bold]' + newVal.rowName + '[/]';
        }
      }
      newData.push(newVal);
    });

    return newData;
  }

  private getColumnsHeight() {
    if (this.isMobile() || this.isTablet()) {
      return 10;
    } else {
      return 14;
    }
  }

  isMobile = (): boolean =>
  (window.innerWidth <= 666 && this.isPortrait()) ||
  (window.innerWidth <= 896 && !this.isPortrait());

  isPortrait = (): boolean => window.innerWidth < window.innerHeight;

isLandscape = (): boolean => window.innerWidth > window.innerHeight;

isTablet = (): boolean =>
  window.innerWidth <= 1300 &&
  ((window.innerWidth >= 768 && this.isPortrait()) ||
    (window.innerWidth > 896 && !this.isPortrait()));

  private getOneHundredPercent(data: DataVizHorizontalTableBarRow[]): DataVizHorizontalTableBarRow[] {
    const newData: DataVizHorizontalTableBarRow[] = [];

    const max = Math.max(...data.map((d) => d.mainValue));
    const finalMax =
      max > data[data.length - 1].mainValue / 0.6 ? max * 1.04 : data[data.length - 1].mainValue / 0.6;

    data.forEach((d, index) => {
      const newVal = {
        rowName: d.rowName,
        mainValue: finalMax,
        captionValue: d.captionValue,
        tooltip: d.tooltip,
      };

      newData.push(newVal);
    });

    return newData;
  }
}
