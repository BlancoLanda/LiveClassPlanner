import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService } from '../../storage.service';
import { AlertController } from '@ionic/angular';
import 'firebase/firestore';

@Component({
  selector: 'app-login-teacher',
  templateUrl: './login-teacher.page.html',
  styleUrls: ['./login-teacher.page.scss'],
})
export class LoginTeacherPage {

  get pin() {
    return this.loginForm.get('pin');
  }
  
  get password() {
    return this.loginForm.get('password');
  }

  public errorMessages = {
    pin: [
      { type: 'required', message: 'Classroom PIN is required'},
      { type: 'pattern', message: 'Classroom PIN must be 6 character long formed with only numbers AND letters'}
    ],
    password: [
      { type: 'required', message: 'Password is required'}
    ], 
  };

  loginForm = this.formBuilder.group({
    pin: ['', [Validators.required, Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]{6})$')]],
    password: ['', [Validators.required]]
  });

  constructor(private formBuilder: FormBuilder, public firestore: AngularFirestore, private loadingController: LoadingController,
    private router: Router, private storageService : StorageService,
    private alertController : AlertController) { }

  public async submit() {

    const loading = await this.loadingController.create({
      message: 'Getting Scenario Data',
      translucent: true,
    });
    await loading.present();

    this.firestore.firestore.doc(`classrooms/${this.loginForm.value.pin}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        // Retrieve teacher data and store on cache
        this.storageService.set('user_id', doc.data()['teacher_id']);
        this.storageService.set('role', 'teacher');
        this.storageService.set('name', doc.data()['teacher_name']);

        if(!(this.loginForm.value.password === doc.data()['password'])){
          this.presentIncorrectPasswordError();
        } else {
  
          this.router.navigate(['/scenario', this.loginForm.value.pin]);

        }
        
      } else {
        this.presentClassroomInexistentError();
      }
    });

    loading.dismiss(); 

  }

  async presentIncorrectPasswordError() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Error',
      message: 'The password is wrong. Please, enter the correct one.',
      buttons: ['OK']
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
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
