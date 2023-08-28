import { AxisRenderer, AxisRendererY, CategoryAxis, ColumnSeries, LineSeries, ValueAxis } from '@amcharts/amcharts5/xy';
import { AbstractDataVizChartV5Instance } from './abstract-data-viz-chart-v5-instance';
import { ChartDataItem } from './app.component';
import * as am5 from '@amcharts/amcharts5';
import { Subscription } from 'rxjs';
import { AmCharts5ImportedModules } from './am-charts-v5.service';

export class DataVizChartSalesReachMobileInstance extends AbstractDataVizChartV5Instance<ChartDataItem[]> {
    chart?: import('@amcharts/amcharts5/xy').XYChart;
    protected rootElement!: am5.Root;
    actualSeries!: am5.Series;
    forecastSeries!: am5.Series;
    salesReachSeries!: am5.Series;

    rightYAxis!: ValueAxis<AxisRendererY>;

    salesReachTick: any;

    leftYAxisWidth = 75;
    rightAxisWidth = 45;
    leftAxisLabelHeight = 80;
    rightYAxisPaddingLeft = 5;

    cellWidth = 55;

    fontColor = '#000';
    bmwFontFamily = 'bmw-group-cond';

    chartBackgroundColor = '#fff';

    subs: Subscription = new Subscription();
    isSalesReachAvailable = false;
    isForcastAvailable = false;
    isActualAvailable = false;

    visibleCategories: number = 5;
    visibleAreaWidth!: number;
    chartVisibleWidth!: number;

    constructor(
        readonly amCharts: AmCharts5ImportedModules,
        readonly data: ChartDataItem[],
        readonly chartId: string,
        readonly config: any,
    ) {
        super();
        this.initializeChart(this.chart, this.chartId);
        this.isSalesReachAvailable = !!this.data.find((category) => !!category.salesReach);
        this.isForcastAvailable = !!this.data.find((category) => !!category.forecast);
        this.isActualAvailable = !!this.data.find((category) => !!category.actual);
        this.data.reverse();
        if (this.chart) {
             this.updateVisibleAreaWidth(this.config.visibleAreaWidth);

            this.renderChart();
            this.makeYAxesFixed();
        }
    }

    dispose(): void {
        this.chart?.dispose();
        this.subs.unsubscribe();
    }

    getMaxVisibleCategories() {
        const desiredCellWidth = 55;
        return Math.floor(this.chartVisibleWidth / desiredCellWidth);
    }

    renderChart(): void {
        const cursor = this.chart?.set('cursor', this.amCharts.am5charts.XYCursor.new(this.rootElement, {}));

        cursor?.lineY.set('visible', false);
        cursor?.lineX.set('visible', false);

        this.chart = this.rootElement.container.children.push(
            this.amCharts.am5charts.XYChart.new(this.rootElement, {
                paddingTop: this.leftAxisLabelHeight,
                paddingLeft: 0,
                paddingRight: 0,
                width: am5.percent(100),
                cursor
            })
        );

        const xAxis = this.initializeXAxis();
        const leftAxis = this.initializeLeftYAxis();

        if (this.isActualAvailable) {
            let actualSeries = this.initActualSeries(xAxis, leftAxis);
            if (actualSeries) {
                this.actualSeries = actualSeries
            }
        }

        if (this.isForcastAvailable) {
            let forecastSeries = this.initForecastSeries(xAxis, leftAxis);
            if (forecastSeries) {
                this.forecastSeries = forecastSeries;
            }
        }

        if (this.isSalesReachAvailable) {
            const rightAxis = this.initializeRightYAxis();
            rightAxis.set('syncWithAxis', leftAxis);

            let salesReachSeries = this.initSalesReachSeries(xAxis, rightAxis);
            if (salesReachSeries) {
                this.salesReachSeries = salesReachSeries
            }

            this.createSalesReachGoalLine(rightAxis);
            this.styleSalesReachAxisLabels(rightAxis);
        }
        this.calculateChartWidth();
    }

