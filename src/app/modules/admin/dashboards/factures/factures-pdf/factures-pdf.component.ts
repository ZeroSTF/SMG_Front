import { NgFor } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { FactureService } from '../facture.service';

@Component({
    selector: 'app-factures-pdf',
    templateUrl: './factures-pdf.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgFor, MatButtonModule, MatIconModule],
})
export class FacturesPDFComponent implements OnInit, OnDestroy, AfterViewInit {
    //get nfact from url
    nfact: string;
    rs: boolean;
    details: any = {};

    groupedVentes: { nbon: string; datvte: string; ventes: any[] }[] = [];

    /**
     * Constructor
     */
    constructor(
        private _factureService: FactureService,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.route.paramMap.subscribe((params) => {
            this.nfact = params.get('nfact')!;
            this.rs = params.get('rs') === 'true';
        });

        this._factureService
            .getFactureDetails(this.nfact)
            .subscribe((response: any) => {
                this.details = response;
                this.groupVentesByNbon();
            });
    }
    ngOnDestroy(): void {}
    ngAfterViewInit(): void {}

    convertStringToDecimal(input: string): string {
        // Replace comma with dot
        const replacedString = input.replace(',', '.');

        // Parse as float and round to 3 decimal places
        const parsedNumber = parseFloat(replacedString);
        const roundedNumber = parsedNumber.toFixed(3);

        return roundedNumber;
    }

    getMontantHT(pht, qte, rem) {
        let montant = pht * qte - (pht * qte * rem) / 100;
        return montant.toFixed(3);
    }

    groupVentesByNbon() {
        const grouped = this.details.lignes.reduce((acc, vente) => {
            const key = vente.nbon;
            if (!acc[key]) {
                acc[key] = {
                    nbon: key,
                    datvte: vente.datvte,
                    ventes: [],
                };
            }
            acc[key].ventes.push(vente);
            return acc;
        }, {});

        this.groupedVentes = Object.values(grouped);
    }

    //script that converts float to words in french
    floatToFrenchWords(value: string): string {
        const units: string[] = [
            '',
            'Un',
            'Deux',
            'Trois',
            'Quatre',
            'Cinq',
            'Six',
            'Sept',
            'Huit',
            'Neuf',
        ];
        const teens: string[] = [
            '',
            'Onze',
            'Douze',
            'Treize',
            'Quatorze',
            'Quinze',
            'Seize',
            'Dix-Sept',
            'Dix-Huit',
            'Dix-Neuf',
        ];
        const tens: string[] = [
            '',
            'Dix',
            'Vingt',
            'Trente',
            'Quarante',
            'Cinquante',
            'Soixante',
            'Soixante-Dix',
            'Quatre-Vingt',
            'Quatre-Vingt-Dix',
        ];
        const thousands: string[] = ['', 'Mille', 'Million', 'Milliard'];

        function convertIntegerPart(number: number): string {
            if (number === 0) return 'Zéro';

            let words: string[] = [];
            let thousandCounter: number = 0;

            while (number > 0) {
                let currentPart: number = number % 1000;
                if (currentPart !== 0) {
                    let partWords: string =
                        convertThreeDigitNumber(currentPart);
                    if (thousandCounter > 0) {
                        partWords += ' ' + thousands[thousandCounter];
                    }
                    words.unshift(partWords);
                }
                number = Math.floor(number / 1000);
                thousandCounter++;
            }

            return words.join(' ');
        }

        function convertThreeDigitNumber(number: number): string {
            let words: string[] = [];

            if (number >= 100) {
                let hundreds: number = Math.floor(number / 100);
                if (hundreds === 1) {
                    words.push('Cent');
                } else {
                    words.push(units[hundreds] + ' Cent');
                }
                number %= 100;
            }

            if (number >= 20) {
                let tensPlace: number = Math.floor(number / 10);
                let unitsPlace: number = number % 10;
                if (tensPlace === 7 || tensPlace === 9) {
                    words.push(tens[tensPlace - 1] + '-' + teens[unitsPlace]);
                } else {
                    words.push(
                        tens[tensPlace] +
                            (unitsPlace > 0 ? '-' + units[unitsPlace] : '')
                    );
                }
            } else if (number > 10) {
                words.push(teens[number - 10]);
            } else if (number > 0) {
                words.push(units[number]);
            }

            return words.join(' ');
        }

        function convertDecimalPart(number: number): string {
            if (number === 0) return '';
            return convertThreeDigitNumber(number);
        }

        const [integerPartString, decimalPartString] = value.split('.');
        const integerPart: number = parseInt(integerPartString, 10);
        const decimalPart: number = decimalPartString
            ? parseInt(decimalPartString.padEnd(3, '0').slice(0, 3), 10)
            : 0;

        let result: string = convertIntegerPart(integerPart) + ' Dinars';

        if (decimalPart > 0) {
            result += ' et ' + convertDecimalPart(decimalPart) + ' Millimes';
        }

        return result;
    }

    makeTvaCltIntoArray(tvaclt: string): string[] {
        return tvaclt.split('/');
    }

    printInvoice(): void {
        window.print();
    }
}
