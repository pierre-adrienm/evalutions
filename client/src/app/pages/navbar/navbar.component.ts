import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  userId: number | null = null;

  constructor(
    private router:Router, 
    private loginService: LoginService
  ){}

  ngOnInit(): void {
    // Vérifie d'abord l'ID stocké
    const storedId = this.loginService.storedUserId;
    if (storedId !== null) {
      this.userId = storedId;
    }
  
    // Écoute les changements pour garantir la mise à jour en cas de connexion
    this.loginService.userId$.subscribe(id => {
      console.log('Navbar - User ID updated:', id); // Debug
      this.userId = id;
    });
  }

  isNotLoginPage():boolean{
    const url = this.router.url;
    return!(
      url === '/' ||
      url === '/unauthorized'
    );
  }

  logout(): void {
    this.loginService.logout().subscribe(() => {
      this.router.navigateByUrl('/');
    });
  }
}
