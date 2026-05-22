import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../app/services/auth.service';
import { PositionService } from '../../app/services/position.service';
import { Observable ,map } from 'rxjs';
import {AsyncPipe} from "@angular/common";
@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [AsyncPipe],
})
export class DashboardComponent implements OnInit {
  totalPositions = 0;
  departmentsCount = 0;
  currentUserName: string = 'User';
  isLoading = false;

  errorMessage: string | null = null;
  positions$!: Observable<any[]>;
  departments$!: Observable<any[]>;

  constructor(
    private authService: AuthService,
    private positionService: PositionService,
    private router: Router,
  ) {}
  onHierarchyClick() {
    console.log('Hierarchy card clicked – navigating to /hierarchy');
    this.router.navigate(['/hierarchy']);
  }
  onAddPositionClick() {
    this.router.navigate(['/positions/create']);
  }
  onDepartmentsClick() {
    this.router.navigate(['/departments']);
  }

  onTotalPositionsClick() {
    this.router.navigate(['/positions']);
  }

  ngOnInit(): void {
    // Expose observable for template async binding
    this.departments$ = this.positionService.getAll().pipe(
      map((positions) => {
        // Treat top-level positions (no parentId) as roots, departments are their direct children
        const rootIds = positions.filter((p: any) => !p.parentId).map((p: any) => p.id);

        const result = positions.filter((p: any) => p.parentId && rootIds.includes(p.parentId));

        console.log('DEPARTMENTS COMPONENT → departments:', result);
        return result;
      }),
    );

    this.positions$ = this.positionService.getAll();
    this.currentUserName = this.authService.getCurrentUser() || 'User';
    console.log('Dashboard loaded - user:', this.currentUserName);

    this.isLoading = true;
    this.errorMessage = null;

    // Compute stats client-side from all positions so it always
    // matches what other pages show
    this.positionService.getAll().subscribe({
      next: (positions) => {
        console.log('DASHBOARD POSITIONS →', positions);
        this.totalPositions = positions.length;

        const rootIds = positions.filter((p: any) => !p.parentId).map((p: any) => p.id);

        this.departmentsCount = positions.filter(
          (p: any) => p.parentId && rootIds.includes(p.parentId),
        ).length;

        this.isLoading = false;
      },
      error: (err) => {
        console.error('DASHBOARD getAll error →', err);
        this.errorMessage = 'Failed to load data from server';
        this.isLoading = false;
      },
    });

    // Safety timeout: stop loading after 10 seconds no matter what
    setTimeout(() => {
      if (this.isLoading) {
        console.warn('Loading timeout after 10s – forcing stop');
        this.isLoading = false;
        this.errorMessage = 'Server took too long to respond';
      }
    }, 10000);
  }
  retryLoad() {
    this.isLoading = true;
    this.errorMessage = null;
    this.positionService.getAll().subscribe({
      next: (positions) => {
        this.totalPositions = positions.length;

        const rootIds = positions.filter((p: any) => !p.parentId).map((p: any) => p.id);

        this.departmentsCount = positions.filter(
          (p: any) => p.parentId && rootIds.includes(p.parentId),
        ).length;

        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load data. Please try again.';
        this.isLoading = false;
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}