import { Root } from '@amcharts/amcharts5';
import { AmCharts5ImportedModules } from './am-charts-v5.service';

/**
 * Represents an amCharts5 chart instance used by a data viz component.
 */
export abstract class AbstractDataVizChartV5Instance<DataType> {
  protected abstract chart?: import('@amcharts/amcharts5/xy').XYChart;

  protected abstract amCharts: AmCharts5ImportedModules;
  protected abstract data: DataType;
  protected abstract chartId: string;
  protected abstract rootElement: Root;

  protected initializeChart(
    type: any = this.amCharts.am5charts?.XYChart,
    divId?: string,
    legendId?: string
  ): void {
    const elementExists = !!document.getElementById(this.chartId);

    //Dispose of existing root.
    if (divId) {
      this.amCharts.am5core?.array.each(this.amCharts.am5core.registry.rootElements, (root) => {
        if (root?.dom.id === divId) {
          root.dispose();
        }
      });
    }
    //Dispose of existing root.
    if (legendId) {
      this.amCharts.am5core?.array.each(this.amCharts.am5core.registry.rootElements, (root) => {
        if (root?.dom.id === legendId) {
          root.dispose();
        }
      });
    }

    if (elementExists) {
      this.rootElement = this.amCharts.am5core?.Root.new(this.chartId, type);
      this.chart = this.rootElement?.container.children.push(
        type.new(this.rootElement, {
          layout: this.rootElement?.verticalLayout,
        })
      );
    }
  }

  abstract dispose(): void;
}
