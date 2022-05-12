import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { minimumArrayLength } from 'src/app/shared/helpers/validators/minimum-array-length.validator';

// TODO: remove
import { initializeApp } from 'firebase/app';
import { doc, getFirestore, writeBatch } from 'firebase/firestore';
import { collection, addDoc } from 'firebase/firestore';
import { generateUniqueId } from 'src/app/shared/helpers/utils/generate-unique-id';

const firebaseConfig = {
  apiKey: 'AIzaSyBygS6EvetxOt6b1gtEv1kudh8Nek6h2yQ',
  authDomain: 'arju-secret-santa.firebaseapp.com',
  projectId: 'arju-secret-santa',
  storageBucket: 'arju-secret-santa.appspot.com',
  messagingSenderId: '908249212112',
  appId: '1:908249212112:web:d7c735ccc74fdf176fead5',
  measurementId: 'G-N9B763KS2Y',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

interface IParticipantSecretSanta {
  name: string;
  secretSanta: string;
}

@Component({
  selector: 'app-create-secret-santa',
  templateUrl: './create-secret-santa.component.html',
  styleUrls: ['./create-secret-santa.component.scss'],
})
export class CreateSecretSantaComponent implements OnInit {
  @ViewChild('participantsScroll') private participantsScroll: ElementRef;

  public basicInfoForm = new FormGroup({
    name: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    description: new FormControl(null),
    date: new FormControl(null, [Validators.required]),
  });

  public participantsControl = new FormControl([], [minimumArrayLength(4)]);
  public newParticipantControl = new FormControl(null, [
    Validators.minLength(3),
  ]);

  constructor() {}

  ngOnInit(): void {}

  public formGroupHasError(
    group: FormGroup,
    controlName: string,
    error?: string
  ): boolean {
    const control = group.get(controlName);
    if (!control) return false;
    return this.formControlHasError(control, error);
  }

  public formControlHasError(
    control: AbstractControl,
    error?: string
  ): boolean {
    if (!control) return false;
    return (
      (control.touched || control.dirty) &&
      (error ? control.hasError(error) : control.invalid)
    );
  }

  public removeParticipant(index: number): void {
    const participants: string[] = this.participantsControl.value || [];
    participants.splice(index, 1);
    this.participantsControl.setValue(participants);
  }

  public addParticipant(): void {
    if (
      this.newParticipantControl.invalid ||
      !this.newParticipantControl.value
    ) {
      this.newParticipantControl.markAsTouched();
      return;
    }
    const name = this.newParticipantControl.value;
    const participants: string[] = this.participantsControl.value || [];
    if (participants.includes(name)) {
      this.newParticipantControl.setErrors({ duplicate: true });
      this.newParticipantControl.markAsTouched();
      return;
    } else {
      this.newParticipantControl.setErrors({ duplicate: false });
    }
    participants.push(name);
    this.participantsControl.setValue(participants);
    this.newParticipantControl.reset();
    window.setTimeout(() => {
      this.participantsScroll.nativeElement.scrollTop =
        this.participantsScroll.nativeElement.scrollHeight;
    });
  }

  public save(): void {
    const participants = this.drawSecretSanta();
    const { name, description, date } = this.basicInfoForm.value;
    /* ----------------------------------- tt ----------------------------------- */

    const batch = writeBatch(db);
    const secretSantaRef = doc(
      db,
      'secretSantas',
      generateUniqueId()
    );
    batch.set(secretSantaRef, { name, description, date });

    participants.forEach((participant) => {
      const revelationRef = doc(db, 'revelations', generateUniqueId());
      const participantRef = doc(db,'participants', generateUniqueId());
      batch.set(revelationRef, {
        name: participant.secretSanta,
        revealedCount: 0,
      });
      batch.set(participantRef, {
        name: participant.name,
        revelationRef,
        secretSantaRef,
      });
    });

    batch
      .commit()
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });

    /* ----------------------------------- tt ----------------------------------- */
    /* addDoc(collection(db, 'secretsSantaV1'), {
      name,
      description,
      date,
    }).then((res) => {
      const id = res.id;

      participants.forEach((participant) => {
        addDoc(collection(db, 'secretsSantaV1', id, 'participants'), {
          name: participant.name,
          secretSanta: participant.secretSanta,
          revealedCount: 0,
        });
      });
      console.log(res);
      console.log('Document written with ID: ', res.id);
    }); */
  }

  private drawSecretSanta(): IParticipantSecretSanta[] {
    let participants: IParticipantSecretSanta[] = [];
    let attempts = 0;
    do {
      participants = [];
      const allParticipants: string[] = [...this.participantsControl.value];
      let options: string[] = [...this.participantsControl.value];
      allParticipants.forEach((entry) => {
        const secretSanta = options[Math.floor(Math.random() * options.length)];
        participants.push({
          name: entry,
          secretSanta,
        });
        options.splice(options.indexOf(secretSanta), 1);
      });
      attempts++;
    } while (this.someoneGotHimself(participants));
    console.log(participants);
    console.log(`Took ${attempts} attempts`);
    return participants;
  }

  private someoneGotHimself(participants: IParticipantSecretSanta[]): boolean {
    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      if (participant.name === participant.secretSanta) return true;
    }
    return false;
  }
}
