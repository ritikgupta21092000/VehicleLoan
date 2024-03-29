import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Loan } from '../loan';
import { LoanService } from '../loan.service';
import { PersonaldetailsService } from '../personaldetails.service';
import { Sales } from '../sales';
import { SalesService } from '../sales.service';
import { VehicleService } from '../vehicle.service';

@Component({
    selector: 'app-vehiclespecification',
    templateUrl: './vehiclespecification.component.html',
    styleUrls: ['./vehiclespecification.component.css']
})
export class VehiclespecificationComponent implements OnInit {
    vehicleData: any;
    vehicleId: any;

    emi1: number;
    emi2: number;
    emi3: number;

    totalPrice1: number;
    totalPrice2: number;
    totalPrice3: number;

    downPayment: number;

    loan: Loan = new Loan();

    user: any;
    userId: number;

    sales: Sales = new Sales;

    constructor(private vehicleService: VehicleService, private router: Router, private loanService: LoanService, private personalDetailService: PersonaldetailsService, private salesService: SalesService) {

    }

    ngOnInit(): void {
        this.vehicleData = this.vehicleService.getVehicleData();
        console.log(this.vehicleData);
        var downPayment = 0.3 * (this.vehicleData.price);
        var loanAmount = this.vehicleData.price - downPayment;
        this.emi1 = this.calculateEmi(10, 2, loanAmount);
        this.emi2 = this.calculateEmi(15, 4, loanAmount);
        this.emi3 = this.calculateEmi(20, 6, loanAmount);

        this.downPayment = 0.3 * (this.vehicleData.price);
        this.totalPrice1 = this.downPayment + (this.emi1 * 120);
        this.totalPrice2 = this.downPayment + (this.emi2 * 180);
        this.totalPrice3 = this.downPayment + (this.emi3 * 240);
    }

    calculateEmi(years, interest, loan) {
        var n = years * 12;
        var r = interest / 12 / 100;
        var x = Math.pow((1 + r), n);
        var c = loan * r * (x / (x - 1));
        var p = c.toFixed();
        return parseInt(p);
    }

    applyLoan(options) {
        this.vehicleId = this.vehicleData.vehicleId;
        this.loan.vehicleId = this.vehicleId;
        this.loan.loanAmount = this.vehicleData.price - (0.3 * (this.vehicleData.price));
        if (options == 1) {
            this.loan.loanTenure = 10;
            this.loan.rateOfInterest = 2;
            this.loan.emi = this.emi1;
        } else if (options == 2) {
            this.loan.loanTenure = 15;
            this.loan.rateOfInterest = 4;
            this.loan.emi = this.emi2;
        } else {
            this.loan.loanTenure = 20;
            this.loan.rateOfInterest = 6;
            this.loan.emi = this.emi3;
        }
        this.loanService.setLoan(this.loan);
        this.user = JSON.parse(sessionStorage.getItem("user"));
        this.userId = this.user.userId;
        this.personalDetailService.getPersonalDetailsByUserId(this.userId).subscribe(data => {
            if (data != null) {
                console.log(data);

                let message = window.confirm("Apply for Loan ?");
                if (message == true) {
                    console.log(data.applicantId);

                    this.sales.applicantId = data.applicantId;
                    console.log("Sales: " + this.sales);

                    this.loanService.addLoanDetails(this.loan).subscribe(data => {
                        console.log('Loan: ' + data);
                        this.sales.loanId = data.loanId;
                        this.sales.vehicleId = this.vehicleService.getVehicleData().vehicleId;
                        console.log(this.sales);

                        this.salesService.addSales(this.sales).subscribe(saleData => {
                            console.log(saleData);
                            this.router.navigateByUrl("/home");
                        })
                    });
                }

            } else {
                this.router.navigateByUrl("/checkEligibility");
            }
        })
    }

}
