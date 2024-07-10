import { NgFor } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FactureService } from '../facture.service';

@Component({
    selector: 'app-factures-pdf',
    templateUrl: './factures-pdf.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgFor],
})
export class FacturesPDFComponent implements OnInit, OnDestroy, AfterViewInit {
    //get nfact from url
    nfact: string = window.location.href.split('/').pop();
    details: any;
    groupedVentes: { nbon: string, datvte: string, ventes: any[] }[] = [];

    /**
     * Constructor
     */
    constructor(private _factureService: FactureService) {}

    ngOnInit(): void {
        this._factureService
            .getFactureDetails(this.nfact)
            .subscribe((response: any) => {
                this.details = response;
                this.groupVentesByNbon();
                console.log(this.details);
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

    getMontantHT(pht,qte,rem){
        let montant = (pht * qte) - ((pht * qte)*rem/100);
        return montant.toFixed(3);
    }

    groupVentesByNbon() {
      const grouped = this.details.lignes.reduce((acc, vente) => {
        const key = vente.nbon;
        if (!acc[key]) {
          acc[key] = {
            nbon: key,
            datvte: vente.datvte,
            ventes: []
          };
        }
        acc[key].ventes.push(vente);
        return acc;
      }, {});
  
      this.groupedVentes = Object.values(grouped);
    }
}
