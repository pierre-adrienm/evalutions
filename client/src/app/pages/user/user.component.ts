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
  userName: string = 'Utilisateur'; 
  activeDropdown: number | null = null;
  notes: number[] = Array.from({ length: 17 }, (_, i) => i);
  notesMap: { [key: number]: number } = {};

  constructor(private userService: UserService) {}

  ngOnInit() {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      this.userId = parseInt(storedUserId, 10);
    }

    this.userService.getUserName(this.userId).subscribe(
      (response) => {
        if (Array.isArray(response) && response.length > 0) {
          this.userName = `${response[0].prenom} ${response[0].nom}`;
        } else {
          console.error('Réponse inattendue:', response);
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération du nom:', error);
      }
    );
  
    this.userService.getUserQuestions(this.userId).subscribe(
      (response) => {
        this.questions = response.questions.map((q: { id_question: number, note: any }) => ({
          ...q,
          selectedNote: q.note ?? null
        }));
        this.questions.forEach(q => this.getNote(q.id_question)); // Récupère la note de chaque question
      },
      (error) => {
        console.error('Erreur lors de la récupération des questions:', error);
      }
    );
  }
  
  toggleDropdown(questionId: number) {
    this.activeDropdown = this.activeDropdown === questionId ? null : questionId;
  }

  getNote(questionId: number) {
    this.userService.getNote(questionId, this.userId).subscribe(
      (response) => {
        this.notesMap[questionId] = response.note; // Stocke la note récupérée
        const question = this.questions.find(q => q.id_question === questionId);
        if (question) {
          question.selectedNote = response.note; // Met à jour l'affichage
        }
      },
      (error) => {
        console.error(`Erreur lors de la récupération de la note pour la question ${questionId}:`, error);
      }
    );
  }
  

  setNote(questionId: number, note: number) {
    console.log(`Note ${note} attribuée à la question ${questionId}`);
    this.userService.saveNote(questionId, this.userId, note).subscribe(() => {
      console.log('Note enregistrée avec succès');
    });
  }
}
