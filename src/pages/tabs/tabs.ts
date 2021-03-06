import { Component } from '@angular/core';

import { AboutPage } from '../about/about';
import { ContactPage } from '../contact/contact';
import { HomePage } from '../home/home';
import { ListPage } from '../list/list';
import { StatsPage } from '../stats/stats';
import { SettingsPage } from '../settings/settings';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tab1Root = HomePage;
  tab2Root = ListPage;
  tab3Root = StatsPage;
  tab4Root = SettingsPage;

  constructor() {

  }

}
