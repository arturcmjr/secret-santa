import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonDirective } from '@shared/directives/button.directive';
import { DefaultPageLayoutComponent } from '@shared/components/default-page-layout/default-page-layout.component';
import { ListInputComponent } from '@shared/components/list-input/list-input.component';
import { SpinnerOverlayComponent } from '@shared/components/spinner-overlay/spinner-overlay.component';
import { minimumArrayLength } from '@shared/helpers/validators/minimum-array-length.validator';
import {
  ICreateSecretSanta,
  SecretSantaTypeEnum,
} from '@shared/services/secret-santa/secret-santa.interface';
import { SecretSantaService } from '@shared/services/secret-santa/secret-santa.service';

interface IParticipantSecretSanta {
  name: string;
  secretSanta: string;
}

interface IConfirmationSummary {
  name: string;
  description: string;
  date: Date;
  participants: string[];
  useSuggestion: boolean;
  maxSuggestions?: number;
}

function asLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Component({
  selector: 'app-create-secret-santa',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    TranslatePipe,
    ButtonDirective,
    DefaultPageLayoutComponent,
    ListInputComponent,
    SpinnerOverlayComponent,
  ],
  templateUrl: './create-secret-santa.component.html',
  styleUrl: './create-secret-santa.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateSecretSantaComponent {
  private readonly secretSantaService = inject(SecretSantaService);
  private readonly router = inject(Router);

  protected readonly isLoading = signal(false);
  protected readonly activeStep = signal(0);
  protected readonly steps = [
    'LABELS.BASIC_INFO',
    'LABELS.PARTICIPANTS',
    'LABELS.CONFIRMATION',
  ];
  protected readonly confirmationSummary = signal<IConfirmationSummary | undefined>(undefined);
  protected readonly minimumDate = asLocalDate(new Date());
  protected readonly maximumDate = this.getMaximumDate();

  protected readonly step1group = new FormGroup({
    name: new FormControl<string | null>(null, [
      Validators.required,
      Validators.minLength(5),
    ]),
    description: new FormControl<string | null>(null),
    date: new FormControl<string | null>(null, [
      Validators.required,
      this.dateRangeValidator(),
    ]),
    useSuggestion: new FormControl(false, { nonNullable: true }),
    maxSuggestions: new FormControl<number | null>(
      { value: null, disabled: true },
      [Validators.required, Validators.min(1)]
    ),
  });
  protected readonly step2group = new FormGroup({
    participants: new FormControl<string[]>([], {
      nonNullable: true,
      validators: [minimumArrayLength(4)],
    }),
  });

  protected readonly useSuggestion = signal(false);

  constructor() {
    this.step1group.controls.useSuggestion.valueChanges.subscribe((value) => {
      this.useSuggestion.set(value);
      const { maxSuggestions } = this.step1group.controls;
      if (value) maxSuggestions.enable();
      else maxSuggestions.disable();
    });
  }

  protected onBasicsNext(): void {
    if (this.step1group.invalid) {
      this.step1group.markAllAsTouched();
      return;
    }
    this.activeStep.set(1);
  }

  protected save(): void {
    if (this.step1group.invalid || this.step2group.invalid) {
      this.step1group.markAllAsTouched();
      this.step2group.markAllAsTouched();
      return;
    }
    const participants = this.drawSecretSanta();
    const { name, description, date, useSuggestion, maxSuggestions } =
      this.step1group.getRawValue();
    const data: ICreateSecretSanta = {
      name: name!,
      description: description ?? '',
      date: new Date(`${date}T00:00:00`),
      participants,
      maxSuggestions: useSuggestion ? maxSuggestions ?? undefined : undefined,
      type: useSuggestion
        ? SecretSantaTypeEnum.Suggestions
        : SecretSantaTypeEnum.Default,
    };
    this.isLoading.set(true);
    this.secretSantaService.createSecretSanta(data).subscribe((res) => {
      this.isLoading.set(false);
      this.router.navigate([`/share/${res.id}`]);
    });
  }

  protected onParticipantsNext(): void {
    const participantsControl = this.step2group.controls.participants;
    if (participantsControl.invalid) {
      participantsControl.markAsTouched();
      return;
    }
    const { name, description, date, useSuggestion, maxSuggestions } =
      this.step1group.getRawValue();
    this.confirmationSummary.set({
      name: name!,
      description: description ?? '',
      date: new Date(`${date}T00:00:00`),
      participants: participantsControl.value,
      useSuggestion,
      maxSuggestions: useSuggestion ? maxSuggestions ?? undefined : undefined,
    });
    this.activeStep.set(2);
  }

  private dateRangeValidator(): ValidatorFn {
    return (control) => {
      const value = control.value as string | null;
      if (!value) return null;
      return value >= this.minimumDate && value <= this.maximumDate
        ? null
        : { dateRange: true };
    };
  }

  private getMaximumDate(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    date.setDate(date.getDate() - 1);
    return asLocalDate(date);
  }

  private drawSecretSanta(): IParticipantSecretSanta[] {
    const initialParticipants = [...this.step2group.controls.participants.value];
    let participants: IParticipantSecretSanta[] = [];
    do {
      participants = [];
      const options = [...initialParticipants];
      initialParticipants.forEach((name) => {
        const secretSanta = options[Math.floor(Math.random() * options.length)];
        participants.push({ name, secretSanta });
        options.splice(options.indexOf(secretSanta), 1);
      });
    } while (this.someoneGotHimself(participants));
    return participants;
  }

  private someoneGotHimself(participants: IParticipantSecretSanta[]): boolean {
    return participants.some(
      (participant) => participant.name === participant.secretSanta
    );
  }
}
