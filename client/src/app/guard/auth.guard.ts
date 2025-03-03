import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): boolean {
    const token = localStorage.getItem('token');
    const status = localStorage.getItem('status');
    const userId = localStorage.getItem('userId');

    if(!token || !status || !userId){
      this.router.navigateByUrl('/');
      return false;
    }

    const url = state.url;
    const requestedId = route.paramMap.get('id');;

    // Convertir userId et requestedId en nombre
    const parsedUserId = +userId;
    const parsedRequestedId = requestedId ? +requestedId : null;

    if ((url.startsWith('/admin/') && status !== 'admin') ||
        (url.startsWith('/user/') && status !== 'user')) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    if (parsedRequestedId && parsedRequestedId !== parsedUserId) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}
