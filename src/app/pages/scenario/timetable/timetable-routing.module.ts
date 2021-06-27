import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TimetablePage } from './timetable.page';

const routes: Routes = [
  {
    path: '',
    component: TimetablePage
  },
  {
    path: 'add-annotation/:id',
    loadChildren: () => import('./add-annotation/add-annotation.module').then( m => m.AddAnnotationPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TimetablePageRoutingModule {}
