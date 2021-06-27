import { Component } from '@angular/core';
import { NavparamService } from '../../../navparam.service';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.page.html',
  styleUrls: ['./activities.page.scss'],
})
export class ActivitiesPage {

  scenario : any = {};

  constructor(private navParamService : NavparamService) { 
    this.initializeData();
  }

  public async initializeData() {
    this.scenario = await this.navParamService.getNavData();
  }

}
