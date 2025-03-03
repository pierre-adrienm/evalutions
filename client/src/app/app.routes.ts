import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';

export const routes: Routes = [
    {path:'', component: LoginComponent},
    {path:'/unauthorized', component: UnauthorizedComponent}
];
