import { Component, OnInit, ViewChild } from '@angular/core';
import { IonTextarea } from '@ionic/angular';
import { NavparamService } from '../../../../navparam.service';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from "firebase/app";
import 'firebase/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../../../storage.service';

@Component({
  selector: 'app-add-annotation',
  templateUrl: './add-annotation.page.html',
  styleUrls: ['./add-annotation.page.scss'],
})
export class AddAnnotationPage implements OnInit {

  @ViewChild('annotation', { static: false }) annotation: IonTextarea;
  scenario : any = {};
  role : any;
  elapsedTime : any;
  currentActivity: any;
  user_id: any;
  user_name: any;

  constructor(private navParamService : NavparamService, private firestore : AngularFirestore, private router : Router, private storageService : StorageService, private route : ActivatedRoute) { }

  // Get current activity and elapsed time from URL.
  ngOnInit() {
    this.initializeData();
    this.currentActivity = this.route.snapshot.paramMap.get('id').split("-")[0];
    this.elapsedTime = this.route.snapshot.paramMap.get('id').split("-")[1];
  }

  public async initializeData() {
    this.scenario = await this.navParamService.getNavData();
    this.role = await this.storageService.get('role');
    this.user_id = await this.storageService.get('user_id');
    this.user_name = await this.storageService.get('name');
  }

  publish() {

    // Annotation object to be added to the database
    const annotationObject = {
      created: firebase.firestore.Timestamp.now(),
      text: this.annotation.value,
      activity: this.currentActivity,
      elapsedClassTime: this.elapsedTime
    }

    // Event object to be added to the database (and "Events" segment)
    const annEventObject = {
      created: firebase.firestore.Timestamp.now(),
      text: this.annotation.value,
      activity: this.currentActivity,
      elapsedClassTime: this.elapsedTime,
      type: "annotation",
      teacher_name: this.user_name,
      role: "teacher"
    }

    // On submit, push data to the database.

    if(this.role=="teacher") {
      this.firestore.collection('classrooms').doc(this.scenario.pin).update({
        annotations: firebase.firestore.FieldValue.arrayUnion(annotationObject),
        events: firebase.firestore.FieldValue.arrayUnion(annEventObject)
    }).then( () => {
      this.router.navigate([`/scenario/${this.scenario.pin}/timetable/`]);
    });
    } else {
      this.firestore.collection('classrooms').doc(this.scenario.pin).update({
        [`student_annotations.${this.user_id}`]: firebase.firestore.FieldValue.arrayUnion(annotationObject)
    }).then( () => {
      this.router.navigate([`/scenario/${this.scenario.pin}/timetable/`]);
    });
    }

  }


}
