import { Component } from '@angular/core';
import {  NavController } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { AdMobFree, AdMobFreeBannerConfig, AdMobFreeInterstitialConfig } from '@ionic-native/admob-free';
import { Platform } from 'ionic-angular';
/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
const DB_NAME: string = 'data.db';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  private db: SQLiteObject;
  public goal = 0;
  public time1 = "";
  public time2 = "";
  public time3 = "";
  public time4 = "";

  public Protein_needed = "";
  public weight = "";
  public goal_physic = "";


  private createDbFile(): void {
  	this.sqlite.create({
	  name: DB_NAME,
	  location: 'default'
	})
	.then((db: SQLiteObject) => {
		this.db = db;
		this.db.executeSql('select * from `parametres`', {})
	      .then(res => {
	      	if(res.rows.length>0) {
		        this.goal = parseInt(res.rows.item(0).protein_goal);
		        this.time1 = res.rows.item(0).time1;
		        this.time2 = res.rows.item(0).time2;
		        this.time3 = res.rows.item(0).time3;
		        this.time4 = res.rows.item(0).time4;

		        this.weight = res.rows.item(0).weight;
		        this.goal_physic = res.rows.item(0).goal;


			    }

	      })
	      .catch(e => console.log(e));
    })
    .catch(e => console.log(e));
  }
  constructor(public navCtrl: NavController, private sqlite: SQLite, public admob: AdMobFree, platform: Platform) {
    platform.ready().then(() => {
      this.showAds();
    });
  }
  ionViewWillEnter(){
    this.createDbFile();
  }
  ionViewDidLoad() {

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

  }
  /*public saveGoal() {
  	 this.db.executeSql('DELETE FROM `parametres`',{})
	      .then(() => {
	      	this.db.executeSql('INSERT INTO `parametres` VALUES(?)',[this.goal])
		      .then(() => console.log('Executed SQL'))
		      .catch(e => console.log(e));
	      })
	      .catch(e => console.log(e));

  }*/
  public saveGoal() {
    try {
  	 this.db.executeSql('DELETE FROM `parametres`',{})
	      .then(() => {
	      	this.db.executeSql('INSERT INTO `parametres` VALUES(?,?,?,?,?,?,?)',[this.goal, this.time1, this.time2, this.time3, this.time4,this.weight,this.goal_physic])
		      .then(() => console.log('Executed SQL'))
		      .catch(e => console.log(e));
	      })
	      .catch(e => console.log(e));
        this.calculatNeededProtein();
      } catch(e) {
        console.log(e);
      }

  }

  public calculatNeededProtein() {
    let neededProt = 0;
    if(parseInt(this.weight) > 0 && this.goal_physic != ""){
      neededProt = Number(this.weight) * 2;
    }
    if(neededProt > 0){
      if(this.goal_physic == "fatloss"){
        neededProt += 19;
      }
      if(this.goal_physic == "maintenance"){
        neededProt += 3;
      }
      if(this.goal_physic == "muscleGainz"){
        neededProt += 28;
      }
      neededProt = neededProt * ((100 / Number(this.weight)) - 0.3);
    }

    if(neededProt > 0 && neededProt < 300){
      // this.Protein_needed = "Daily Recommended Protein " + parseInt(neededProt) + " g";
      // neededProt = neededProt.toFixed(0);
      this.Protein_needed = `Daily Recommended Protein ${(neededProt).toFixed(0)} g`;
    }
    else
      this.Protein_needed = "";
  }


}
