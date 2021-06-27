import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateClassroomPageRoutingModule } from './create-classroom-routing.module';

import { CreateClassroomPage } from './create-classroom.page';
import { ComponentsModule } from '../../components/components.module';

import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    IonicModule,
    CreateClassroomPageRoutingModule,
    ComponentsModule
  ],
  declarations: [CreateClassroomPage]
})
export class CreateClassroomPageModule {}
