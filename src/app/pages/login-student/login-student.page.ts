import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService } from '../../storage.service';
import { AlertController } from '@ionic/angular';
import firebase from "firebase/app";
import 'firebase/firestore';

@Component({
  selector: 'app-login-student',
  templateUrl: './login-student.page.html',
  styleUrls: ['./login-student.page.scss'],
})
export class LoginStudentPage {

  get name() {
    return this.loginForm.get('name');
  }
  
  get pin() {
    return this.loginForm.get('pin');
  }

  public errorMessages = {
    name: [
      { type: 'required', message: 'Name is required'}
    ],
    pin: [
      { type: 'required', message: 'Classroom PIN is required'},
      { type: 'pattern', message: 'Classroom PIN must be 6 character long formed with only numbers AND letters'}
    ], 
  };

  loginForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    pin: ['', [Validators.required, Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]{6})$')]]
  });

  studentData : any;

  constructor(private formBuilder: FormBuilder, public firestore: AngularFirestore, private loadingController: LoadingController,
    private router: Router, private storageService : StorageService,
    private alertController : AlertController) { }

  public async submit() {

    const studentId = this.firestore.createId();

    this.storageService.set('user_id', studentId);
    this.storageService.set('role', 'student');
    this.storageService.set('name', this.loginForm.value.name);

    const loading = await this.loadingController.create({
      message: 'Getting Scenario Data',
      translucent: true,
    });
    await loading.present();

    this.firestore.firestore.doc(`classrooms/${this.loginForm.value.pin}`)
    .get()
    .then((doc) => {
      if (doc.exists) {

        this.studentData = {
          student_id: studentId,
          student_name: this.loginForm.value.name,
        };
        
        this.firestore.collection('classrooms').doc(this.loginForm.value.pin).update({
          studentList: firebase.firestore.FieldValue.arrayUnion(this.studentData)
      });

        this.router.navigate(['/scenario', this.loginForm.value.pin]);
        
      } else {
        this.presentClassroomInexistentError();
      }
    });

    loading.dismiss(); 

  }

  async presentClassroomInexistentError() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Error',
      message: 'There is no classroom with that PIN. Ask the teacher for the correct PIN.',
      buttons: ['OK']
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
  }

}
