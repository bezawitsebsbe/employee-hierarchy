import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PositionService } from '../../services/position.service'; // adjust path
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-position',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-position.component.html',
  styleUrls: ['./create-position.component.css'],
})
export class CreatePositionComponent implements OnInit {
  positionForm: FormGroup;
  parentPositions: any[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  currentUserName: string = 'User';

  constructor(
    private fb: FormBuilder,
    private positionService: PositionService,
    private router: Router,
    private authService: AuthService,
  ) {
    this.positionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      parentId: [null],
    });
  }

  ngOnInit(): void {
    this.currentUserName = this.authService.getCurrentUser() || 'User';
    console.log('Create page loaded - fetching parents');

    this.positionService.getAll().subscribe({
      next: (positions) => {
        console.log('PARENTS LOADED – full data:', positions);
        console.log('Number of parents:', positions.length);
        this.parentPositions = positions;
        console.log('Assigned to dropdown:', this.parentPositions);
      },
      error: (err) => {
        console.error('Parent fetch FAILED:', err);
        this.errorMessage = 'Cannot load parent positions';
      },
    });
  } 

  onSubmit(): void {
    if (this.positionForm.invalid) {
      this.positionForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const newPosition = this.positionForm.value;

    this.positionService.create(newPosition).subscribe({
      next: () => {
        alert('Position created successfully!');
        this.router.navigate(['/hierarchy']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create position';
        this.isLoading = false;
      },
    });
  }
}
