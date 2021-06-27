import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TimetablePageRoutingModule } from './timetable-routing.module';

import { TimetablePage, HoursMinutesPipe } from './timetable.page';

import { ComponentsModule } from '../../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TimetablePageRoutingModule,
    ComponentsModule
  ],
  declarations: [TimetablePage, HoursMinutesPipe]
})
export class TimetablePageModule {}
