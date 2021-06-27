import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginTeacherPageRoutingModule } from './login-teacher-routing.module';

import { LoginTeacherPage } from './login-teacher.page';

import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    LoginTeacherPageRoutingModule,
    ComponentsModule
  ],
  declarations: [LoginTeacherPage]
})
export class LoginTeacherPageModule {}
