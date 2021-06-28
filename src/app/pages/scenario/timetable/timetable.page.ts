import { Component, OnInit, OnDestroy } from '@angular/core';
import { Pipe, PipeTransform } from "@angular/core";
import { NavparamService } from '../../../navparam.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { StorageService } from '../../../storage.service';
import * as moment from 'moment';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.page.html',
  styleUrls: ['./timetable.page.scss'],
})
export class TimetablePage implements OnInit, OnDestroy {

  scenario : any = {};
  selectedActivity : number;
  elapsedTime : any;
  timeLeft : any = 0;
  currentActivity: any = 1;
  activityBlocks: any;
  activityDurationArray: any = [];
  currentActivityElapsedTime : any;
  runningStatus : any = 1; // 0 = "not started", 1 = "live", 2 = "finished"
  intervalId : any;
  currentActivityTimeLeft : any = 0;
  pin : any;
  paused : any = false;
  role : any;
  lastPausedTime : any;
  progressBarValue : any = 0;
  segmentModel : any = "activities";
  annotations : any = [];
  studentAnnotations : any = [];
  user_id : any;
  classroomSubscription : any;
  studentList : any = [];
  studentCheckboxList : any = [];
  events : any = [];
  startTime : any;

  constructor(private navParamService : NavparamService, private route: ActivatedRoute, private firestore: AngularFirestore, private router: Router, private storageService : StorageService, public alertController: AlertController) { }

  ngOnInit() {

    // Get scenario data, classroom PIN from URL, and classroom data from BBDD if needed.

    this.route.paramMap.subscribe(params => {
      this.pin = params.get('id');
      this.getClassroom();
      this.getClassroomData();
    });
  }

  ngOnDestroy() {

    this.classroomSubscription.unsubscribe();
    clearInterval(this.intervalId);

  }

  ionViewDidEnter() {

    this.updateCurrentActivity(this.currentActivity);

  }



  public addAnnotation() {

    this.router.navigate([`/scenario/${this.pin}/timetable/add-annotation`, this.currentActivity + "-" + this.elapsedTime]);

  }

  public removeAnnotation(annotation: string) {
    
    if(this.role == "teacher") {
      this.firestore.collection('classrooms').doc(this.pin).update({
        annotations: firebase.firestore.FieldValue.arrayRemove(annotation)
      });
    } else {
      this.firestore.collection('classrooms').doc(this.pin).update({
        [`student_annotations.${this.user_id}`]: firebase.firestore.FieldValue.arrayRemove(annotation)
      });      
    }

  }

  public async askIntervention() {

    // For teachers only: Ask for the intervention of student(s).

    let students = [];

    this.studentCheckboxList.forEach ( (student) => {
      if(student.selected) {

        let studentObj = {
          name: student.student_name,
          id: student.student_id
        }

        students.push(studentObj);

      }
    });

    if(students.length>0) {

      const interventionObject = {
        created: firebase.firestore.Timestamp.now(),
        elapsedClassTime: this.elapsedTime,
        students: students,
        type: "intervention-request",
        role: "teacher",
        activity: this.currentActivity,
        teacher_name: await this.storageService.get('name')
      }
  
      this.firestore.collection('classrooms').doc(this.scenario.pin).update({
        events: firebase.firestore.FieldValue.arrayUnion(interventionObject)
      });

    }

  }

  public async studentRaiseHand() {
 
    const handRaiseObject = {
      created: firebase.firestore.Timestamp.now(),
      elapsedClassTime: this.elapsedTime,
      student: {
        id: this.user_id,
        name: await this.storageService.get('name')
      },
      type: "hand-raise",
      role: "student",
      activity: this.currentActivity
    }

    this.firestore.collection('classrooms').doc(this.scenario.pin).update({
      events: firebase.firestore.FieldValue.arrayUnion(handRaiseObject)
    });    

  }

