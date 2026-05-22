import { Component, OnInit, ChangeDetectorRef, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TreeNode } from 'primeng/api';
import { PositionService, Position } from '../services/position.service'; // Added Position import
import { AuthService } from '../services/auth.service';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-hierarchy',
  standalone: true,
  imports: [CommonModule, OrganizationChartModule],
  templateUrl: './hierarchy.component.html',
  styleUrls: ['./hierarchy.component.css'],
})
export class HierarchyComponent implements OnInit {
  @ViewChild('orgNodes', { static: true }) orgNodes!: TemplateRef<any>;
  treeNodes: TreeNode[] = [];
  currentUserName: string = 'User';
  isLoading = true;
  errorMessage: string | null = null;
  constructor(
    private positionService: PositionService,
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    this.currentUserName = this.authService.getCurrentUser() || 'User';
    this.loadHierarchy();
  } // FIX: Changed from 'private' to 'public' so the HTML template can access it
  public loadHierarchy(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.positionService.getAll().subscribe({
      next: (positions) => {
        console.log('Hierarchy received:', positions);
        if (!positions || positions.length === 0) {
          this.treeNodes = [];
          this.errorMessage = 'No positions found in the organization.';
        } else {
          this.treeNodes = this.buildTree(positions);
        }
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Hierarchy load failed:', err);
        this.errorMessage = 'Failed to load hierarchy data. Please try again.';
        this.isLoading = false;
        this.cd.detectChanges();
      },
    });
  } // Refactor: Typed 'positions' as Position[] instead of any[]
  private buildTree(positions: Position[]): TreeNode[] {
    const map = new Map<number, TreeNode>();
    const roots: TreeNode[] = []; // 1. Create all nodes
    positions.forEach((p) => {
      map.set(p.id, {
        label: p.name,
        type: 'person',
        styleClass: 'p-person',
        expanded: true,
        data: { ...p },
        children: [],
      });
    }); // 2. Link children to parents
    positions.forEach((p) => {
      const node = map.get(p.id);
      if (!node) return;
      if (p.parentId) {
        const parent = map.get(Number(p.parentId));
        if (parent) {
          parent.children!.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });
    return roots;
  }
  goToDetail(id: number): void {
    if (id) this.router.navigate(['/positions', id]);
  }
  onAddPositionClick(): void {
    this.router.navigate(['/positions/create']);
  }
  goBackToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
  logout(): void {
    this.authService.logout();
  }
}
