import { Component, OnInit } from '@angular/core';
import { NavparamService } from '../../../navparam.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {

  scenario : any = {};

  constructor(private navParamService : NavparamService) { }

  ngOnInit() {
    this.initializeData();
  }

  public async initializeData() {
    this.scenario = await this.navParamService.getNavData();
  }

}
