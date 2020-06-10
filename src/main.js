import Vue from 'vue';
import App from './App.vue';
import router from './router';
import Buefy from 'buefy';
import { LMap, LTileLayer, LMarker, LGeoJson, LControlZoom } from 'vue2-leaflet';
import 'leaflet/dist/leaflet.css';
import 'verte/dist/verte.css';

Vue.config.productionTip = false

Vue.use(Buefy, {
  defaultIconPack: "unicons"
});
Vue.component('l-map', LMap);
Vue.component('l-tile-layer', LTileLayer);
Vue.component('l-marker', LMarker);
Vue.component('l-geo-json', LGeoJson);
Vue.component('l-control-zoom', LControlZoom);

Vue.prototype.$store = {
  cidades: {},
  franquias: [],
};

new Vue({
  router,
  render: h => h(App),
  created() {
    if (sessionStorage.redirect) {
        //console.log('redirect', sessionStorage.redirect);

        const redirect = sessionStorage.redirect;
        delete sessionStorage.redirect;

        this.$router.push(redirect);
    }
}
}).$mount('#app')