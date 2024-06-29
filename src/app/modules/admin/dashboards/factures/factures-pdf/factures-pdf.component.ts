import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FactureService } from '../facture.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-factures-pdf',
  templateUrl: './factures-pdf.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgFor
  ],
})
export class FacturesPDFComponent implements OnInit, OnDestroy, AfterViewInit{

  //get nfact from url
  nfact: string = window.location.href.split('/').pop();
  details: any;

  /**
   * Constructor
   */
  constructor(private _factureService: FactureService) {}

  ngOnInit(): void {
    this._factureService.getFactureDetails(this.nfact).subscribe((response: any) => {
      this.details = response;
      console.log(this.details);
    });
  }
  ngOnDestroy(): void {
  }
  ngAfterViewInit(): void {
  }

  convertStringToDecimal(input: string): string {
    // Replace comma with dot
    const replacedString = input.replace(',', '.');

    // Parse as float and round to 2 decimal places
    const parsedNumber = parseFloat(replacedString);
    const roundedNumber = parsedNumber.toFixed(2);

    return roundedNumber;
}
}
