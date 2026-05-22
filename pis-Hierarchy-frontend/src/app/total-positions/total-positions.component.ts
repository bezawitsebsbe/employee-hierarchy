import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { PositionService } from '../../app/services/position.service';
import { AuthService } from '../../app/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-total-positions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './total-positions.component.html',
  styleUrls: ['./total-positions.component.css'],
})
export class TotalPositionsComponent implements OnInit {
  positions: any[] = [];
  positions$!: Observable<any[]>;
  currentUserName: string = 'User';

  constructor(
    private positionService: PositionService,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.currentUserName = this.authService.getCurrentUser() || 'User';

    // Expose observable for template async binding
    this.positions$ = this.positionService.getAll();
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
  }
}