  public updateCurrentActivity(currentActivity: number) {

    // Updates the current activity in the classroom by setting its color to red.

    let actContainers = document.getElementsByClassName('activity-container') as HTMLCollectionOf<HTMLElement>;

      this.selectedActivity = currentActivity-1;

      if(actContainers[currentActivity-1] != null) {

        actContainers[currentActivity-1].style.background = 'indianred';
      
        Array.from(actContainers).forEach ( (container, index) => {
  
          if (index != currentActivity-1) {
  
            if(this.scenario.activities[index].in_class) {
              container.style.background= 'rgb(100,126,228)';
            } else {
              container.style.background= 'rgb(92,184,92)';
            }
  
          }
  
        });

      }
        
  }

  public selectActivity (i : number) {

    // Select an activity by clicking on it in the timetable (Only works if class is not running)

    if(this.runningStatus != 1) {

      let actContainers = document.getElementsByClassName('activity-container') as HTMLCollectionOf<HTMLElement>;
      if(actContainers[i].style.background != 'indianred') {

        // If already selected, do nothing.
        // If not selected -> Select it and restore default color to other items.
  
        this.selectedActivity = i;
        actContainers[i].style.background = 'indianred';
        
        Array.from(actContainers).forEach ( (container, index) => {
  
          if (index != i) {
  
            if(this.scenario.activities[index].in_class) {
              container.style.background= 'rgb(100,126,228)';
            } else {
              container.style.background= 'rgb(92,184,92)';
            }
  
          }
  
        });
        
      }

    }
  }

  public highlightSelectedEvent(i : number) {

    // When an event's icon is clicked in the timeline, its associated row in "Events" segment is highligted (for 3 seconds)

    this.segmentModel = "events";
    let eventA;
    let eventB;
    setTimeout(()=>{ 
      eventA = document.getElementById(`event${i}a`) as HTMLElement;
      eventB = document.getElementById(`event${i}b`) as HTMLElement;
      eventA.style.background = 'rgb(241,241,241)';
      eventB.style.background = 'rgb(241,241,241)';
    }, 100)
    setTimeout(()=>{ 
      eventA.style.background = 'white';
      eventB.style.background = 'white';
    }, 3000)
    
  }

  stopLive() {

    // For teachers only: Stop the class.

    this.firestore.collection('classrooms').doc(this.pin).update({
      runningStatus:2,
      paused: false,
      lastPausedTime: firebase.firestore.FieldValue.delete()
  }).then( () => {
    this.runningStatus = 2;
    this.paused = false;
    this.progressBarValue = 1;
    this.currentActivityTimeLeft = 0;
    this.timeLeft = 0;
  });

  }

  async pauseUnpauseLive() {

    // For teachers only: Pause/unpause the classaaaa.

    if(!this.paused) {
      this.firestore.collection('classrooms').doc(this.pin).update({
        paused:true,
        lastPausedTime: firebase.firestore.FieldValue.serverTimestamp()
      }).then( () => {
        this.lastPausedTime = Date.now();
        this.paused= true;
      }); 
    } else {
      this.firestore.firestore.doc(`classrooms/${this.pin}`)
      .get()
      .then((doc) => {
        let startTime = doc.data()['startTime'].toDate();
        let diffTime = Math.abs(Date.now() - this.lastPausedTime);
        let newStartTime = new Date(startTime.valueOf() + diffTime)
        this.firestore.collection('classrooms').doc(this.pin).update({
          paused:false,
          startTime: newStartTime
        }).then( () => {
          this.paused= false;
          this.startTime = newStartTime;
        });  
      });
    
    }

  }

  segmentChanged(ev: any) {

    const notificationBadge = document.getElementsByClassName('notification-badge') as HTMLCollectionOf<HTMLElement>;
    
    // For teachers only: Mark "new event" notification as read if the teacher enters the "Events" segment.
    
    if(this.segmentModel == "events") {
      if(notificationBadge[0]) {
        notificationBadge[0].style.display = "none";
      }
    }
  
  }

