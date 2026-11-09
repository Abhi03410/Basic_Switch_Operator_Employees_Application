import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appFocus]',
})
export class Focus implements AfterViewInit {
  constructor(private el: ElementRef) { }
  ngAfterViewInit(): void {
    this.el.nativeElement.focus();
  }
}

