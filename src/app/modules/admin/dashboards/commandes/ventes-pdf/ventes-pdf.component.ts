import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommandeService } from '../commande.service';

@Component({
  selector: 'app-ventes-pdf',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './ventes-pdf.component.html',
})
export class VentesPdfComponent implements OnInit, OnDestroy{
  vente: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _commandeService: CommandeService
    ) {}

    ngOnInit(): void {
        // Get the commande id from the route params
        this._activatedRoute.params
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((params) => {
                const venteId = params['id'];
                // Fetch the commande details
                this._commandeService
                    .getVenteDetails(venteId)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((vente) => {
                        this.vente = vente;
                    });
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    printInvoice(): void {
        window.print();
    }

    getMontantHT(pht,qte,rem){
      let montant = (pht * qte) - ((pht * qte)*rem/100);
      return montant.toFixed(3);
  }

  convertStringToDecimal(input: string): string {
    // Replace comma with dot
    const replacedString = input.replace(',', '.');

    // Parse as float and round to 3 decimal places
    const parsedNumber = parseFloat(replacedString);
    const roundedNumber = parsedNumber.toFixed(3);

    return roundedNumber;
}

//script that converts float to words in french
floatToFrenchWords(value: string): string {
  const units: string[] = ["", "Un", "Deux", "Trois", "Quatre", "Cinq", "Six", "Sept", "Huit", "Neuf"];
const teens: string[] = ["", "Onze", "Douze", "Treize", "Quatorze", "Quinze", "Seize", "Dix-Sept", "Dix-Huit", "Dix-Neuf"];
const tens: string[] = ["", "Dix", "Vingt", "Trente", "Quarante", "Cinquante", "Soixante", "Soixante-Dix", "Quatre-Vingt", "Quatre-Vingt-Dix"];
const thousands: string[] = ["", "Mille", "Million", "Milliard"];

  function convertIntegerPart(number: number): string {
      if (number === 0) return "Zéro";
      
      let words: string[] = [];
      let thousandCounter: number = 0;

      while (number > 0) {
          let currentPart: number = number % 1000;
          if (currentPart !== 0) {
              let partWords: string = convertThreeDigitNumber(currentPart);
              if (thousandCounter > 0) {
                  partWords += " " + thousands[thousandCounter];
              }
              words.unshift(partWords);
          }
          number = Math.floor(number / 1000);
          thousandCounter++;
      }

      return words.join(" ");
  }

  function convertThreeDigitNumber(number: number): string {
      let words: string[] = [];
      
      if (number >= 100) {
          let hundreds: number = Math.floor(number / 100);
          if (hundreds === 1) {
              words.push("Cent");
          } else {
              words.push(units[hundreds] + " Cent");
          }
          number %= 100;
      }

      if (number >= 20) {
          let tensPlace: number = Math.floor(number / 10);
          let unitsPlace: number = number % 10;
          if (tensPlace === 7 || tensPlace === 9) {
              words.push(tens[tensPlace - 1] + "-" + teens[unitsPlace]);
          } else {
              words.push(tens[tensPlace] + (unitsPlace > 0 ? "-" + units[unitsPlace] : ""));
          }
      } else if (number > 10) {
          words.push(teens[number - 10]);
      } else if (number > 0) {
          words.push(units[number]);
      }

      return words.join(" ");
  }

  function convertDecimalPart(number: number): string {
      if (number === 0) return "";
      return convertThreeDigitNumber(number);
  }

  const [integerPartString, decimalPartString] = value.split(".");
  const integerPart: number = parseInt(integerPartString, 10);
  const decimalPart: number = decimalPartString ? parseInt(decimalPartString.padEnd(3, '0').slice(0, 3), 10) : 0;

  let result: string = convertIntegerPart(integerPart) + " Dinars";

  if (decimalPart > 0) {
      result += " et " + convertDecimalPart(decimalPart) + " Millimes";
  }

  return result;
}

}
