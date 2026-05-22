import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PositionService } from '../../services/position.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../app/services/auth.service';

@Component({
  selector: 'app-edit-position',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-position.component.html',
  styleUrls: ['./edit-position.component.css'],
})
export class EditPositionComponent implements OnInit {
  positionForm: FormGroup;
  positionId!: number;
  parentPositions: any[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  showDeleteModal = false;
  currentUserName: string = 'User';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private positionService: PositionService,
    private authService: AuthService,
  ) {
    this.positionForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      parentId: [null],
    });
  }

  ngOnInit(): void {
    this.positionId = Number(this.route.snapshot.paramMap.get('id'));
    this.currentUserName = this.authService.getCurrentUser() || 'User';

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
  }

  onSubmit(): void {
    if (this.positionForm.invalid) return;

    this.isLoading = true;
    const updated = { ...this.positionForm.value, id: this.positionId };

    this.positionService.update(this.positionId, updated).subscribe({
      next: () => {
        this.router.navigate(['/hierarchy']);
      },
      error: (err) => {
        this.errorMessage = 'Update failed';
        this.isLoading = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
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
}
