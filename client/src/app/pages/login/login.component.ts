import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService } from '../../services/login.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private auth: LoginService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.minLength(3), Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    localStorage.clear();
    this.auth.logout().subscribe({
      next: () => console.log('Utilisateur déconnecté'),
      error: (err) => console.error('Erreur lors de la déconnexion:', err)
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const email = this.email?.value;
      const password = this.password?.value;
  
      if (email && password) {
        this.auth.login(email, password).subscribe({
          next: (response: any) => { 
            const { status, id_user } = response.user;
            localStorage.setItem('token', response.token);
            localStorage.setItem('status', status);
            localStorage.setItem('userId', id_user);
  
            this.router.navigateByUrl(`/${status}/${id_user}`);
          },
          error: (err: any) => { 
            console.error('Login error:', err);
          }
        });
      }
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
