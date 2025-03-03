import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { AdminComponent } from './pages/admin/admin.component';
import { AuthGuard } from './guard/auth.guard';
import { UserComponent } from './pages/user/user.component';
import { ProfilUserComponent } from './pages/profil-user/profil-user.component';

export const routes: Routes = [
    {path:'', component: LoginComponent},
    {path:'admin/:id', component: AdminComponent, canActivate: [AuthGuard]},
    {path:'user/:id', component: UserComponent, canActivate: [AuthGuard]},
    {path:'profiluser/:id', component:ProfilUserComponent, canActivate: [AuthGuard]},
    {path:'unauthorized', component: UnauthorizedComponent}
];