    initializeXAxis() {
        const xRenderer = this.amCharts.am5charts.AxisRendererX.new(this.rootElement, {
            minGridDistance: 10,
        });

        const xAxis = this.chart!.xAxes.push(
            this.amCharts.am5charts.CategoryAxis.new(this.rootElement, {
                categoryField: 'category',
                renderer: xRenderer,
                tooltip: am5.Tooltip.new(this.rootElement, {
                    labelText: '{category}',
                }),
            })
        );

        xAxis?.getTooltip()?.label.setAll({
            fontSize: 12,
            fontFamily: this.bmwFontFamily,
        });

        xRenderer.labels.template.setAll({
            fontFamily: this.bmwFontFamily,
            fontSize: 12,
            fill: am5.color(this.fontColor),
            maxWidth: this.cellWidth,
            oversizedBehavior: 'wrap-no-break',
            textAlign: 'center',
            paddingTop: 10
        });

        if (this.config.isRotateLabels) {
            xRenderer.labels.template.setAll({
                rotation: -45,
                centerY: am5.p50,
            });
        }
        xAxis?.data.setAll(this.data);

        return xAxis;
    }

    initializeLeftYAxis() {
        const yRenderer = this.amCharts.am5charts.AxisRendererY.new(this.rootElement, {});

        const leftValueAxis = this.chart!.yAxes.push(
            this.amCharts.am5charts.ValueAxis.new(this.rootElement, {
                min: 0,
                renderer: yRenderer,
                width: this.leftYAxisWidth
            })
        );

        leftValueAxis?.children.push(
            am5.Label.new(this.rootElement, {
                text: this.config.topValueAxisTitle,
                y: -this.leftAxisLabelHeight,
                x: -5,
                textAlign: 'left',
                fontSize: 12,
                fontFamily: this.bmwFontFamily,
                fill: am5.color(this.fontColor),
            })
        );

        yRenderer.labels.template.setAll({
            fontFamily: this.bmwFontFamily,
            fontSize: 12,
            fill: am5.color(this.fontColor),
            textAlign: 'left',
        });

        return leftValueAxis;
    }

    initializeRightYAxis() {
        const yRenderer = this.amCharts.am5charts.AxisRendererY.new(this.rootElement, {
            opposite: true,

        });
        if (this.chart) {
            this.rightYAxis = this.chart.yAxes.push(
                this.amCharts.am5charts.ValueAxis.new(this.rootElement, {
                    renderer: yRenderer,
                    numberFormatter: am5.NumberFormatter.new(this.rootElement, {
                        numberFormat: '###%',
                    }),
                    min: 0,
                    paddingLeft: this.rightYAxisPaddingLeft,
                    strictMinMax: true,
                    width: this.rightAxisWidth
                })
            );

            this.rightYAxis.children.push(
                am5.Label.new(this.rootElement, {
                    text: this.config.salesReachAxisTitle,
                    y: -65,
                    x: this.rightAxisWidth,
                    textAlign: 'right',
                    fontSize: 12,
                    fontFamily: this.bmwFontFamily,
                    fill: am5.color(this.fontColor),
                })
            );

            yRenderer.labels.template.setAll({
                fontFamily: this.bmwFontFamily,
                fontSize: 12,
            });

            yRenderer.grid.template.setAll({
                stroke: am5.color('#ccc'),
                strokeWidth: 1,
            });
        }


        return this.rightYAxis;
    }

    initActualSeries(xAxis: CategoryAxis<AxisRenderer>, yAxis: ValueAxis<AxisRenderer>) {

        const series = this.chart!.series.push(
            this.amCharts.am5charts.ColumnSeries.new(this.rootElement, {
                name: this.config.actualSeriesName,
                xAxis,
                yAxis,
                valueYField: 'actual',
                categoryXField: 'category',
                clustered: false,
                tooltip: am5.Tooltip.new(this.rootElement, {
                    labelText: `${this.config.actualSeriesName}: {actual}`,
                }),
            })
        );

        series.columns.template.setAll({
            width: am5.percent(70),
            maxWidth: this.cellWidth * 0.7,
            tooltipY: 0,
            strokeOpacity: 0,
        });

        this.styleTooltips(series);

        series.data.setAll(this.data);
        return series;


    }

