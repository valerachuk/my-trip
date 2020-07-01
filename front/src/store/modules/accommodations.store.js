import api from '@api';
import { PAGINTAION_ACCOMMODATION_PAGE_SIZE } from '@constants';

export default {
  namespaced: true,
  state: {
    accommodations: [],
    paginationInfo: {}
  },
  mutations: {
    SET_ACCOMODATIONS (state, accommodations) {
      state.accommodations = accommodations;
    },
    SET_PAGINATION_INFO (state, paginationInfo) {
      state.paginationInfo = paginationInfo;
    }
  },
  actions: {
    async fetchAccommodations ({ commit }, pageNumber) {
      await api.get('/accommodations', { pageNumber, pageSize: PAGINTAION_ACCOMMODATION_PAGE_SIZE })
        .then(r => {
          const { data, ...rest } = r.data;
          commit('SET_ACCOMODATIONS', data);
          commit('SET_PAGINATION_INFO', rest);
        });
    },
    getAccommodation ({ commit }, id) {
      return api.get(`/accommodations/${id}`);
    },
    addOrUpdateAccommodation ({ commit }, formData) {
      return api.post('/accommodations', formData);
    },
    uploadFile ({ commit }, formData) {
      return api.post('/assets/accommodation', formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
    },
    deleteFile ({ commit }, fileName) {
      return api.delete(`/assets/accommodation/${fileName}`);
    }
  }
};
