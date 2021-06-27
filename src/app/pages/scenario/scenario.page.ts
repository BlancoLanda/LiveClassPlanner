import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { NavparamService } from '../../navparam.service';
import { StorageService } from '../../storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import firebase from "firebase/app";
import 'firebase/firestore';

@Component({
  selector: 'app-scenario',
  templateUrl: './scenario.page.html',
  styleUrls: ['./scenario.page.scss'],
})

export class ScenarioPage implements OnInit, OnDestroy {

  name: any;
  data: any;
  author: any;
  subjectsArray: any;
  subjects: any = [];
  createdDate: any;
  activitiesDuration: any;
  grade: any;
  description: any;
  activities: any  = [];
  user_id: any;
  role: any;
  user_name: any;
  scenario: any;
  pin: any;
  teacherName: any;
  classroomCreatedDate: any;
  studentList : any = [];
  runningStatus : any; // 0 = "not started", 1 = "live", 2 = "finished"
  activityDurationArray : any = [];
  currentActivity : any;
  classroomSubscription : any;
  scenarioSubscription : any;
  cssTotalWidth : any;

  constructor(private navParamService:NavparamService, private firestore: AngularFirestore, private storageService: StorageService, private route : ActivatedRoute, private router : Router) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.pin = params.get('id');
      this.getScenario();
      this.getClassroomData();
    });
  }

  public viewTimetable() {

    this.router.navigate([`/scenario/${this.pin}/timetable/`]);

  }

  public viewDetails() {

    this.router.navigate([`/scenario/${this.pin}/details/`]);

  }

  public viewActivities() {

    this.router.navigate([`/scenario/${this.pin}/activities/`]);
     
  }

  // For teachers only: Start the classroom session.

  public startClassroom() {

    this.firestore.collection('classrooms').doc(this.pin).update({
      runningStatus:1,
      startTime: firebase.firestore.FieldValue.serverTimestamp(),
      currentActivity: 1,
      annotations: [],
      student_annotations: [],
      events: [],
      event_check_in: {}
  }).then( () => {
    this.navParamService.addNavData('startTime',Date.now());
    this.router.navigate([`/scenario/${this.pin}/timetable/`]);
  });

  }

  public joinClassroom() {

    this.router.navigate([`/scenario/${this.pin}/timetable/`]);

  }
  
  public setTimetableHeight(activities: any[]) {

    // First get the activity block with biggest height, and, from there, assign the height of the timetable.

    let highestInvolvementLevel = 0;
    let timetableHeight: number;

    activities.forEach ( (activity) => {

      if(activity.materials){

        activity.materials.forEach ( (material) => {
          if(material.position == 'bottom') {
            if(highestInvolvementLevel < material.involvement_level) {
              highestInvolvementLevel = material.involvement_level;
            }
          }
        });

      }

    });

    switch (highestInvolvementLevel) {
      case 0:
        timetableHeight = 250;
        break;
      case 1:
        timetableHeight = 275;
        break;
      case 2:
        timetableHeight = 300;
        break;
      case 3:
        timetableHeight = 325;
        break;
      case 4:
        timetableHeight = 350;
        break;
      case 5:
        timetableHeight = 375;
        break;
      case 6:
        timetableHeight = 400;
        break;
    }

    return timetableHeight;

  }

  // Get scenario data from the database.

  public async getScenario() {

    this.data = await this.navParamService.getNavData();
    this.user_id = await this.storageService.get('user_id');
    this.role = await this.storageService.get('role');
    this.user_name = await this.storageService.get('name');

    if(this.data.hasOwnProperty('created')){
      this.classroomCreatedDate = await this.data.created;
    }
    
    this.firestore.firestore.doc(`classrooms/${this.pin}`)
    .get()
    .then((doc) => {
      this.teacherName = doc.data()['teacher_name'];
      this.currentActivity = doc.data()['currentActivity'];
      if(!this.data.hasOwnProperty('created')){
        this.classroomCreatedDate = doc.data()['created'].toDate();
      }
      this.scenarioSubscription = this.firestore.collection('scenarios').doc(doc.data()['scenario']).valueChanges().subscribe(data => {
        try {
          this.name= data['name'];
          this.author = data['author']['first_name'] + " " + data['author']['last_name'];
          this.subjectsArray = data['subjects'];
          this.subjects = [];
          for (let subject of this.subjectsArray) {
            this.subjects.push(subject['name_en']);
          }
          this.createdDate = new Date(data['created']);
          this.activitiesDuration = data['activities_duration'];
          this.grade = data['grade'];
          this.description = data['description'];
          
          let cssLeft = 5;
          let cssAccumulatedWidth = 0;

          data['activities'].forEach( (activity, index) => {

            let cssWidth = Math.round((activity.duration/data['activities_duration'])*(938-((data['activities'].length)*5)));
            
            if(index > 0){
              // IMPORTANT: cssLeft is the left margin of each block in the timetable (graphically)
              // cssWidth is the width of each block (which depends on its individual duration) -> Width = (Total class duration/Individual activity duration) * (938px - aggregate of the margins of the other activities)
              cssLeft = cssLeft + Math.round((data['activities'][index-1].duration/data['activities_duration'])*(938-((data['activities'].length)*5))) + 5;
            }

            this.cssTotalWidth = cssLeft + cssWidth;
            cssAccumulatedWidth += cssWidth;

            this.activities[index] = { 
              duration: activity.duration,
              organization: activity.activity_organization.name,
              in_class: activity.in_class,
              name: activity.name,
              materials: activity.materials,
              outcomes: activity.outcomes,
              cssWidth: cssWidth,
              cssLeft: cssLeft,
              cssAccumulatedWidth: cssAccumulatedWidth
            };
            this.activityDurationArray[index] = activity.duration;
          });

          this.scenario = {
            id: doc.data()['scenario'],
            name: this.name,
            author: this.author,
            subjects: this.subjects,
            createdDate: this.createdDate,
            activitiesDuration: this.activitiesDuration,
            grade: this.grade,
            description: this.description,
            activities: this.activities,
            pin: this.pin,
            activityBlocks: this.activities.length,
            activityDurationArray: this.activityDurationArray,
            currentActivity: this.currentActivity,
            cssTotalWidth: this.cssTotalWidth,
            timetableHeight: this.setTimetableHeight(this.activities),
            studentList: this.studentList,
            teacherName: this.teacherName
          }

          this.navParamService.setNavData(this.scenario);
          
        } catch (e) {

        }
  
      });

    });

  }

  // Update classroom data when there are changes in the database.

  public async getClassroomData() {

    this.classroomSubscription = this.firestore.collection('classrooms').doc(this.pin).valueChanges().subscribe(data => {
      try {
        this.studentList = data['studentList'];
        this.runningStatus = data['runningStatus'];
      } catch (e) {

      }

    });    

  }

  // On disconnect: Clean subscriptions, cached data and remove student from the list of connected students.

  ngOnDestroy () {

    if(this.role === "student") {

      const studentData = {
        student_id: this.user_id,
        student_name: this.user_name,
      };

      this.firestore.collection('classrooms').doc(this.pin).update({
        studentList: firebase.firestore.FieldValue.arrayRemove(studentData)
      });
    }

    this.classroomSubscription.unsubscribe();
    this.scenarioSubscription.unsubscribe();
    this.navParamService.clearNavData();

  }

}
