import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { RestService } from '../../services/rest.service';

@Component({
  selector: 'app-panel-informativo',
  templateUrl: './panel-informativo.component.html',
  styleUrls: ['./panel-informativo.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, NgxChartsModule]
})
export class PanelInformativoComponent implements OnInit {

  rest = inject(RestService);

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
    // Generate random data first time
    this.generateRandomData();

    // Wait 0.4 seconds, then generate random data again
    setTimeout(() => {
      this.generateRandomData();

      // Wait 0.4 seconds, then generate random data one more time
      setTimeout(() => {
        this.generateRandomData();

        // Wait 0.4 seconds, then load REAL data from backend
        setTimeout(() => {
          this.loadRealData();
        }, 400);
      }, 400);
    }, 400);
  }

  async loadRealData(): Promise<void> {
    const headers = {
      'Authorization': `Bearer ${this.rest.bearer}`
    };

    console.log('Loading chart data from:', this.rest.base_url);
    console.log('Using bearer token:', this.rest.bearer ? 'Token present' : 'NO TOKEN');

    // Helper function to fetch data with error handling
    const fetchChartData = async (url: string, chartName: string): Promise<any> => {
      try {
        console.log(`Fetching ${chartName} from:`, url);
        const response = await fetch(url, { headers });
        console.log(`${chartName} response status:`, response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error loading ${chartName}: HTTP ${response.status}`, errorText);
          return null;
        }
        const data = await response.json();
        console.log(`${chartName} data:`, data);
        return data;
      } catch (error) {
        console.error(`Error loading ${chartName}:`, error);
        return null;
      }
    };

    // Fetch all chart data in parallel with independent error handling
    const [
      inversionData,
      dotacionData,
      costoData,
      uniformidadData,
      monthlyDataResponse,
      prendasData,
      reposicionData,
      variacionData
    ] = await Promise.all([
      fetchChartData(`${this.rest.base_url}/reports/inversion-por-departamento.php`, 'Inversión por Departamento'),
      fetchChartData(`${this.rest.base_url}/reports/dotacion-personal-uniformado.php`, 'Dotación de Personal'),
      fetchChartData(`${this.rest.base_url}/reports/costo-por-colaborador.php`, 'Costo por Colaborador'),
      fetchChartData(`${this.rest.base_url}/reports/uniformidad-por-departamento.php`, 'Uniformidad por Departamento'),
      fetchChartData(`${this.rest.base_url}/reports/monthly-data.php`, 'Monthly Data'),
      fetchChartData(`${this.rest.base_url}/reports/prendas-mayor-rotacion.php`, 'Prendas con Mayor Rotación'),
      fetchChartData(`${this.rest.base_url}/reports/indice-reposicion.php`, 'Índice de Reposición'),
      fetchChartData(`${this.rest.base_url}/reports/variacion-personal-uniformado.php`, 'Variación de Personal')
    ]);

    // Update chart data only if fetch was successful
    if (inversionData) this.inversionPorDepartamento.results = inversionData;
    if (dotacionData) this.dotacionPersonalUniformado.results = dotacionData;
    if (costoData) this.costoPorColaborador.results = costoData;
    if (uniformidadData) this.uniformidadPorDepartamento.results = uniformidadData;
    if (monthlyDataResponse) this.monthlyData.results = monthlyDataResponse;
    if (prendasData) this.prendasMayorRotacion.results = prendasData;
    if (reposicionData) this.indiceReposicion.results = reposicionData;
    if (variacionData) this.variacionPersonalUniformado.results = variacionData;
  }

  generateRandomData(): void {
    // Random investment by department (10k-60k range)
    this.inversionPorDepartamento.results = [
      { name: 'Recepción', value: Math.floor(Math.random() * 50000) + 10000 },
      { name: 'Mantenimiento', value: Math.floor(Math.random() * 50000) + 10000 },
      { name: 'Médico veterinario', value: Math.floor(Math.random() * 50000) + 10000 },
      { name: 'Estética', value: Math.floor(Math.random() * 50000) + 10000 },
      { name: 'Administración', value: Math.floor(Math.random() * 50000) + 10000 }
    ];

    // Random staff allocation (10-70 range)
    this.dotacionPersonalUniformado.results = [
      { name: 'Recepción', value: Math.floor(Math.random() * 60) + 10 },
      { name: 'Mantenimiento', value: Math.floor(Math.random() * 60) + 10 },
      { name: 'Médico veterinario', value: Math.floor(Math.random() * 60) + 10 },
      { name: 'Estética', value: Math.floor(Math.random() * 60) + 10 },
      { name: 'Administración', value: Math.floor(Math.random() * 60) + 10 }
    ];

    // Random cost per employee (100-500 range)
    this.costoPorColaborador.results = [
      { name: 'Recepción', value: Math.floor(Math.random() * 400) + 100 },
      { name: 'Mantenimiento', value: Math.floor(Math.random() * 400) + 100 },
      { name: 'Médico veterinario', value: Math.floor(Math.random() * 400) + 100 },
      { name: 'Estética', value: Math.floor(Math.random() * 400) + 100 },
      { name: 'Administración', value: Math.floor(Math.random() * 400) + 100 }
    ];

    // Random uniformity percentage (60-100 range)
    this.uniformidadPorDepartamento.results = [
      { name: 'Recepción', value: Math.floor(Math.random() * 40) + 60 },
      { name: 'Mantenimiento', value: Math.floor(Math.random() * 40) + 60 },
      { name: 'Médico veterinario', value: Math.floor(Math.random() * 40) + 60 },
      { name: 'Estética', value: Math.floor(Math.random() * 40) + 60 }
    ];

    // Random monthly data (5k-500k range)
    this.monthlyData.results = [
      {
        name: 'Monthly Data',
        series: [
          { name: 'Enero', value: Math.floor(Math.random() * 495000) + 5000 },
          { name: 'Febrero', value: Math.floor(Math.random() * 495000) + 5000 },
          { name: 'Marzo', value: Math.floor(Math.random() * 495000) + 5000 },
          { name: 'Abril', value: Math.floor(Math.random() * 495000) + 5000 },
          { name: 'Mayo', value: Math.floor(Math.random() * 495000) + 5000 },
          { name: 'Junio', value: Math.floor(Math.random() * 495000) + 5000 },
          { name: 'Julio', value: Math.floor(Math.random() * 495000) + 5000 },
          { name: 'Agosto', value: Math.floor(Math.random() * 495000) + 5000 },
          { name: 'Septiembre', value: Math.floor(Math.random() * 495000) + 5000 },
          { name: 'Octubre', value: Math.floor(Math.random() * 495000) + 5000 },
          { name: 'Noviembre', value: Math.floor(Math.random() * 495000) + 5000 }
        ]
      }
    ];

    // Random most rotated items (50-300 range)
    this.prendasMayorRotacion.results = [
      { name: 'Chamarra', value: Math.floor(Math.random() * 250) + 50 },
      { name: 'Camisa', value: Math.floor(Math.random() * 250) + 50 },
      { name: 'Pantalón', value: Math.floor(Math.random() * 250) + 50 },
      { name: 'Filipina', value: Math.floor(Math.random() * 250) + 50 },
      { name: 'Playera', value: Math.floor(Math.random() * 250) + 50 }
    ];

    // Random replacement index (20-80 range for each)
    const desgaste = Math.floor(Math.random() * 60) + 20;
    this.indiceReposicion.results = [
      { name: 'Reposición por desgaste', value: desgaste },
      { name: 'Nueva dotación', value: 100 - desgaste }
    ];

    // Random staff variation (-5 to +10 range)
    this.variacionPersonalUniformado.results = [
      { name: 'Recepción', value: Math.floor(Math.random() * 16) - 5 },
      { name: 'Mantenimiento', value: Math.floor(Math.random() * 16) - 5 },
      { name: 'Médico veterinario', value: Math.floor(Math.random() * 16) - 5 },
      { name: 'Estética', value: Math.floor(Math.random() * 16) - 5 },
      { name: 'Administración', value: Math.floor(Math.random() * 16) - 5 }
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
