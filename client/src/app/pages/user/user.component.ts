import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {

  questions: any[] = [];
  userId: number = 1;

  constructor(private userService: UserService) {}

  ngOnInit() {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      this.userId = parseInt(storedUserId, 10);
    }
  
    this.userService.getUserQuestions(this.userId).subscribe(
      (response) => {
        this.questions = response.questions;
      },
      (error) => {
        console.error('Erreur lors de la récupération des questions:', error);
      }
    );
  }  
}