    initForecastSeries(xAxis: CategoryAxis<AxisRenderer>, yAxis: ValueAxis<AxisRenderer>) {

        const series = this.chart!.series.push(
            this.amCharts.am5charts.ColumnSeries.new(this.rootElement, {
                name: this.config.forecastSeriesName,
                xAxis,
                yAxis,
                valueYField: 'forecast',
                categoryXField: 'category',
                clustered: false,
                tooltip: am5.Tooltip.new(this.rootElement, {
                    labelText: `${this.config.forecastSeriesName}: {forecast}`,
                }),
            })
        );

        series.columns.template.setAll({
            width: am5.percent(40),
            maxWidth: this.cellWidth * 0.4,
            tooltipY: 0,
            strokeOpacity: 0,
        });

        this.styleTooltips(series);

        series.data.setAll(this.data);

        return series;


    }

    initSalesReachSeries(xAxis: CategoryAxis<AxisRenderer>, yAxis: ValueAxis<AxisRenderer>) {

        const series = this.chart!.series.push(
            this.amCharts.am5charts.LineSeries.new(this.rootElement, {
                name: this.config.salesReachSeriesName,
                stroke: am5.color(this.config.salesReachColor),
                fill: am5.color(this.config.salesReachColor),
                xAxis,
                yAxis,
                valueYField: 'salesReach',
                categoryXField: 'category',
                tooltip: am5.Tooltip.new(this.rootElement, {
                    labelText: `${this.config.salesReachSeriesName}: {salesReach.formatNumber('###.##%')}`,
                    pointerOrientation: 'right',
                }),
            })
        );

        series.bullets.push((root) =>
            am5.Bullet.new(this.rootElement, {
                sprite: am5.Circle.new(root, {
                    radius: 4,
                    fill: series.get('fill'),
                }),
            })
        );

        this.styleTooltips(series);

        series.data.setAll(this.data);
        return series;


    }

    styleTooltips(series: ColumnSeries | LineSeries) {
        series?.getTooltip()?.label.setAll({
            fill: am5.color(this.config.tooltipTextColor),
            fontSize: 12,
            fontFamily: this.bmwFontFamily,
        });
    }

    createSalesReachGoalLine(axis: ValueAxis<AxisRendererY>) {
        const rangeDataItem = axis.makeDataItem({
            value: 0,
            endValue: 1,
        });

        const range = axis.createAxisRange(rangeDataItem);

        this.salesReachTick = range.get('tick');
        this.setTickProperties();
    }

    setTickProperties() {
        if (this.salesReachTick) {
            this.salesReachTick.setAll({
                visible: true,
                stroke: am5.color('#000'),
                strokeDasharray: [4, 4],
                strokeOpacity: 1,
                length: this.visibleAreaWidth - this.leftYAxisWidth - this.rightAxisWidth + this.rightYAxisPaddingLeft,
                location: 1,
                inside: true,
            });
        } else {
            setTimeout(() => {
                this.setTickProperties();
            }, 30);
        }
    }

    styleSalesReachAxisLabels(axis: ValueAxis<AxisRendererY>) {
        axis.get('renderer').labels.template.adapters.add('fill', (_value, target) => {
            if (target.get('text') === '100%') {
                return am5.color('#000');
            } else {
                return am5.color(this.fontColor);
            }
        });

        axis.get('renderer').labels.template.adapters.add('text', (value) => {
            if (value === '100%') {
                return `[fontWeight: 900]${value}[/]`;
            } else {
                return value;
            }
        });
    }

    // this is a workaround for y-axes labels of to stay visible on horizontal scroll for mobile
  // when native horizontal scroll is implemented by amcharts5, this needs to be reworked to use the native scroll
  // ---- start

  calculateChartWidth() {
    const xCategory = new Set();

    this.data.forEach((d) => {
      xCategory.add(d.category);
    });

    const numberOfXCategories = xCategory.size;

    if (numberOfXCategories > this.visibleCategories) {

      //  Calculate how we need to adjust chart width
      const chartWidth =
        numberOfXCategories * this.cellWidth +
        this.chart!.get('paddingLeft', 0) +
        this.chart!.get('paddingRight', 0) +
        (this.leftYAxisWidth) + this.rightAxisWidth + this.rightYAxisPaddingLeft;

      // Set it on chart's container
      this.chart!.root.dom.style.width = chartWidth + 'px';

    } else {
      this.chart!.root.dom.style.width = 100 + '%';
    }
  }

