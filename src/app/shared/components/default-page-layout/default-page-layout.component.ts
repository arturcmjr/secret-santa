import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-default-page-layout',
  templateUrl: './default-page-layout.component.html',
  styleUrls: ['./default-page-layout.component.scss']
})
export class DefaultPageLayoutComponent implements OnInit {
  @Input() public title: string;
  @Input() public subTitle: string;

  constructor() { }

  ngOnInit(): void {
  }

}
