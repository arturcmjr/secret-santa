import { Component, Input, OnInit } from '@angular/core';


@Component({
  selector: 'app-error-illustration',
  templateUrl: './error-illustration.component.html',
  styleUrls: ['./error-illustration.component.scss']
})
export class ErrorIllustrationComponent implements OnInit {
  @Input() errorCode: string | null;

  constructor() { }

  ngOnInit(): void {
  }

}