  public async getClassroom() {

    // Get classroom variables, once, on join.

    this.scenario = await this.navParamService.getNavData();
    this.role = await this.storageService.get('role');
    this.user_id = await this.storageService.get('user_id');

    this.activityBlocks = this.scenario.activityBlocks;
    this.activityDurationArray = this.scenario.activityDurationArray;

    // If classroom was just created, it is not needed to load it from database.
    if(this.scenario.hasOwnProperty('startTime')){

      this.startTime = await this.scenario.startTime;
      // Trigger data refresh each 5 seconds
      this.refreshData();
      this.intervalId = setInterval(()=> this.refreshData(), 5000);

    // Otherwise, load it from database.
    } else {

      this.firestore.firestore.doc(`classrooms/${this.pin}`)
      .get()
      .then((doc) => {
        // Getting classroom data from database.
        if(doc.data()['startTime']) {
          this.startTime = doc.data()['startTime'].toDate();
        }
        this.paused = doc.data()['paused'];
        this.currentActivity = doc.data()['currentActivity'];
        this.runningStatus = doc.data()['runningStatus'];
        this.lastPausedTime = doc.data()['lastPausedTime']?.toDate();
        this.updateCurrentActivity(doc.data()['currentActivity']);
        this.studentList = doc.data()['studentList'];    
        // Trigger data refresh each 5 seconds
        this.refreshData();
        this.intervalId = setInterval(()=> this.refreshData(), 5000);
      });

    }

  }

  public refreshData() {

    // Only update data if classroom session is running.
    if(this.runningStatus == 1) {

      if(this.paused == false) {

      // Get current time
      let nowTime = moment();

      // Get total elapsed time, by getting the difference between current time to classroom's start time.
      this.elapsedTime = nowTime.diff(moment(this.startTime), 'minutes');

      // Get total time left, by substracting total elapsed time to the total time of the class.
      this.timeLeft = this.scenario.activitiesDuration - this.elapsedTime;

      // Get elapsed time of the current activity, by substracting the aggregate duration of the past activity blocks to the total elapsed time.
      this.currentActivityElapsedTime = this.elapsedTime;
      for (let i = 0; i < this.currentActivity-1; i++) {
        this.currentActivityElapsedTime = this.currentActivityElapsedTime - this.activityDurationArray[i];
      }

      // Get time left of the current activity block, by substracting the elapsed time of the current block to the total duration of the current block.
      
      this.currentActivityTimeLeft = this.activityDurationArray[this.currentActivity-1]-this.currentActivityElapsedTime;

      // Check if current activity has finished.
      if(this.currentActivityElapsedTime - this.activityDurationArray[this.currentActivity-1] == 0) {
        
        this.currentActivityElapsedTime = 0;
        this.currentActivityTimeLeft = this.activityDurationArray[this.currentActivity-1]

        // If true, check if the whole classroom session has finished.
        if(this.currentActivity==this.activityBlocks){

          this.firestore.collection('classrooms').doc(this.pin).update({
            runningStatus: 2
          });

          this.runningStatus = 2;
          this.progressBarValue = 1;
          this.currentActivityTimeLeft = 0;
          this.timeLeft = 0;
          
          // If false, jump on to the next activity block.
        } else {

          this.currentActivity++;
          this.firestore.collection('classrooms').doc(this.pin).update({
            currentActivity: this.currentActivity
          });
          this.updateCurrentActivity(this.currentActivity);  

        }
  
      }

      // If the classroom hasn't finished yet, update the progress bar.
      if(this.runningStatus != 2) {

        let currentActivityTotalDuration = this.activityDurationArray[this.currentActivity-1];
        let currentActivityCssWidth = this.scenario.activities[this.currentActivity-1].cssWidth;
  
        // Note: If classroom is currently in the first activity, there are no past activities.
        if(this.currentActivity == 1) {
          this.progressBarValue = ((this.currentActivityElapsedTime/currentActivityTotalDuration)*currentActivityCssWidth)/(this.scenario.cssTotalWidth-5);
        } else {
          this.progressBarValue = (this.scenario.activities[this.currentActivity-2].cssAccumulatedWidth + (5*(this.currentActivity-1)) + (this.currentActivityElapsedTime/currentActivityTotalDuration)*currentActivityCssWidth)/(this.scenario.cssTotalWidth-5);
        }

      }

      }

    }

  }

  public async getClassroomData() {

    // Listens for changes in the classroom's database document. Also handles particular events like petitions from teacher to students and vice versa.

    const uid = await this.storageService.get('user_id');

    this.classroomSubscription = this.firestore.collection('classrooms').doc(this.pin).valueChanges().subscribe(async data => {
      try {

        // Check if there are changes in the running status (-> paused, unpaused, stopped, restarted) and update whatever is needed.

        if(this.paused !== data['paused'] || this.runningStatus !== data['runningStatus']) {

          // Remove events and annotations if classroom session is restarted.
          if(this.runningStatus == 2 && data['runningStatus'] == 1) {
            this.events = [];
            this.annotations = [];
            this.studentAnnotations = [];
          }

          this.startTime = data['startTime'].toDate();
          this.paused = data['paused'];
          this.currentActivity = data['currentActivity'];
          this.runningStatus = data['runningStatus'];
          this.lastPausedTime = data['lastPausedTime']?.toDate();
          this.updateCurrentActivity(data['currentActivity']);
          
          // If classroom is marked as finished, update some variables (like setting progress bar to 100%)
          if(data['runningStatus'] == 2){
            this.progressBarValue = 1;
            this.currentActivityTimeLeft = 0;
            this.timeLeft = 0;
          }

        }

        // If changes in students list, apply them to the client's list.
        if(this.studentList !== data['studentList']) {

          this.studentCheckboxList = [];
          this.studentList = data['studentList'];
          this.studentList.forEach ( (student) => {
            let studentCheckBox = {
              student_name : student.student_name,
              student_id : student.student_id,
              selected : false
            };
            this.studentCheckboxList.push(studentCheckBox);
          });

        }

        // If changes in annotations list, apply them to the client's list.
        if(this.annotations !== data['annotations']){
          this.annotations = data['annotations'];
        }

        // If changes in student annotations list, apply them to the client's list.
        if( this.studentAnnotations !== data['student_annotations']) {
          this.studentAnnotations = data['student_annotations'][uid]
        }

        // HANDLE EVENTS

        // Check if there is a new event.
        if(this.events !== data['events']){

          // Only check event's content if it wasn't done before.
          if(data['event_check_in'][uid] === undefined || data['events'].length > data['event_check_in'][uid]) {

            // If event type: "intervention-request", alert involved students.
            let lastEvent = data['events'][data['events'].length-1];
            if(lastEvent.type == "intervention-request") {

              // If users' ID is in the list, alert the user with the intervention request.
              lastEvent.students.every ( (student) => {
                if(student.id == uid) {

                  this.presentIntervention();
                  return false;
                }
                return true;
              });
  
            }
  
            //If event type: "hand-raise", alert the teacher with a notification badge in segment "Events".
            if((lastEvent.type == "hand-raise")) {
              if(this.role == "teacher") {
                const notificationBadge = document.getElementsByClassName('notification-badge') as HTMLCollectionOf<HTMLElement>;
                notificationBadge[0].style.display = "inline";
              }
            }
    
            // Mark the last event as seen, so the user does not analyze it in next iteration.
            this.firestore.collection('classrooms').doc(this.pin).update({
              [`event_check_in.${uid}`]: data['events'].length
            });
  
          }
  
          this.events = data['events'];          
        }

      } catch (e) {

      }

    });    

  }

  async presentIntervention() {
    const alert = await this.alertController.create({
      header: 'Intervention',
      message: 'The teacher just asked for your intervention!',
      buttons: ['OK']
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
  }

}

@Pipe({
  name: 'hoursMinutes'
})
export class HoursMinutesPipe implements PipeTransform {

  transform(value: number): string {
    const hours: number = Math.floor((value/60));
    const minutes: number = ((value/60) - Math.floor((value/60)))*60;
    return hours.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + 'h:' + minutes.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + 'm';
  }
}
