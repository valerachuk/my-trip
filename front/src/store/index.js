import Vue from 'vue';
import Vuex from 'vuex';
import locale from './modules/locale.store';
import recoveryPassword from './modules/recoveryPassword.store';
import auth from './modules/auth.store';
import trip from './modules/trip.store';
import dictionaries from './modules/dictionaries.store';
import waypoints from './modules/waypoints.store';
import userSettings from './modules/userSettings.store';
import userTickets from './modules/userTickets.store';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    locale,
    userSettings,
    trip,
    auth,
    userTickets,
    recoveryPassword,
    waypoints,
    dictionaries
  }
});
