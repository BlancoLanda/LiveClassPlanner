import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddAnnotationPageRoutingModule } from './add-annotation-routing.module';

import { AddAnnotationPage } from './add-annotation.page';
import { ComponentsModule } from '../../../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddAnnotationPageRoutingModule,
    ComponentsModule
  ],
  declarations: [AddAnnotationPage]
})
export class AddAnnotationPageModule {}
