import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { PositionService } from '../../app/services/position.service';
import { AuthService } from '../../app/services/auth.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.css'],
})
export class DepartmentsComponent implements OnInit {

  departments$!: Observable<any[]>;
  currentUserName: string = 'User';

  constructor(
    private positionService: PositionService,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.currentUserName = this.authService.getCurrentUser() || 'User';

    // Observable-based pipeline so template can bind with async
    this.departments$ = this.positionService.getAll().pipe(
      map((positions) => {
        // Treat top-level positions (no parentId) as roots, departments are their direct children
        const rootIds = positions
          .filter((p: any) => !p.parentId)
          .map((p: any) => p.id);

        const result = positions.filter(
          (p: any) => p.parentId && rootIds.includes(p.parentId),
        );

        console.log('DEPARTMENTS COMPONENT → departments:', result);
        return result;
      }),
    );
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
  }
}
