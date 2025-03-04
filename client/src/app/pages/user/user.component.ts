import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {

  questions: any[] = [];
  userId: number = 1;
  activeDropdown: number | null = null;
  notes: number[] = Array.from({ length: 17 }, (_, i) => i);

  constructor(private userService: UserService) {}

  ngOnInit() {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      this.userId = parseInt(storedUserId, 10);
    }

    this.userService.getUserQuestions(this.userId).subscribe(
      (response) => {
        this.questions = response.questions.map((q: { note: any; }) => ({
          ...q,
          selectedNote: q.note ?? null
        }));
      },
      (error) => {
        console.error('Erreur lors de la récupération des questions:', error);
      }
    );
  }

  toggleDropdown(questionId: number) {
    this.activeDropdown = this.activeDropdown === questionId ? null : questionId;
  }

  setNote(questionId: number, note: number) {
    console.log(`Note ${note} attribuée à la question ${questionId}`);
    this.userService.saveNote(questionId, this.userId, note).subscribe(() => {
      console.log('Note enregistrée avec succès');
    });
  }
}
