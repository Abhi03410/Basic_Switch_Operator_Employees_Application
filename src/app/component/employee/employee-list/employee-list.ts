import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import type { ChartData, ChartOptions } from 'chart.js';
import type { EmployeeRecord } from '../../../model/employeeRecord';
import { Shared } from '../../../service/shared';
import { EmployeeDetails } from '../employee-details/employee-details';
import { DialogModule } from 'primeng/dialog';

interface EmployeeOption {
  id: string;
  employeeName: string;
  profileImage: string;
}

@Component({
  selector: 'app-employee-list',
  imports: [ChartModule, CardModule, FormsModule, SelectModule, EmployeeDetails, DialogModule,],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeList implements OnInit {
  private readonly sharedService = inject(Shared);

  readonly employeesDetailsLists = signal<EmployeeRecord[]>([]);
  readonly selectedEmployee = signal<EmployeeOption | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  // dialog box open with employees details:-
  displayEmployeeDetailsDialog = false;
  selectedEmployeeDetails: WritableSignal<any> = signal<any>(null);

  readonly totalEmployeeCount = computed(() => this.employeesDetailsLists().length);
  readonly employeeOptions = computed<EmployeeOption[]>(() =>
    this.employeesDetailsLists().map((employee) => ({
      id: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      profileImage: employee.profileImage,
    }))
  );
  readonly selectedEmployeeId = computed(() => this.selectedEmployee()?.id ?? null);
  readonly employeesForCharts = computed(() => {
    const employees = this.employeesDetailsLists();
    const selectedId = this.selectedEmployeeId();
    return selectedId === null
      ? employees
      : employees.filter((employee) => employee.id === selectedId);
  });
  readonly chartEmployeeCount = computed(() => this.employeesForCharts().length);

  ngOnInit(): void {
    this.sharedService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employeesDetailsLists.set(employees);
        // console.log('Fetched employeesDetailsLists :', this.employeesDetailsLists());
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading employee analytics:', error);
        this.errorMessage.set('Unable to load employee analytics. Please try again later.');
        this.isLoading.set(false);
      },
    });
  }

  // ======================================
  // Employee Analytics Charts
  // ======================================

  // 1. Employees by Department
  departmentChartData = computed<ChartData<'bar'>>(() => {
    const employees = this.employeesForCharts();

    const counts: Record<string, number> = {};

    employees.forEach(emp => {
      const department = emp.department || 'Other';
      counts[department] = (counts[department] || 0) + 1;
    });

    return {
      labels: Object.keys(counts),
      datasets: [
        {
          label: 'Employees',
          data: Object.values(counts),
          backgroundColor: '#3B82F6',
          borderRadius: 6
        }
      ]
    };
  });


  // 2. Active vs Inactive Employees
  employeeStatusChartData = computed<ChartData<'doughnut'>>(() => {
    const employees = this.employeesForCharts();

    const active = employees.filter(emp => emp.isActive === true).length;
    const inactive = employees.filter(emp => emp.isActive === false).length;

    return {
      labels: ['Active', 'Inactive'],
      datasets: [
        {
          data: [active, inactive],
          backgroundColor: ['#22C55E', '#EF4444'],
          hoverOffset: 8
        }
      ]
    };
  });


  // 3. Employees by Employment Type
  employmentTypeChartData = computed<ChartData<'pie'>>(() => {
    const employees = this.employeesForCharts();

    const counts: Record<string, number> = {};

    employees.forEach(emp => {
      const type = emp.employmentType || 'Other';
      counts[type] = (counts[type] || 0) + 1;
    });

    return {
      labels: Object.keys(counts),
      datasets: [
        {
          data: Object.values(counts),
          backgroundColor: [
            '#3B82F6',
            '#F59E0B',
            '#8B5CF6',
            '#14B8A6'
          ]
        }
      ]
    };
  });


  // 4. Employees by Designation
  designationChartData = computed<ChartData<'bar'>>(() => {
    const employees = this.employeesForCharts();

    const counts: Record<string, number> = {};

    employees.forEach(emp => {
      const designation = emp.designation || 'Other';
      counts[designation] = (counts[designation] || 0) + 1;
    });

    return {
      labels: Object.keys(counts),
      datasets: [
        {
          label: 'Employees',
          data: Object.values(counts),
          backgroundColor: '#8B5CF6',
          borderRadius: 5
        }
      ]
    };
  });


  // ======================================
  // Chart Options
  // ======================================

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  designationChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  onNavigateEmpDetails(empId: string) {
    // console.log('Navigating to employee details for empCode:', empId);
    const mySpeicifcEmpIdDetails = this.employeesDetailsLists().find(emp => emp.id === empId);

    if (mySpeicifcEmpIdDetails) {
      // console.log('mySpeicifcEmpIdDetails :', mySpeicifcEmpIdDetails);
      this.selectedEmployeeDetails.set(mySpeicifcEmpIdDetails);
      this.displayEmployeeDetailsDialog = true
    } else {
      console.log('No employee found with empCode:', empId);
    }

  }
}
