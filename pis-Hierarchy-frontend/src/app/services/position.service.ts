import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Position {
  id: number;
  name: string;
  description: string;
  parentId: number | null;
}

@Injectable({ providedIn: 'root' })
export class PositionService {
  private apiUrl = `${environment.apiUrl}/api/positions`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Position[]> {
    return this.http.get<Position[]>(this.apiUrl).pipe(
      tap((data) => console.log('All positions:', data)),
      catchError((err) => {
        console.error('getAll error:', err);
        return of([]);
      }),
    );
  }

  getById(id: number): Observable<Position> {
    return this.http.get<Position>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => {
        console.error('getById error:', err);
        throw err;
      }),
    );
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  create(position: Omit<Position, 'id'>): Observable<Position> {
    return this.http.post<Position>(this.apiUrl, position);
  }

  update(id: number, position: Position): Observable<Position> {
    return this.http.put<Position>(`${this.apiUrl}/${id}`, position);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getByDepartment(departmentName: string): Observable<Position[]> {
    return this.getAll().pipe(
      map((positions) =>
        positions.filter(
          (p) =>
            p.name === departmentName ||
            p.parentId === positions.find((dep) => dep.name === departmentName)?.id,
        ),
      ),
    );
  }
}