  makeYAxesFixed() {
    // left axis
    this.chart?.leftAxesContainer.setAll({
      width: this.leftYAxisWidth,
      position: 'absolute',
      x: 0,
      y: 0,
    });

    // left axis background
    this.chart?.leftAxesContainer.children.unshift(
      am5.Container.new(this.rootElement, {
        background: am5.Rectangle.new(this.rootElement, {
          fill: am5.color(this.chartBackgroundColor),
        }),
        height: this.chart.leftAxesContainer.get('height'),
        width: this.leftYAxisWidth,
        x: 0,
        y: 0,
        position: 'absolute',
      })
    );

    // right axis
    this.chart?.rightAxesContainer.setAll({
      width: this.rightAxisWidth,
      position: 'absolute',
      x: this.visibleAreaWidth - this.rightAxisWidth,
      y: 0,
    });

    // right axis background
    this.rightYAxis?.children.unshift(
      am5.Container.new(this.rootElement, {
        background: am5.Rectangle.new(this.rootElement, {
          fill: am5.color(this.chartBackgroundColor),
        }),
        height: this.chart!.rightAxesContainer.get('height'),
        width: this.rightAxisWidth,
        y: 0,
        position: 'absolute',
      })
    );

    this.chart?.yAxesAndPlotContainer?.children.swap(0, 1);

    this.chart?.plotContainer.setAll({
      x: this.leftYAxisWidth,
      y: this.leftAxisLabelHeight,
      paddingRight: this.rightAxisWidth
    });

    // this is basically a patch element that covers the bottomaxis labels which are right under the Y-axis on scroll
    this.chart?.bottomAxesContainer.children.push(
      am5.Container.new(this.rootElement, {
        background: am5.Rectangle.new(this.rootElement, {
          fill: am5.color(this.chartBackgroundColor),
        }),
        height: 110,
        width: this.leftYAxisWidth,
        x: 0,
        y: 10,
        position: 'absolute',
      })
    );

    this.chart?.bottomAxesContainer.children.push(
      am5.Container.new(this.rootElement, {
        background: am5.Rectangle.new(this.rootElement, {
          fill: am5.color(this.chartBackgroundColor),
        }),
        height: 110,
        width: this.rightAxisWidth,
        x: this.visibleAreaWidth - this.rightAxisWidth,
        y: 10,
        position: 'absolute',
      })
    );
  }

  override updatePosition(currentPosition: number) {

    this.chart?.leftAxesContainer.set('x', currentPosition);
    const containerToHideXLabelsleft = this.chart?.bottomAxesContainer.children.getIndex(
      this.chart?.bottomAxesContainer.children.length - 2
    );
    containerToHideXLabelsleft?.set('x', currentPosition);

    const rightAxisPosition = currentPosition + (this.visibleAreaWidth - this.rightAxisWidth);
    this.chart?.rightAxesContainer.set('x', rightAxisPosition);

    const containerToHideXLabelsright = this.chart?.bottomAxesContainer.children.getIndex(
      this.chart?.bottomAxesContainer.children.length - 1
    );
    containerToHideXLabelsright?.set('x', rightAxisPosition);

  }

  override hideLabels() {
    this.chart?.leftAxesContainer.set('x', -100);
    this.chart?.rightAxesContainer.set('x', -100);
  }

  // ---- end


    updateVisibleAreaWidth(newWidth: number) {
        this.visibleAreaWidth = newWidth;
        this.onVisibleAreaWidthUpdate();
    }

    updateTickLegth() {
        if (this.salesReachTick) {
            this.salesReachTick.dispose();
            this.createSalesReachGoalLine(this.rightYAxis);
        }
    }

    onVisibleAreaWidthUpdate() {
        this.chartVisibleWidth = this.visibleAreaWidth - this.leftYAxisWidth - this.rightAxisWidth - this.rightYAxisPaddingLeft;
        this.visibleCategories = this.getMaxVisibleCategories();
        this.cellWidth = Math.round(this.chartVisibleWidth / this.visibleCategories);
    }
}
