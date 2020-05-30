/* eslint-disable */

import { VBreadcrumbs, VBtn, VIcon, VPagination, VSwitch, VTextField } from 'vuetify/lib';

import GoogleMapsApiLoader from 'google-maps-api-loader';
import { MmtTextInput } from '@components/';
import { mapSettings } from '@constants';

export default {
  components: {
    MmtTextInput,
    VPagination,
    VBreadcrumbs,
    VIcon,
    VBtn,
    VTextField,
    VSwitch
  },
  data () {
    return {
      showMap: true,
      markers: [],
      places: [],
      mapCenter: { lat: 48.459286, lng: 35.052698 },
      leisureTypes: [ 'restaurant' ],
      placesService: null,
      autocomplete: null,
      getNextPage: null,
      google: null,
      map: null,
      apiKey: 'AIzaSyDuiiLqO-HTj8vP0POPrsBGJdWc7esHdOY',
      radius: 1,
      paginationLength: 10,
      totalVisible: 9,
      page: 1
    };
  },
  computed: {
    mapConfig () {
      return {
        ...mapSettings,
        zoom: 13
      };
    }
  },
  methods: {
    async initializeMap () {
      this.google = await GoogleMapsApiLoader({
        libraries: [ 'places' ],
        apiKey: this.apiKey
      });

      this.map = new this.google.maps.Map(this.$refs['leisure-map'], this.mapConfig);
      this.placesService = new this.google.maps.places.PlacesService(this.map);

      const container = document.getElementById('leisure-autocomplete');
      this.autocomplete = new this.google.maps.places.Autocomplete(container);
      this.autocomplete.addListener('place_changed', this.onPlaceChanged);

      navigator.geolocation.getCurrentPosition(this.setMapCenter);
    },
    setMapCenter (position) {
      if (position) {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.mapCenter = pos;
        this.map.setCenter(this.mapCenter);
      } else {
        this.map.setCenter(this.mapCenter);
      }
      this.getNearbyPlaces(this.mapCenter);
    },
    onPlaceChanged () {
      const place = this.autocomplete.getPlace(),
            position = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            };
      if (place.geometry) {
        this.map.panTo(place.geometry.location);
        this.map.setZoom(15);
      }
      this.getNearbyPlaces(position);
    },
    async getNearbyPlaces (position) {
      const search = {
        bounds: this.map.getBounds(),
        types: this.leisureTypes,
        location: position,
        radius: this.radius * 1000,
        photo: null
      };

      this.placesService.nearbySearch(search, (results, status, pagination) =>
        this.nearbySearchCallback(results, status, pagination));
    },
    nearbySearchCallback (places, status, pagination) {
      this.clearMarkers();
      this.places = [];
      if (status === this.google.maps.places.PlacesServiceStatus.OK) {
        places.forEach((place, i) => {
          this.markers[i] = new this.google.maps.Marker({
            position: place.geometry.location,
            animation: this.google.maps.Animation.DROP
          });

          if (place.photos) {
            place.photos = place.photos[0].getUrl();
          }
          if (place.opening_hours) {
            if(place.opening_hours.open_now){
              place.opening_hours = this.$t('leisure.placeOpenState'); 
            } else {
              place.opening_hours = this.$t('leisure.placeCloseState'); 
            }
          }

          this.getNextPage = pagination.hasNextPage && function () {
            pagination.nextPage();
          };

          this.markers[i].placeResult = place;
          setTimeout(this.dropMarker(i), i * 100);
        });
        this.places = places;
      }
    },
    dropMarker (i) {
      const markers = this.markers,
            map = this.map;
      return function () {
        markers[i].setMap(map);
      };
    },
    clearMarkers () {
      for (let i = 0; i < this.markers.length; i++) {
        if (this.markers[i]) {
          this.markers[i].setMap(null);
        }
      }
      this.markers = [];
    },
    nextPage () {
      if (this.getNextPage) {
        this.getNextPage();
      }
    }
  },
  watch: {
    showMap (value) {
      if (value) {
        this.initializeMap();
      }
    }
  },
  filters: {
    isOpen (value) {
      return value ? 'Открыто' : 'Закрыто';
    },
    trimString (value) {
      return value.length > 15 ? value.substr(0, 15) + '...' : value;
    },
    opacityPrice (value) {
      if (value) {
        let str = '';
        for (let i = 0; i < value; i++) {
          str += '$';
        }
        return str;
      } else {
        return value;
      }
    },
    nonOpacityPrice (value) {
      if (value) {
        let str = '';
        for (let i = 0; i < 4 - value; i++) {
          str += '$';
        }
        return str;
      } else {
        return value;
      }
    }
  },
  async mounted () {
    await this.initializeMap();
  }
};
