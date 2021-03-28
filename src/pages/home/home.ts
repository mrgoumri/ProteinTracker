import { Component, ViewChild  } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Chart } from 'chart.js';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { AdMobFree, AdMobFreeBannerConfig, AdMobFreeInterstitialConfig } from '@ionic-native/admob-free';
import { Platform } from 'ionic-angular';

const DB_NAME: string = 'data.db';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private db: SQLiteObject;

  public goal = 0;
  public consumed = 0;
  public remaining = this.goal - this.consumed;
  public date_now = new Date().getFullYear()+"-"+this.pad((new Date().getMonth()+1))+"-"+this.pad(new Date().getDate());
  public date_consumption = new Date().getFullYear()+"-"+this.pad((new Date().getMonth()+1))+"-"+this.pad(new Date().getDate());

  public pc_rem = 0;
  public pc_cons = 0;

  public time1 = "";
  public time2 = "";
  public time3 = "";
  public time4 = "";

  private createDbFile(): void {
  	this.sqlite.create({
	  name: DB_NAME,
	  location: 'default'
	})
	.then((db: SQLiteObject) => {
		this.db = db;
		this.createTables();
    })
    .catch(e => console.log(e));
  }

  private createTables(): void {
  	/*this.db.executeSql('select strftime("%H:%M","now") AS now', {})
	      .then(res => {
	      	alert(res.rows.item(0).now);
	      })
	      .catch(e => console.log(e));*/




  	this.db.executeSql('create table IF NOT EXISTS `parametres` (protein_goal INTEGER,time1 TEXT,time2 TEXT,time3 TEXT,time4 TEXT,weight INTEGER,goal TEXT)', {})
      .then(() => {
      	this.db.executeSql('create table IF NOT EXISTS `consumption` (protein_consumed INTEGER, date_consum TEXT, houre_consum TEXT, food_name VARCHAR(60))', {})
	      .then(() => console.log('Executed SQL'))
	      .catch(e => console.log(e));
      })
      .catch(e => console.log(e));

      this.reloadInfos();
  }
  public reloadInfos(){
    this.remaining = 0;
    this.consumed = 0;
    this.db.executeSql('select * from `parametres`', {})
      .then(res => {

        this.db.executeSql('select SUM(protein_consumed) as protein_consumed from `consumption` where date_consum = ?', [this.date_consumption])
      .then(res_cons => {
        var prot_cons = 0;
        if(res_cons.rows.length>0 ) {
          if(res_cons.rows.item(0).protein_consumed != null)
            this.consumed = parseInt(res_cons.rows.item(0).protein_consumed);
        }

        if(res.rows.length>0) {
          this.goal = parseInt(res.rows.item(0).protein_goal);
          this.time1 = res.rows.item(0).time1;
          this.time2 = res.rows.item(0).time2;
          this.time3 = res.rows.item(0).time3;
          this.time4 = res.rows.item(0).time4;
          this.pc_rem = 0;
          if (this.goal > 0)
          this.pc_cons = Math.round(((this.consumed / this.goal) * 100) * 100) / 100;
          this.pc_rem = 100 - this.pc_cons;
          if (this.goal <= this.consumed)
            this.remaining = 0;
          else
            this.remaining = this.goal - this.consumed;
          this.ionViewDidLoad();
          this.getNotifications();
        }
      })
      .catch(e => console.log(e));

      })
      .catch(e => console.log(e));

  }
  public saveGoal() {
  	 this.db.executeSql('DELETE FROM `parametres`',{})
	      .then(() => {
	      	this.db.executeSql('INSERT INTO `parametres` VALUES(?)',[this.goal])
		      .then(() => console.log('Executed SQL'))
		      .catch(e => console.log(e));
	      })
	      .catch(e => console.log(e));

		  this.remaining = this.goal - this.consumed;
	      this.ionViewDidLoad();
  }

  @ViewChild('doughnutCanvas') doughnutCanvas;
  doughnutChart: any;

  constructor(public navCtrl: NavController, private sqlite: SQLite, public alertCtrl: AlertController, public toastCtrl: ToastController, public localNotifications: LocalNotifications, public admob: AdMobFree, platform: Platform) {
    platform.ready().then(() => {
      this.showAds();
    });
  }
  public showAds() {
      //Banner
      let bannerConfig: AdMobFreeBannerConfig = {
          // isTesting: true, // Remove in production
          autoShow: true,
          id: "ca-app-pub-6339864735360735/8623975538"
      };

      this.admob.banner.config(bannerConfig);

      this.admob.banner.prepare().then(() => {
          // success
      }).catch(e => console.log(e));

      //Interstitial
      let interstitialConfig: AdMobFreeInterstitialConfig = {
           // isTesting: true, // Remove in production
           autoShow: true,
           id: "ca-app-pub-6339864735360735/6581950337"
       };

       this.admob.interstitial.config(interstitialConfig);

       this.admob.interstitial.prepare().then(() => {
           // success
       });
  }

  private ionViewDidLoad(): void {
  	if (this.goal > 0)
		this.pc_cons = Math.round(((this.consumed / this.goal) * 100) * 100) / 100;
	if (this.goal > this.consumed)
		this.pc_rem = 100 - this.pc_cons;
	else
		this.pc_rem = 0;
  	this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {

	    type: 'doughnut',
	    options: {
		    legend: {
	            display: false},
	            title: {
		            display: true,
		            text: this.pc_cons+'%'
        }
            },

	    data: {
	        labels: ["Consumed", "Remaining"],
	        datasets: [{
	            label: 'Consumed',
	            data: [this.pc_cons, this.pc_rem],
	            backgroundColor: [
	                'rgba(72, 138, 255, 0.2)',
	                'rgba(192, 192, 192, 0.2)'
	            ],
	            hoverBackgroundColor: [
	                "#488AFF",
	                "#C0C0C0"
	            ]
	        }]
	    }

	});
  }


 setConsum() {
    let alert = this.alertCtrl.create({
      title: 'Add Protein',
      message: 'Enter a name for your food (optional), and number of protein grams',
      inputs: [
        {
          name: 'food',
          placeholder: 'Food name (optional)'
        },
        {
          name: 'protein',
          placeholder: 'Protein (Grams)',
          type: 'number'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            if(this.goal == 0) {
              this.showToast("bottom","You should set your daily protein goal in settings");
              this.navCtrl.parent.select(3);
            } else {
            	if(parseInt(data.protein) >= this.goal) {
            		this.showToast("bottom","Congratulation! goal reached");
            	} else if (parseInt(data.protein) > this.remaining) {
            		//this.showToast("bottom","Protein grams must not be greater than remaining");
            		this.showToast("bottom","Congratulation! goal reached");
            	} else {

            	}
            	if(data.protein == 0 || data.protein == ""){
            		this.showToast("bottom","You must enter a number");
            	} else {
                if(this.date_now == this.date_consumption){
                  this.consumed += parseInt(data.protein);
      	      		this.remaining = this.goal - this.consumed;
      	      		this.ionViewDidLoad();
                }

    		      	this.db.executeSql('INSERT INTO `consumption` VALUES(?,?,strftime("%H:%M","now"),?)',[data.protein,this.date_consumption,data.food])
      		      .then(() => console.log('Executed SQL'))
      		      .catch(e => console.log(e));
            	}
            }

          }
        }
      ]
    });

    alert.present();



  }

  showToast(position: string, msg: string) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: position
    });

    toast.present(toast);
  }

  public setDate() {
    // this.datePicker.show({
    //   date: new Date(),
    //   maxDate: new Date(),
    //   mode: 'date',
    //   androidTheme: this.datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT
    // }).then(
    //   date => this.date_consumption = date,
    //   err => console.log('Error occurred while getting date: ', err)
    // );

    // this.db.executeSql('select date("now") as now', {})
	  //     .then(res => {
	  //     	if(res.rows.length>0) {
		//         alert(res.rows.item(0).now);
		// 	    }
    //
	  //     })
	  //     .catch(e => alert(e.message));
  }

  public getNotifications() {
    let year = new Date().getFullYear();
    let month = new Date().getMonth();
    let day = new Date().getDate();


    let timeNow1 = new Date(2030, month, day, 9, 0, 0, 0);
    let timeNow2 = new Date(2030, month, day, 13, 0, 0, 0);
    let timeNow3 = new Date(2030, month, day, 18, 0, 0, 0);
    let timeNow4 = new Date(2030, month, day, 21, 0, 0, 0);



    if (this.time1 != "" && this.time2 != "" && this.time3 != "" && this.time4 != ""){
      timeNow1 = new Date(year, month, day, 9, 0, 0, 0);
      timeNow2 = new Date(year, month, day, 13, 0, 0, 0);
      timeNow3 = new Date(year, month, day, 18, 0, 0, 0);
      timeNow4 = new Date(year, month, day, 21, 0, 0, 0);
    } else {
      if (this.time1 != "")
         timeNow1 = new Date(year, month, day, parseInt(this.time1.split(":")[0]), parseInt(this.time1.split(":")[1]), 0, 0);
      if (this.time2 != "")
             timeNow2 = new Date(year, month, day, parseInt(this.time2.split(":")[0]), parseInt(this.time2.split(":")[1]), 0, 0);
      if (this.time3 != "")
             timeNow3 = new Date(year, month, day, parseInt(this.time3.split(":")[0]), parseInt(this.time3.split(":")[1]), 0, 0);
      if (this.time4 != "")
         timeNow4 = new Date(year, month, day, parseInt(this.time4.split(":")[0]), parseInt(this.time4.split(":")[1]), 0, 0);
    }

    this.localNotifications.clearAll();
    this.localNotifications.schedule([
      {
        id: 1,
        title: 'Time to take your protein',
        text: "Don't forget to take your protein",
        trigger: { at: new Date(timeNow1) },
        smallIcon: "file://assets/imgs/proteins.png",
        icon: "res://icon",
      },
      {
        id: 2,
        title: 'Time to take your protein',
        text: "Don't forget to take your protein",
        trigger: { at: new Date(timeNow2) },
        smallIcon: "file://assets/imgs/proteins.png",
        icon: "res://icon",
      },
      {
        id: 3,
        title: 'Time to take your protein',
        text: "Don't forget to take your protein",
        trigger: { at: new Date(timeNow3) },
        icon: "res://icon",
        smallIcon: "file://assets/imgs/proteins.png"
      },
      {
        id: 4,
        title: 'Time to take your protein',
        text: "Don't forget to take your protein",
        trigger: { at: new Date(timeNow4) },
        icon: "res://icon",
        smallIcon: "file://assets/imgs/proteins.png"
      }
    ]);
  }
  private pad(s) { return (s < 10) ? '0' + s : s; }
  ionViewWillEnter(){
    this.createDbFile();

  }
	public refresh() {
		this.navCtrl.setRoot(this.navCtrl.getActive().component);
	}
}
