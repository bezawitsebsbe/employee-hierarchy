import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthGuard } from './auth/auth-guard';
import { HierarchyComponent } from './hierarchy/hierarchy.component';
import { CreatePositionComponent } from './positions/create-position/create-position.component';
import { EditPositionComponent } from './positions/edit-position/edit-position.component';
import { PositionDetailComponent } from './position-detail/position-detail.component';
import { DepartmentsComponent } from './departments/departments.component';
import { TotalPositionsComponent } from './total-positions/total-positions.component';  

 export const routes: Routes = [
   { path: '', redirectTo: '/login', pathMatch: 'full' },
   { path: 'login', component: LoginComponent },
   { path: 'signup', component: SignupComponent },
   {
     path: 'dashboard',
     component: DashboardComponent,
     canActivate: [AuthGuard],
   },
   {
     path: 'hierarchy',
     component: HierarchyComponent,
     canActivate: [AuthGuard],
   },
   {
     path: 'positions/create',
     component: CreatePositionComponent,
     canActivate: [AuthGuard],
   },
   {
     path: 'positions/:id/edit',
     component: EditPositionComponent,
     canActivate: [AuthGuard],
   },
   {
     path: 'positions/:id',
     component: PositionDetailComponent,
     canActivate: [AuthGuard],
   }, // detail
   {
     path: 'departments',
     component: DepartmentsComponent,
     canActivate: [AuthGuard],
   }, // departments
   {
     path: 'positions',
     component: TotalPositionsComponent,
     canActivate: [AuthGuard],
   },
   // We'll add dashboard, hierarchy, etc. later
   { path: '**', redirectTo: '/login' },
 ];



