import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Chart } from 'chart.js';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
const DB_NAME: string = 'data.db';

@Component({
  selector: 'page-stats',
  templateUrl: 'stats.html'
})
export class StatsPage {
  private db: SQLiteObject;
  labels: any=[];
  consumed: any=[];

  labels_month: any=[];
  consumed_month: any=[];

  labels_foods: any=[];
  consumed_foods: any=[];

  @ViewChild('last7days') last7days;
  @ViewChild('last3month') last3month;
  @ViewChild('foods') foods;

  barChart: any;
  doughnutChart: any;

  constructor(public navCtrl: NavController, private sqlite: SQLite) {

  }
  ionViewWillEnter(){
    this.labels = [];
    this.consumed = [];
    this.labels_month = [];
    this.consumed_month = [];
    this.labels_foods = [];
    this.consumed_foods = [];
    this.createDbFile();
  }
  private createDbFile(): void {
  	this.sqlite.create({
	  name: DB_NAME,
	  location: 'default'
	})
	.then((db: SQLiteObject) => {
		this.db = db;
		this.getConsum();
    })
    .catch(e => alert("err 1 : "+e.message));
  }
   monthNames: any=["January", "February", "March", "April", "May", "June",
	  "July", "August", "September", "October", "November", "December"
	];

  public getConsum() {
	 this.db.executeSql('select SUM(protein_consumed) as consumed, date_consum from `consumption` where date_consum <= date("now") and date_consum >  DATETIME("now", "-7 day") group by date_consum', {})
      .then(res => {
	      //alert("oo");
	      if(res.rows.length>0) {
		      for(let i = 0; i < res.rows.length; i++) {
		      	//alert(res.rows.item(i).consumed);
		      	var date = new Date(res.rows.item(i).date_consum);
		      	var options = { weekday: 'long',   month: 'long', day: 'numeric' };
		      	this.labels.push(date.toLocaleDateString('en-EN', options));
		      	this.consumed.push(res.rows.item(i).consumed);
		      }
	      }

      })
      .catch(e => alert("err 2 : "+e.message));


	 this.db.executeSql('select SUM(protein_consumed) as consumed, strftime("%m", `date_consum`) as month from `consumption` where date_consum <= date("now") and date_consum >  DATETIME("now", "-90 day") group by strftime("%m", `date_consum`)', {})
      .then(res => {
	      if(res.rows.length>0) {
		      for(let i = 0; i < res.rows.length; i++) {
		      	this.labels_month.push(this.monthNames[Number(res.rows.item(i).month)-1]);
		      	this.consumed_month.push(res.rows.item(i).consumed);
		      }
	      }

      })
      .catch(e => alert("err 3 : "+e.message));


	 this.db.executeSql('select COUNT(protein_consumed) as nb, food_name from `consumption` group by food_name order by nb DESC LIMIT 10', {})
      .then(res => {
	      if(res.rows.length>0) {
		      for(let i = 0; i < res.rows.length; i++) {
		      	this.labels_foods.push(res.rows.item(i).food_name);
		      	this.consumed_foods.push(res.rows.item(i).nb);
		      }
	      }
	      this.LoadCharts();
      })
      .catch(e => alert("err 4 : "+e.message));

  }
  public refresh() {
		this.navCtrl.setRoot(this.navCtrl.getActive().component);
	}

    public LoadCharts() {

        this.barChart = new Chart(this.last7days.nativeElement, {

            type: 'bar',
            data: {
                labels: this.labels,
                datasets: [{
                    label: 'Protein consumed',
                    data: this.consumed,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(153, 10, 250, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(153, 10, 250, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }],
                    xAxes: [{
						ticks: {
							autoSkip: false
							}
						}]
                },
                legend: {
	            display: false}
            }

        });

        this.barChart = new Chart(this.last3month.nativeElement, {

            type: 'bar',
            data: {
                labels: this.labels_month,
                datasets: [{
                    label: 'Protein consumed',
                    data: this.consumed_month,
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }],
                    xAxes: [{
						ticks: {
							autoSkip: false
							}
						}]
                },
                legend: {
	            display: false}
            }

        });


 		this.doughnutChart = new Chart(this.foods.nativeElement, {

		    type: 'doughnut',
		    options: {
		            title: {
			            display: true,
			            text: ''
	        		}
	            },

		    data: {
		        labels: this.labels_foods,
		        datasets: [{
		            label: "Food name",
		            data: this.consumed_foods,
		            backgroundColor: [
		            	'rgba(0, 255, 255, 0.2)',
		                'rgba(255, 102, 0, 0.2)',
                        'rgba(255, 255, 0, 0.2)',
                        'rgba(51, 153, 102, 0.2)',
                        'rgba(0, 51, 102, 0.2)',
		                'rgba(153, 51, 102, 0.2)',
		                'rgba(255, 153, 204, 0.2)',
		                'rgba(0, 0, 255, 0.2)',
		                'rgba(204, 255, 204, 0.2)',
		                'rgba(128, 128, 0, 0.2)'
		            ],
		            hoverBackgroundColor: [
		                "#00FFFF",
		                "#FF6600",
		                "#FFFF00",
		                "#339966",
		                "#003366",
		                "#993366",
		                "#FF99CC",
		                "#0000FF",
		                "#CCFFCC",
		                "#808000"
		            ]
		        }]
		    }

		});

	}

}
