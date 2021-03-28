import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { HomePage } from '../home/home';
const DB_NAME: string = 'data.db';
@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  private db: SQLiteObject;
  items: any=[];
  constructor(public navCtrl: NavController, private sqlite: SQLite) {

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

  public getConsum() {
	 this.db.executeSql('select * from `consumption` where date_consum = date("now") order by date_consum desc, houre_consum desc', {})
      .then(res => {

	      if(res.rows.length>0) {
		      for(let i = 0; i < res.rows.length; i++) {
		      	//alert(res.rows.item(i).protein_consumed);
		      	var date = new Date(res.rows.item(i).date_consum);
		      	var options = { weekday: 'long', year: 'numeric',  month: 'long', day: 'numeric' };
		      	this.items.push([res.rows.item(i).food_name,res.rows.item(i).protein_consumed,date.toLocaleDateString('en-EN', options),res.rows.item(i).date_consum]);
		      }
	      }

      })
      .catch(e => alert("err 2 : "+e.message));
  }

  public removeCons(food_name, protein_consumed, date){
  	this.db.executeSql('DELETE FROM `consumption` where food_name = ? and protein_consumed = ? and date_consum = ?',[food_name,protein_consumed,date])
	      .then(() => {
	        /*var datef = new Date(date);
		    var options = { weekday: 'long', year: 'numeric',  month: 'long', day: 'numeric' };
	      	const index: number = this.items.indexOf([food_name,protein_consumed.toLocaleDateString('en-EN', options),datef,date]);
		    if (index !== -1) {
		        this.items.splice(index, 1);
		    }  */


		    this.navCtrl.setRoot(this.navCtrl.getActive().component);
		    //this.navCtrl.setRoot(HomePage);
		    //this.navCtrl.popToRoot();

	      })
	      .catch(e => console.log(e));
  }
  ionViewWillEnter(){
    this.items = [];
    this.createDbFile();
  }
  public refresh() {
		this.navCtrl.setRoot(this.navCtrl.getActive().component);
	}
}
