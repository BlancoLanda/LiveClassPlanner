import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginTeacherPage } from './login-teacher.page';

const routes: Routes = [
  {
    path: '',
    component: LoginTeacherPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginTeacherPageRoutingModule {}
