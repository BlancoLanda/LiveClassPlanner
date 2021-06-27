import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AngularFireFunctions } from '@angular/fire/functions';
import { LoadingController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import 'firebase/firestore';
import { Router } from '@angular/router';
import { NavparamService } from '../../navparam.service';
import { StorageService } from '../../storage.service';
import { AlertController } from '@ionic/angular';
import firebase from 'firebase/app';



@Component({
  selector: 'app-create-classroom',
  templateUrl: './create-classroom.page.html',
  styleUrls: ['./create-classroom.page.scss'],
})
export class CreateClassroomPage {

  get name() {
    return this.registrationForm.get('name');
  }

  get scenario() {
    return this.registrationForm.get('scenario');
  }
  
  get pin() {
    return this.registrationForm.get('pin');
  }

  get password() {
    return this.registrationForm.get('password');
  }

  public errorMessages = {
    name: [
      { type: 'required', message: 'Name is required'}
    ],
    scenario: [
      { type: 'required', message: 'Scenario ID is required'},
      { type: 'pattern', message: 'Scenario ID must be 24 character long formed with letters and numbers'}
    ],
    pin: [
      { type: 'required', message: 'Classroom PIN is required'},
      { type: 'pattern', message: 'Classroom PIN must be 6 character long formed with only numbers AND letters'}
    ],
    password: [
      { type: 'required', message: 'Password is required'}
    ],     
  };

  registrationForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    scenario: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9]{24}$')]],
    pin: ['', [Validators.required, Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]{6})$')]],
    password: ['', [Validators.required]],
  });

  constructor(private formBuilder: FormBuilder, private functions: AngularFireFunctions,
    public loadingController: LoadingController, public firestore: AngularFirestore,
    private router: Router, private navParamService: NavparamService, private storageService: StorageService,
    public alertController: AlertController) { }

  public async submit() {

    const teacherId = this.firestore.createId();

    this.storageService.set('user_id', teacherId);
    this.storageService.set('role', 'teacher');
    this.storageService.set('name', this.registrationForm.value.name);

    const loading = await this.loadingController.create({
      message: 'Getting Scenario Data',
      translucent: true,
    });
    await loading.present();
    const callable = this.functions.httpsCallable('callLeplannerToDB');

    const obs = callable({ id: this.registrationForm.value.scenario });

    obs.subscribe(async res => {
      
      // Success, Leplanner scenario data will be added to Firestore if there is no data with that PIN.

      this.firestore.firestore.doc(`classrooms/${this.registrationForm.value.pin}`)
      .get()
      .then((doc) => {
        if (!doc.exists) {

          const data = {
            teacher_id: teacherId,
            teacher_name: this.registrationForm.value.name,
            scenario: this.registrationForm.value.scenario,
            pin: this.registrationForm.value.pin,
            password: this.registrationForm.value.password,
            runningStatus: 0,
            currentActivity: 1,
            paused: false,
            created: firebase.firestore.FieldValue.serverTimestamp(),
            annotations: [],
            student_annotations: [],
            events: [],
            studentList: [],
            event_check_in: {}
          };

          this.firestore.doc(`classrooms/${this.registrationForm.value.pin}`).set(data);

          let d = { 'created': Date.now() }
          this.navParamService.setNavData(d);

          this.router.navigate(['/scenario', this.registrationForm.value.pin]);
          
        } else {
          this.presentAlreadyExistsError();
        }
      });

      loading.dismiss();

    });

  }

  async presentAlreadyExistsError() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'A classroom with that PIN already exists. Please, create a classroom with another PIN.',
      buttons: ['OK']
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
  }

}
