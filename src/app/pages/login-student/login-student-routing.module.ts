import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginStudentPage } from './login-student.page';

const routes: Routes = [
  {
    path: '',
    component: LoginStudentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginStudentPageRoutingModule {}
