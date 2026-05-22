import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PositionService } from '../../app/services/position.service';
import { AuthService } from '../../app/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-position-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './position-detail.component.html',
  styleUrls: ['./position-detail.component.css'],
})
export class PositionDetailComponent implements OnInit {
  positions: any[] = [];
  positionForm: FormGroup;
  positionId!: number;
  errorMessage: string | null = null;
  parentPositions: any[] = [];
  positions$!: Observable<any[]>;
  childrenCount = 0;
  currentUserName: string = 'User';
  showDeleteModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private positionService: PositionService,
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    {
      this.positionForm = this.fb.group({
        name: ['', Validators.required],
        description: [''],
        parentId: [null],
      });
    }
  }

  ngOnInit(): void {
    this.currentUserName = this.authService.getCurrentUser() || 'User';
    this.positionId = Number(this.route.snapshot.paramMap.get('id'));

    // Load position
    this.positionService.getById(this.positionId).subscribe({
      next: (pos) => {
        this.positionForm.patchValue(pos);
      },
      error: () => (this.errorMessage = 'Failed to load position'),
    });

    // Load parents
    this.positionService.getAll().subscribe({
      next: (positions) => {
        this.parentPositions = positions.filter((p) => p.id !== this.positionId);
      },
    });
    
    this.positions$ = this.positionService.getAll();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.positions$ = this.positions$.pipe(
      map((positions) => positions.filter((p) => p.id === id)),
    );
  }

  edit(): void {
    this.positions$.subscribe((positions) => {
      if (positions.length > 0) {
        this.router.navigate(['/positions', positions[0].id, 'edit']);
      }
    });
  }

  goToEdit(): void {
    this.edit();
  }
  onDelete(): void {
    this.showDeleteModal = true;
  }
  confirmDelete(): void {
    this.positionService.delete(this.positionId).subscribe({
      next: () => {
        this.router.navigate(['/hierarchy']);
      },
      error: () => alert('Delete failed'),
    });
  }

  onTotalPositionsClick() {
    this.router.navigate(['/positions']);
  }
}
