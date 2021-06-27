import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateClassroomPage } from './create-classroom.page';

const routes: Routes = [
  {
    path: '',
    component: CreateClassroomPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateClassroomPageRoutingModule {}
