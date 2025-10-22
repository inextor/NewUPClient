import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-panel-informativo',
  templateUrl: './panel-informativo.component.html',
  styleUrls: ['./panel-informativo.component.css'],
  standalone: true,
  imports: [NgxChartsModule, HeaderComponent, RouterModule]
})
export class PanelInformativoComponent implements OnInit {

  inversionPorDepartamento: any;
  dotacionPersonalUniformado: any;
  costoPorColaborador: any;
  uniformidadPorDepartamento: any;
  monthlyData: any;
  prendasMayorRotacion: any;
  indiceReposicion: any;
  variacionPersonalUniformado: any;

  constructor() {
    this.inversionPorDepartamento = this.getChartOptions(['#337ab7']);
    this.dotacionPersonalUniformado = this.getChartOptions(['#003366']);
    this.costoPorColaborador = this.getChartOptions(['#003366']);
    this.uniformidadPorDepartamento = this.getChartOptions(['#337ab7', '#003366', '#5bc0de', '#0275d8']);
    this.monthlyData = this.getChartOptions(['#003366']);
    this.prendasMayorRotacion = this.getChartOptions(['#003366']);
    this.indiceReposicion = this.getChartOptions(['#003366', '#5bc0de']);
    this.variacionPersonalUniformado = this.getChartOptions(['#003366', '#d9534f']);
  }

  ngOnInit(): void {
    this.inversionPorDepartamento.results = [
      { name: 'Recepción', value: 53500 },
      { name: 'Mantenimiento', value: 42700 },
      { name: 'Médico veterinario', value: 37800 },
      { name: 'Estética', value: 24300 },
      { name: 'Administration', value: 20400 }
    ];

    this.dotacionPersonalUniformado.results = [
      { name: 'Recepción', value: 57 },
      { name: 'Mantenimiento', value: 45 },
      { name: 'Médico veterinario', value: 37 },
      { name: 'Estética', value: 26 },
      { name: 'Administración', value: 20 }
    ];

    this.costoPorColaborador.results = [
      { name: 'Recepción', value: 180 },
      { name: 'Mantenimiento', value: 250 },
      { name: 'Médico veterinario', value: 430 },
      { name: 'Estética', value: 230 },
      { name: 'Administración', value: 310 }
    ];

    this.uniformidadPorDepartamento.results = [
      { name: 'Recepción', value: 85 },
      { name: 'Mantenimiento', value: 85 },
      { name: 'Médico veterinario', value: 80 },
      { name: 'Estética', value: 90 }
    ];

    this.monthlyData.results = [
      {
        name: 'Monthly Data',
        series: [
          { name: 'Enero', value: 32700 },
          { name: 'Febrero', value: 8500 },
          { name: 'Marzo', value: 41200 },
          { name: 'Abril', value: 20900 },
          { name: 'Mayo', value: 28600 },
          { name: 'Junio', value: 446300 },
          { name: 'Julio', value: 314400 },
          { name: 'Agosto', value: 23000 },
          { name: 'Septiembre', value: 29800 },
          { name: 'Octubre', value: 294500 },
          { name: 'Noviembre', value: 30200 }
        ]
      }
    ];

    this.prendasMayorRotacion.results = [
      { name: 'Chamarra', value: 250 },
      { name: 'Camisa', value: 190 },
      { name: 'Pantalón', value: 150 },
      { name: 'Filipina', value: 110 },
      { name: 'Playera', value: 80 }
    ];

    this.indiceReposicion.results = [
      { name: 'Reposición por desgaste', value: 70 },
      { name: 'Nueva dotación', value: 30 }
    ];

    this.variacionPersonalUniformado.results = [
      { name: 'Recepción', value: 3 },
      { name: 'Mantenimiento', value: 6 },
      { name: 'Médico veterinario', value: 4 },
      { name: 'Estética', value: -1 },
      { name: 'Administración', value: -2 }
    ];
  }

  getChartOptions(colors: string[]): any {
    return {
      results: [],
      scheme: { domain: colors },
      gradient: false,
      xAxis: true,
      yAxis: true,
      legend: true,
      showXAxisLabel: true,
      showYAxisLabel: true,
      xAxisLabel: '',
      yAxisLabel: '',
      roundEdges: true,
      labels: true,
      doughnut: false,
      legendPosition: 'below',
      timeline: false
    };
  }
}
