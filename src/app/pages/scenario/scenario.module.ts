import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ScenarioPageRoutingModule } from './scenario-routing.module';

import { ScenarioPage } from './scenario.page';

import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    ScenarioPageRoutingModule
  ],
  declarations: [ScenarioPage]
})
export class ScenarioPageModule {}
