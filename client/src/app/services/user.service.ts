import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getUserQuestions(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}/questions`);
  }

  saveNote(questionId: number, userId: number, note: number): Observable<any> {
    const body = { questionId, userId, note };
    return this.http.put(`${this.apiUrl}/question/${questionId}/user/${userId}`, body);
  }  
}
