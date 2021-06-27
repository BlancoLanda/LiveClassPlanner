import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginMainPageRoutingModule } from './login-main-routing.module';

import { LoginMainPage } from './login-main.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginMainPageRoutingModule
  ],
  declarations: [LoginMainPage]
})
export class LoginMainPageModule {}
