import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';

  private userIdSubject = new BehaviorSubject<number | null>(null);
  userId$ = this.userIdSubject.asObservable();

  constructor() {
    const storedId = this.getStoredUserId();
    if (storedId !== null) {
      this.userIdSubject.next(storedId);
    }
  }

  private getStoredUserId(): number | null {
    const storedUserId = localStorage.getItem('userId');
    return storedUserId ? +storedUserId : null;
  }

  get storedUserId(): number | null {
    return this.getStoredUserId();
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<{ user: { id_user: number }, token: string }>(
      `${this.apiUrl}/login`, { email, password }, { withCredentials: true }
    ).pipe(
      tap(response => {
        console.log('Réponse complète du serveur:', response); // Voir la réponse brute
  
        if (response && response.user && response.user.id_user) {
          localStorage.setItem('userId', response.user.id_user.toString());
          this.userIdSubject.next(response.user.id_user);
          console.log('User ID stocké après connexion:', localStorage.getItem('userId'));
        } else {
          console.error('Aucune propriété user.id_user trouvée dans la réponse du serveur');
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usertype');
    localStorage.removeItem('userId');  
    this.userIdSubject.next(null); // Mettre l'ID à null après déconnexion
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}
