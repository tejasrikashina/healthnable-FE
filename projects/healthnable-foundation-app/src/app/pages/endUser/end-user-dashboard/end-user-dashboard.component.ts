import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { PrimeNGModule } from '../../../material/primeng.module';
import { TableComponent } from '../../../core-components/table/table.component';

@Component({
  selector: 'app-end-user-dashboard',
  standalone: true,
  imports: [
    MaterialModule,
    TableComponent,
    HeaderComponent,
    TranslateModule,
    CommonModule,
    PrimeNGModule,
  ],
  templateUrl: './end-user-dashboard.component.html',
  styleUrl: './end-user-dashboard.component.scss',
})
export class EndUserDashboardComponent implements OnInit {
    options: any;
  data: any;
  data1:any
   displayedColumns: string[] = ['patient', 'ready', 'status'];
  options1:any
  ngOnInit(): void {
    this.initChart();
  }
  initChart() {
    this.data = {
      labels: ['ICU', 'Surgery', 'ED'],
      datasets: [
        {
         label: 'Avg Time to Bed Assignment (hrs)',
        data: [13, 8, 5], 
        backgroundColor: ['#03C9D7', '#FFA600', '#f20808'],
        borderWidth: 1,
        },
      ],
    };
    this.data1={
        labels: ['Mon', 'Tue', 'Wed','Thu','Fri','Sat','Sun'],
      datasets: [
         {
      label: 'Discharged',
      data: [10], 
      backgroundColor: '#A1F9FF',
      borderWidth: 1,
        pointStyle: 'circle',
    },
    {
      label: 'Transfers',
      data: [20], 
      backgroundColor: '#FF9271',
      borderWidth: 1,
    },
    {
      label: 'Admission',
      data: [15], 
      backgroundColor: '#03C9D7',
      borderWidth: 1,
    },
      ],
    }
  this.options = {
    indexAxis: 'y', 
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        max: 35,
        ticks: {
          stepSize: 5,
          color: 'black',
        },
        grid: {
          color: 'black',
        },
       
      },
      y: {
        ticks: {
          color: 'black',
        },
        grid: {
          color: 'black',
        },
      },
    },
  };
   this.options1 = {
    indexAxis: 'x', 
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        max: 35,
        ticks: {
          stepSize: 5,
          color: 'black',
        },
        grid: {
          color: 'black',
        },
        
      },
      y: {
        ticks: {
          color: 'black',
        },
        grid: {
          color: 'black',
        },
      },
    },
  };
  }

  cardHeaders = [
    { header: 'Admissions Today', headerData: '135' },
    { header: 'Transfers Today', headerData: '42' },
    {
      header: 'Discharges Today',
      headerData: '90',
    },
  ];
  isCardVisible: boolean = false;
  isRoleActive: boolean = false;
  currentCategory: string = '';
  searchSpeciality: string = '';
  facility = [{ label: 'Mercy Gen', selected: false }];
  functionalType = [
    { label: 'Clinical', selected: false },
    { label: 'Surgical', selected: false },
    { label: 'Admin', selected: false },
    { label: 'Mixed', selected: false },
  ];
  status = [
    { label: 'Active', selected: false },
    { label: 'Inactive', selected: false },
  ];
  showFloorDetails(category: string) {
    this.currentCategory = category;
    this.isRoleActive = true;
  }
  toggleCardVisibility() {
    this.isCardVisible = !this.isCardVisible;
    if (!this.isCardVisible) {
      this.isRoleActive = false;
      this.currentCategory = '';
    }
  }
  selectedCategory: string = '';
  onClick(category: string) {
    this.selectedCategory = category;
  }
}
