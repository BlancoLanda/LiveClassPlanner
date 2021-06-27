import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginStudentPageRoutingModule } from './login-student-routing.module';

import { LoginStudentPage } from './login-student.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    LoginStudentPageRoutingModule,
    ComponentsModule
  ],
  declarations: [LoginStudentPage]
})
export class LoginStudentPageModule {}
