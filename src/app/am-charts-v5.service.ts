import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';

export interface AmCharts5ImportedModules {
  am5core: typeof import('@amcharts/amcharts5');
  am5charts: typeof import('@amcharts/amcharts5/xy');
  am5lang: {
    'en-DE': typeof import('@amcharts/amcharts5/locales/de_DE');
    'en-UK': typeof import('@amcharts/amcharts5/locales/en');
    'en-US': typeof import('@amcharts/amcharts5/locales/en_US');
  };
}

@Injectable({
  providedIn: 'root',
})
export class AmCharts5Service {
  public readonly modulesV5: Observable<AmCharts5ImportedModules>;
  private readonly modulesV5Subject: Subject<AmCharts5ImportedModules>;

  constructor() {
    this.modulesV5Subject = new Subject<AmCharts5ImportedModules>();
    this.modulesV5 = this.modulesV5Subject.asObservable().pipe(
      filter((m) => m !== null),
      take(1)
    );
    // dynamically import modules for greatly reduced initial build sized
    Promise.all([
      // webpack magic comments to create a dedicated chunk for am charts
      import(/* webpackChunkName: "amcharts" */ '@amcharts/amcharts5'),
      import(/* webpackChunkName: "amcharts" */ '@amcharts/amcharts5/xy'),
      import(/* webpackChunkName: "amcharts" */ '@amcharts/amcharts5/map'),
      import(/* webpackChunkName: "amcharts" */ '@amcharts/amcharts5/locales/en_US'),
      import(/* webpackChunkName: "amcharts" */ '@amcharts/amcharts5/locales/de_DE'),
      import(/* webpackChunkName: "amcharts" */ '@amcharts/amcharts5/locales/en'),
    ])
      .then((modules) => {
        // extract amCharts modules from dynamic import
        const am5core = modules[0];
        am5core.disposeAllRootElements();
        am5core.addLicense('AM5C275830199'); // KEY CHARTS
        am5core.addLicense('AM5M275830199'); // KEY MAPS
        const am5charts = modules[1];
        const am5locales_en_US = modules[3];
        const am5locales_de_DE = modules[4];
        const am5locales_en = modules[5];

        // pack into typed interface
        const importedModules: AmCharts5ImportedModules = {
          am5core,
          am5charts,
          am5lang: {
            'en-DE': am5locales_de_DE,
            'en-UK': am5locales_en,
            'en-US': am5locales_en_US,
          },
        };
        // save imported modules
        this.modulesV5Subject.next(importedModules);
      })
      .catch((e) => {
        console.error('Error during amCharts dynamic import', e);
      });
  }
}
