import { Component, Inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  userId: number | null = null;
  showLogoutModal: boolean = false;

  constructor(
    private router: Router, 
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

  openLogoutModal(): void {
    console.log('Modal ouvert');
    this.showLogoutModal = true;
  }

  closeLogoutModal(): void {
    this.showLogoutModal = false;
  }

  confirmLogout(): void {
    this.loginService.logout().subscribe(() => {
      this.router.navigateByUrl('/');
      this.showLogoutModal = false;
    });
  }
}
