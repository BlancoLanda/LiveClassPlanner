import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'login-main',
    loadChildren: () => import('./pages/login-main/login-main.module').then( m => m.LoginMainPageModule)
  },
  {
    path: '',
    redirectTo: 'login-main',
    pathMatch: 'full'
  },
  {
    path: 'create-classroom',
    loadChildren: () => import('./pages/create-classroom/create-classroom.module').then( m => m.CreateClassroomPageModule)
  },
  {
    path: 'login-student',
    loadChildren: () => import('./pages/login-student/login-student.module').then( m => m.LoginStudentPageModule)
  },
  {
    path: 'scenario/:id',
    loadChildren: () => import('./pages/scenario/scenario.module').then( m => m.ScenarioPageModule)
  },
  {
    path: 'login-teacher',
    loadChildren: () => import('./pages/login-teacher/login-teacher.module').then( m => m.LoginTeacherPageModule)
  },
 

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
